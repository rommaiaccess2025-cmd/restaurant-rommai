import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import RecordView from './components/RecordView';
import SummaryView from './components/SummaryView';
import AnalyticsView from './components/AnalyticsView';
import { supabase } from './supabaseClient'; 

export default function App() {
  // -----------------------------------------
  // 1. STATE MANAGEMENT
  // -----------------------------------------
  const [activeTab, setActiveTab] = useState('record'); 
  
  // อัปเดต Document Title ตามเมนูที่เลือก
  useEffect(() => {
    const pageTitles = {
      'record': 'บันทึกรายการ | ระบบจัดซื้อร้านร่มไม้',
      'summary': 'สรุปยอด | ระบบจัดซื้อร้านร่มไม้',
      'analytics': 'วิเคราะห์รายตัว | ระบบจัดซื้อร้านร่มไม้'
    };
    document.title = pageTitles[activeTab] || 'ระบบจัดซื้อ | ร้านร่มไม้';
  }, [activeTab]);

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    date: today,
    billNumber: '',
    name: '',
    quantity: '',
    unit: 'กก.',
    price: ''
  });

  // State สำหรับการกรองหน้าสรุปผล (แบบเดือน หรือ แบบปี)
  const currentYear = today.substring(0, 4); 
  const currentMonth = today.substring(0, 7); 
  const [filterMode, setFilterMode] = useState('month'); // 'month' | 'year'
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(currentMonth);

  // -----------------------------------------
  // 2. SUPABASE INTEGRATION
  // -----------------------------------------
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('date', { ascending: false }) 
      .order('created_at', { ascending: false }); 

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.price) return;

    const newEntry = {
      date: formData.date,
      billNumber: formData.billNumber || null,
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      price: parseFloat(formData.price)
    };

    const { data, error } = await supabase
      .from('purchases')
      .insert([newEntry])
      .select();

    if (error) {
      console.error('Error inserting data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      return;
    }

    if (data && data.length > 0) {
      setEntries([data[0], ...entries]); 
    }
    
    setFormData(prev => ({
      ...prev,
      name: '',
      quantity: '',
      price: ''
    }));
  };

  const handleDelete = async (id) => {
    if(!window.confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) return;

    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting data:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    } else {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  // -----------------------------------------
  // 3. SUMMARY CALCULATION
  // -----------------------------------------
  const summaryData = useMemo(() => {
    // กรองตามโหมด เดือน หรือ ปี
    const filtered = entries.filter(entry => {
      if (filterMode === 'month') return entry.date.startsWith(filterMonth);
      return entry.date.startsWith(filterYear); // โหมดปี
    });

    const totalExpense = filtered.reduce((sum, item) => sum + item.price, 0);

    const groupedItems = filtered.reduce((acc, item) => {
      // สร้าง Key โดยใช้ ชื่อ + หน่วย (เพื่อแยก เช่น หมูสับ กก. กับ หมูสับ แพ็ค ไม่ให้รวมกัน)
      const key = `${item.name}-${item.unit}`;
      if (!acc[key]) {
        acc[key] = { 
          id: key, 
          name: item.name, 
          unit: item.unit, 
          totalQty: 0, 
          totalCost: 0, 
          purchaseCount: 0,
          history: [] // เก็บประวัติสำหรับกราฟแนวโน้ม
        };
      }
      acc[key].totalQty += item.quantity;
      acc[key].totalCost += item.price;
      acc[key].purchaseCount += 1;
      
      // บันทึกราคาเฉลี่ย ณ วันนั้น เพื่อดูกราฟ
      acc[key].history.push({
        date: item.date,
        pricePerUnit: item.quantity > 0 ? (item.price / item.quantity) : 0
      });

      return acc;
    }, {});

    const sortedGroupedItems = Object.values(groupedItems).map(item => ({
      ...item,
      avgPricePerUnit: item.totalQty > 0 ? (item.totalCost / item.totalQty) : 0,
      // เรียงประวัติตามวันที่จากอดีต->ปัจจุบัน สำหรับกราฟเส้น
      history: item.history.sort((a, b) => new Date(a.date) - new Date(b.date))
    })).sort((a, b) => b.totalCost - a.totalCost); // เรียงตามยอดจ่ายรวม

    // จัดกลุ่มตามบิล
    const groupedByBill = filtered.reduce((acc, item) => {
      // ถ้าไม่มีเลขที่บิล ให้จับกลุ่มตามวันที่แทน เพื่อไม่ให้ไปรวมกันมั่ว
      const billKey = item.billNumber || `NO_BILL_${item.date}`; 
      if (!acc[billKey]) {
        acc[billKey] = {
          id: billKey,
          billNumber: item.billNumber || 'ไม่มีเลขที่บิล',
          date: item.date,
          totalCost: 0,
          items: []
        };
      }
      acc[billKey].totalCost += item.price;
      acc[billKey].items.push(item);
      return acc;
    }, {});

    const sortedBills = Object.values(groupedByBill).sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      totalExpense,
      items: sortedGroupedItems,
      bills: sortedBills,
    };
  }, [entries, filterMode, filterMonth, filterYear]);

  // -----------------------------------------
  // 4. RENDER UI
  // -----------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {activeTab === 'record' && (
              <RecordView 
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                entries={entries}
                handleDelete={handleDelete}
              />
            )}

            {activeTab === 'summary' && (
              <SummaryView 
                filterMode={filterMode} setFilterMode={setFilterMode}
                filterYear={filterYear} setFilterYear={setFilterYear}
                filterMonth={filterMonth} setFilterMonth={setFilterMonth}
                summaryData={summaryData}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView entries={entries} />
            )}
          </>
        )}
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <style dangerouslySetInnerHTML={{__html: `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}} />
    </div>
  );
}
