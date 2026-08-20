import React, { useState } from 'react';
import { List, TrendingUp, Search, BarChart3, LineChart as LineChartIcon, ArrowLeft, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

export default function SummaryView({ 
  filterMode, setFilterMode, 
  filterYear, setFilterYear, 
  filterMonth, setFilterMonth, 
  summaryData 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'graph' | 'trend'
  const [selectedItem, setSelectedItem] = useState(null); // สำหรับกราฟแนวโน้มเฉพาะรายการ
  const [expandedBills, setExpandedBills] = useState({}); // เก็บสถานะการเปิด/ปิดดูรายละเอียดบิล

  const filteredItems = summaryData.items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const graphData = filteredItems.slice(0, 10).map(item => ({
    name: `${item.name} (${item.unit})`,
    'ยอดใช้จ่าย': item.totalCost,
  }));

  // สร้างรายการ ปี สำหรับ Dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  // ฟังก์ชันสำหรับเปิดกราฟแนวโน้มรายตัว
  const openTrendView = (item) => {
    setSelectedItem(item);
    setViewMode('trend');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Banner & Filter */}
      <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <TrendingUp size={120} className="absolute -right-6 -bottom-6 text-white opacity-10" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative z-10">
          <div>
            <label className="block text-orange-100 text-sm mb-2 font-medium">ดูรายงานแบบ</label>
            <div className="flex bg-white/20 p-1 rounded-lg self-start">
              <button 
                onClick={() => setFilterMode('month')} 
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterMode === 'month' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-50 hover:bg-white/10'}`}
              >
                ประจำเดือน
              </button>
              <button 
                onClick={() => setFilterMode('year')} 
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterMode === 'year' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-50 hover:bg-white/10'}`}
              >
                ประจำปี
              </button>
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-orange-100 text-sm mb-2 font-medium">
              {filterMode === 'month' ? 'เลือกเดือน/ปี' : 'เลือกปี'}
            </label>
            {filterMode === 'month' ? (
              <input 
                type="month" 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full bg-white border-0 text-gray-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
              />
            ) : (
              <select 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full bg-white border-0 text-gray-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium">รวมค่าวัตถุดิบทั้งหมด</p>
          <div className="text-4xl font-bold mt-1 flex items-baseline gap-1">
            <span className="text-2xl">฿</span>
            {summaryData.totalExpense.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
          </div>
        </div>
      </div>

      {/* Controls: Search and Toggle View */}
      {viewMode !== 'trend' && (
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อวัตถุดิบ (เช่น หมู, ผัก)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm shadow-sm"
            />
          </div>
          <div className="flex bg-gray-200 p-1 rounded-xl self-start sm:self-auto shrink-0 shadow-inner">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${viewMode === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={16} /> รายการ
            </button>
            <button 
              onClick={() => setViewMode('bill')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${viewMode === 'bill' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Receipt size={16} /> บิล
            </button>
            <button 
              onClick={() => setViewMode('graph')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${viewMode === 'graph' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BarChart3 size={16} /> ภาพรวม
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {viewMode === 'list' && (
          <>
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <List size={18} className="text-orange-500" />
                สรุปแยกตามวัตถุดิบและหน่วย
              </h3>
              <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                {filteredItems.length} ประเภท
              </span>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">
                          {item.name} <span className="text-gray-400 font-normal text-xs">({item.unit})</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          รวม {item.totalQty.toLocaleString()} {item.unit} (ซื้อ {item.purchaseCount} ครั้ง)
                        </p>
                        <p className="text-[11px] font-medium text-orange-600 mt-1 bg-orange-50 inline-block px-1.5 py-0.5 rounded border border-orange-100">
                          เฉลี่ย ฿{item.avgPricePerUnit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})} / {item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div>
                        <p className="font-bold text-gray-800">฿{item.totalCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
                        <p className="text-xs text-gray-400">
                          {summaryData.totalExpense > 0 ? ((item.totalCost / summaryData.totalExpense) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                      <button 
                        onClick={() => openTrendView(item)}
                        className="text-[10px] sm:text-xs font-medium text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <LineChartIcon size={12} /> กราฟแนวโน้ม
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-2">
                  <Search size={32} className="text-gray-300" />
                  <p>ไม่พบรายการวัตถุดิบที่ค้นหา</p>
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === 'bill' && (
          <>
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Receipt size={18} className="text-orange-500" />
                สรุปแยกตามเลขที่บิล
              </h3>
              <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                {summaryData.bills.length} บิล
              </span>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {summaryData.bills.length > 0 ? (
                summaryData.bills.map((bill) => (
                  <div key={bill.id} className="flex flex-col">
                    {/* Bill Header */}
                    <div 
                      className="p-4 flex items-center justify-between hover:bg-orange-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedBills(prev => ({ ...prev, [bill.id]: !prev[bill.id] }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-sm border border-orange-200">
                          <Receipt size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                            {bill.billNumber}
                            {bill.id.startsWith('NO_BILL') && (
                              <span className="text-[10px] font-normal bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                รวมรายการที่ไม่ได้ระบุบิล
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            วันที่: {new Date(bill.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric'})} • {bill.items.length} รายการ
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className="font-bold text-orange-600">฿{bill.totalCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
                        {expandedBills[bill.id] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </div>
                    </div>
                    
                    {/* Bill Items (Expanded) */}
                    {expandedBills[bill.id] && (
                      <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="text-gray-500 border-b border-gray-200">
                              <th className="pb-2 font-medium">รายการ</th>
                              <th className="pb-2 font-medium text-right">จำนวน</th>
                              <th className="pb-2 font-medium text-right">ราคา</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bill.items.map(item => (
                              <tr key={item.id}>
                                <td className="py-2 text-gray-700">{item.name}</td>
                                <td className="py-2 text-gray-600 text-right">{item.quantity} {item.unit}</td>
                                <td className="py-2 text-gray-800 font-medium text-right">฿{item.price.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-2">
                  <Receipt size={32} className="text-gray-300" />
                  <p>ไม่มีข้อมูลบิลในช่วงเวลานี้</p>
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === 'graph' && (
          <div className="p-6">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-orange-500" />
              ภาพรวมค่าใช้จ่าย (10 อันดับแรก)
            </h3>
            
            {graphData.length > 0 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" tickFormatter={(val) => `฿${val.toLocaleString()}`} tick={{fontSize: 12, fill: '#6b7280'}} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} />
                    <RechartsTooltip 
                      formatter={(value) => ['฿' + value.toLocaleString(), 'ยอดใช้จ่าย']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{fill: '#fff7ed'}}
                    />
                    <Bar dataKey="ยอดใช้จ่าย" radius={[0, 4, 4, 0]} barSize={20}>
                      {graphData.map((entry, index) => {
                        const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444', '#6366f1', '#84cc16'];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-400">
                ไม่มีข้อมูลสำหรับสร้างกราฟ
              </div>
            )}
          </div>
        )}

        {viewMode === 'trend' && selectedItem && (
          <div className="p-6">
            <button 
              onClick={() => setViewMode('list')}
              className="mb-4 text-sm font-medium text-gray-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={16} /> กลับไปหน้ารายการ
            </button>
            
            <div className="mb-6 pb-4 border-b border-gray-100 flex justify-between items-end">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{selectedItem.name}</h3>
                <p className="text-sm text-gray-500">
                  กราฟแนวโน้มราคาเฉลี่ยต่อ {selectedItem.unit}
                </p>
              </div>
              <div className="text-right bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                <p className="text-[10px] text-orange-600 font-medium">ราคาเฉลี่ยรวม</p>
                <p className="text-base font-bold text-orange-700">฿{selectedItem.avgPricePerUnit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
              </div>
            </div>
            
            {selectedItem.history.length > 0 ? (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedItem.history} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPrice2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('th-TH', {day: 'numeric', month: 'short'})}
                      tick={{fontSize: 12, fill: '#6b7280'}} 
                      dy={10}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tickFormatter={(val) => `฿${val}`}
                      tick={{fontSize: 12, fill: '#6b7280'}} 
                    />
                    <RechartsTooltip 
                      labelFormatter={(val) => new Date(val).toLocaleDateString('th-TH', {year: 'numeric', month: 'long', day: 'numeric'})}
                      formatter={(value) => ['฿' + value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}), 'ราคาต่อหน่วย']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pricePerUnit" 
                      stroke="#f97316" 
                      fillOpacity={1} 
                      fill="url(#colorPrice2)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-400">
                ไม่มีข้อมูลประวัติราคาเพียงพอ
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
