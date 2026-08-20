import React from 'react';
import { ChefHat } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-600">
          <ChefHat size={28} strokeWidth={2.5} />
          <h1 className="text-xl font-bold tracking-tight">
            ระบบจัดซื้อ <span className="text-gray-400 text-sm font-normal">v0.1</span>
          </h1>
        </div>
        {/* Desktop Navigation (Hidden on mobile) */}
        <div className="hidden sm:flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('record')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'record' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            บันทึกรายการ
          </button>
          <button 
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            สรุปยอด
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            วิเคราะห์รายตัว
          </button>
        </div>
      </div>
    </header>
  );
}
