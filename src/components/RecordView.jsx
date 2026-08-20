import React from 'react';
import { PlusCircle, Calendar, DollarSign, Receipt, Package, Clock } from 'lucide-react';

export default function RecordView({ formData, handleInputChange, handleSubmit, entries, handleDelete }) {
  
  // สกัดชื่อวัตถุดิบที่ไม่ซ้ำกันจากประวัติ เพื่อนำมาทำเป็นตัวเลือก (Autocomplete)
  const uniqueNames = [...new Set(entries.map(item => item.name))].filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Form Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Receipt className="text-orange-500" size={20} />
          จดบันทึกค่าใช้จ่ายใหม่
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* วันที่ */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">วันที่ซื้อ</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* เลขที่บิล (ถ้ามี) */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">เลขที่บิล (ไม่บังคับ)</label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="billNumber"
                  placeholder="เช่น INV-001, ใบเสร็จ..."
                  value={formData.billNumber || ''}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* ชื่อวัตถุดิบ */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อวัตถุดิบ</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="name"
                  list="ingredient-list"
                  placeholder="เช่น หมูสามชั้น, กะหล่ำปลี"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                  required
                />
                {/* HTML Datalist สำหรับทำ Autocomplete แนะนำชื่อวัตถุดิบที่มีอยู่แล้ว */}
                <datalist id="ingredient-list">
                  {uniqueNames.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* จำนวน */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">จำนวน</label>
              <input 
                type="number" 
                step="0.01"
                name="quantity"
                placeholder="0"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                required
              />
            </div>

            {/* หน่วย */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">หน่วย</label>
              <select 
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none appearance-none"
              >
                <option value="กก.">กก.</option>
                <option value="กรัม">กรัม</option>
                <option value="ลิตร">ลิตร</option>
                <option value="ขวด">ขวด</option>
                <option value="กำ/มัด">กำ/มัด</option>
                <option value="แพ็ค">แพ็ค</option>
                <option value="ชิ้น">ชิ้น</option>
                <option value="ลัง">ลัง</option>
              </select>
            </div>

            {/* ราคา */}
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">ราคา (บาท)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="number" 
                  step="0.5"
                  name="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <PlusCircle size={20} />
            บันทึกรายการ
          </button>
        </form>
      </div>

      {/* Recent Entries List */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">ประวัติการบันทึกล่าสุด</h3>
        <div className="space-y-3">
          {entries.slice(0, 5).map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  {entry.name}
                  {entry.billNumber && (
                    <span className="text-[10px] font-normal bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 whitespace-nowrap">
                      บิล: {entry.billNumber}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric'})} • {entry.quantity} {entry.unit}
                </span>
                {/* แสดงเวลาที่บันทึก (Timestamp) */}
                {entry.created_at && (
                  <span className="text-[10.5px] text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={12} /> 
                    บันทึกระบบเมื่อ: {new Date(entry.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-orange-600">
                  ฿{entry.price.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                </span>
                <button 
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-400 hover:text-red-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="ลบรายการ"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              ยังไม่มีรายการบันทึก
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
