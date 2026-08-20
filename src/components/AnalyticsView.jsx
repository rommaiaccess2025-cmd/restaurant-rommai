import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, TrendingDown, DollarSign, Activity, LineChart as LineChartIcon } from 'lucide-react';

export default function AnalyticsView({ entries }) {
  // หาชื่อวัตถุดิบทั้งหมดที่มีในระบบ (แยกตามชื่อและหน่วย)
  const uniqueItems = useMemo(() => {
    const map = new Map();
    entries.forEach(e => {
      const key = `${e.name}|${e.unit}`;
      if (!map.has(key)) map.set(key, { name: e.name, unit: e.unit });
    });
    return Array.from(map.values());
  }, [entries]);

  // กำหนดค่าเริ่มต้นเป็นวัตถุดิบตัวแรกในระบบ (ถ้ามี)
  const [selectedKey, setSelectedKey] = useState(
    uniqueItems.length > 0 ? `${uniqueItems[0].name}|${uniqueItems[0].unit}` : ''
  );

  // ดึงรายการปีทั้งหมดที่มีข้อมูล
  const availableYears = useMemo(() => {
    const years = new Set(entries.map(e => new Date(e.date).getFullYear()));
    if (years.size === 0) return [new Date().getFullYear()];
    return Array.from(years).sort((a, b) => b - a);
  }, [entries]);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // ตั้งค่าเริ่มต้นของปีให้เป็นปีล่าสุด
  useEffect(() => {
    if (!selectedYear && availableYears.length > 0) {
      setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

  // คำนวณสถิติและเตรียมข้อมูลกราฟสำหรับวัตถุดิบที่เลือก
  const itemStats = useMemo(() => {
    if (!selectedKey || entries.length === 0) return null;
    
    const [name, unit] = selectedKey.split('|');
    // กรองเอาเฉพาะวัตถุดิบที่เลือก + ตัวกรองปี/เดือน และเรียงวันที่จากอดีต -> ปัจจุบัน
    const itemEntries = entries
      .filter(e => e.name === name && e.unit === unit)
      .filter(e => {
        const d = new Date(e.date);
        const y = d.getFullYear().toString();
        const m = (d.getMonth() + 1).toString();
        
        if (selectedYear && selectedYear !== 'ALL' && y !== selectedYear) return false;
        if (selectedMonth !== 'ALL' && m !== selectedMonth) return false;
        
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (itemEntries.length === 0) return null;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalCost = 0;
    let totalQty = 0;
    
    const chartData = itemEntries.map(e => {
      const pricePerUnit = e.quantity > 0 ? e.price / e.quantity : 0;
      if (pricePerUnit < minPrice) minPrice = pricePerUnit;
      if (pricePerUnit > maxPrice) maxPrice = pricePerUnit;
      
      totalCost += e.price;
      totalQty += e.quantity;
      
      return {
        date: e.date,
        pricePerUnit,
        rawPrice: e.price,
        qty: e.quantity
      };
    });

    const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
    // หากมีข้อมูลแค่ 1 รายการ ให้ min/max เท่ากับค่าเฉลี่ย
    if (itemEntries.length === 1) {
      minPrice = avgPrice;
      maxPrice = avgPrice;
    }

    return {
      name, unit, minPrice, maxPrice, avgPrice, totalCost, totalQty, chartData, purchaseCount: itemEntries.length
    };
  }, [entries, selectedKey, selectedYear, selectedMonth]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Package size={48} className="text-gray-300 mb-4" />
        <p>ยังไม่มีข้อมูลในระบบ กรุณาบันทึกข้อมูลก่อน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* ส่วนควบคุม: เลือกวัตถุดิบ และ ตัวกรอง */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Activity className="text-orange-500" size={18} /> 
          เลือกวัตถุดิบและช่วงเวลาที่ต้องการวิเคราะห์
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* เลือกวัตถุดิบ */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 mb-2">วัตถุดิบ (Item)</label>
            <select 
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            >
              {uniqueItems.map(item => (
                <option key={`${item.name}|${item.unit}`} value={`${item.name}|${item.unit}`}>
                  {item.name} (หน่วย: {item.unit})
                </option>
              ))}
            </select>
          </div>
          
          {/* เลือกปี */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">ปี (Year)</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            >
              <option value="ALL">ทุกปี</option>
              {availableYears.map(year => (
                <option key={year} value={year.toString()}>ปี {year}</option>
              ))}
            </select>
          </div>
          
          {/* เลือกเดือน */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">เดือน (Month)</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            >
              <option value="ALL">ทุกเดือน</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={(i+1).toString()}>
                  {new Date(2000, i, 1).toLocaleDateString('th-TH', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!itemStats ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 mt-4">
          <p>ไม่มีข้อมูลสำหรับช่วงเวลาที่เลือก</p>
        </div>
      ) : (
        <>
          {/* ข้อมูลสถิติ (Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={14}/> ราคาเฉลี่ย</p>
              <p className="text-lg font-bold text-blue-600">฿{itemStats.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><TrendingDown size={14}/> ถูกสุดที่เคยซื้อ</p>
              <p className="text-lg font-bold text-green-600">฿{itemStats.minPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><TrendingUp size={14}/> แพงสุดที่เคยซื้อ</p>
              <p className="text-lg font-bold text-red-600">฿{itemStats.maxPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Package size={14}/> ซื้อมาแล้วทั้งหมด</p>
              <p className="text-lg font-bold text-orange-600">{itemStats.totalQty.toLocaleString()} <span className="text-xs font-normal">{itemStats.unit}</span></p>
            </div>
          </div>

          {/* กราฟแนวโน้มตลอดกาล */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
              <LineChartIcon size={18} className="text-orange-500" />
              กราฟความผันผวนของราคา (ต่อ {itemStats.unit})
            </h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={itemStats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value, name, props) => {
                      return [`฿${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`, 'ราคาต่อหน่วย'];
                    }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pricePerUnit" 
                    stroke="#f97316" // สีฟ้า
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
