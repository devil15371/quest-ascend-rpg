import React from 'react';
import { BookOpen, Calendar, ShoppingBag, History } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const handleTabClick = (tabId) => {
    audio.playClick();
    triggerHapticFeedback('light');
    setActiveTab(tabId);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 px-3 py-2 pb-safe shadow-2xl bg-slate-950/90 backdrop-blur-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* GATE Prep */}
        <button
          onClick={() => handleTabClick('subjects')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'subjects' ? 'text-purple-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Prep</span>
        </button>

        {/* Quests */}
        <button
          onClick={() => handleTabClick('quests')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'quests' ? 'text-purple-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Quests</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => handleTabClick('shop')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'shop' ? 'text-purple-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Shop</span>
        </button>

        {/* History */}
        <button
          onClick={() => handleTabClick('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'history' ? 'text-purple-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">History</span>
        </button>

      </div>
    </div>
  );
}
