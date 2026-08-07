import React, { useState } from 'react';
import { Volume2, VolumeX, Download, Sparkles, Trophy, Cpu, ChevronDown, Moon } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function Navbar({ userData, setUserData, isMuted, setIsMuted, onOpenLevelUp, onOpenNightReport }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    triggerHapticFeedback('light');
  };

  const handleExportData = () => {
    audio.playClick();
    triggerHapticFeedback('medium');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `QuestAscend_Save_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDropdownOpen(false);
  };

  return (
    <nav className="cyber-panel border-b border-cyan-500/30 px-4 py-3 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-40 font-orbitron">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-widest flex items-center gap-1.5">
              <span>QUESTASCEND</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">RPG</span>
            </h1>
            <p className="text-[10px] font-rajdhani text-slate-400 tracking-wider">GATE PREP & LIFE RPG SYSTEM</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Night Report Trigger Button */}
          <button
            onClick={onOpenNightReport}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 uppercase"
          >
            <Moon className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Night Report</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Dropdown Options */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-cyan-400 transition text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs font-orbitron space-y-1">
                <a
                  href="https://raw.githubusercontent.com/devil15371/quest-ascend-rpg/main/public/QuestAscend.apk"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-cyan-950/80 text-cyan-300 font-bold flex items-center gap-2"
                >
                  <span>📲 Download Android APK (.apk)</span>
                </a>
                <button
                  onClick={handleExportData}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300 flex items-center gap-2"
                >
                  <span>💾 Backup Save Data (.json)</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}
