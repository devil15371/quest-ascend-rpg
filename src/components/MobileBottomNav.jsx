import React from 'react';
import { BookOpen, Calendar, ShoppingBag, History, Brain } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const handleTabClick = (tabId) => {
    audio.playClick();
    triggerHapticFeedback('light');
    setActiveTab(tabId);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 cyber-panel border-t border-cyan-500/30 px-2 py-1.5 pb-safe shadow-2xl bg-slate-950/95 backdrop-blur-xl font-orbitron">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* GATE Prep */}
        <button
          onClick={() => handleTabClick('subjects')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'subjects' ? 'text-cyan-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[9px]">Prep</span>
        </button>

        {/* 3D Brain Matrix */}
        <button
          onClick={() => handleTabClick('brain')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'brain' ? 'text-cyan-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[9px]">Brain</span>
        </button>

        {/* Quests */}
        <button
          onClick={() => handleTabClick('quests')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'quests' ? 'text-cyan-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px]">Quests</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => handleTabClick('shop')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'shop' ? 'text-cyan-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[9px]">Shop</span>
        </button>

        {/* History */}
        <button
          onClick={() => handleTabClick('history')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'history' ? 'text-cyan-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[9px]">Logs</span>
        </button>

      </div>
    </div>
  );
}
