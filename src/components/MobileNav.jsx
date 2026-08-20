import React from 'react';
import { PlusCircle, TrendingUp, Activity } from 'lucide-react';

export default function MobileNav({ activeTab, setActiveTab }) {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-10">
      <div className="flex">
        <button 
          onClick={() => setActiveTab('record')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTab === 'record' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <PlusCircle size={20} className={activeTab === 'record' ? 'text-orange-600' : 'text-gray-400'} />
          บันทึก
        </button>
        <button 
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTab === 'summary' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <TrendingUp size={20} className={activeTab === 'summary' ? 'text-orange-600' : 'text-gray-400'} />
          สรุปยอด
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTab === 'analytics' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <Activity size={20} className={activeTab === 'analytics' ? 'text-orange-600' : 'text-gray-400'} />
          วิเคราะห์
        </button>
      </div>
    </nav>
  );
}
