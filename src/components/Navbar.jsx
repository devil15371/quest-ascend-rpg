import React, { useState } from 'react';
import { Shield, Flame, Coins, Volume2, VolumeX, Download, Sparkles, Smartphone, Save, X } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { getRankTier, calculateLevel } from '../utils/rpgEngine';
import { exportDataAsJSON } from '../utils/storage';

export default function Navbar({ userData, setUserData, isMuted, setIsMuted, onOpenLevelUp }) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const levelInfo = calculateLevel(userData.profile.totalExp);
  const rank = getRankTier(levelInfo.level);

  const toggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const isRestDayActive = userData.profile.restDayActiveUntil && new Date(userData.profile.restDayActiveUntil) >= new Date();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-200 to-cyan-400 text-lg sm:text-xl">
                QUEST ASCEND
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50">
                GATE & LIFE RPG
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Gamified Exam Prep & Daily Hero Arc</p>
          </div>
        </div>

        {/* Hero Quick Stats */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          {/* Level & Rank Badge */}
          <div 
            onClick={onOpenLevelUp}
            className={`cursor-pointer px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all hover:scale-105 ${rank.color}`}
            title="Click to view Level Up stats & rank progress"
          >
            <span className="text-base">{rank.badge}</span>
            <div>
              <div className="text-xs font-black tracking-wide flex items-center gap-1">
                <span>LVL {levelInfo.level}</span>
                <span className="opacity-75">• {rank.name}</span>
              </div>
              <div className="w-24 bg-slate-950/60 rounded-full h-1.5 mt-0.5 overflow-hidden border border-slate-700/50">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-500" 
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gold Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 font-bold text-xs shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>{userData.profile.gold} Gold</span>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 font-bold text-xs">
            <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>{userData.profile.streak} Days</span>
          </div>

          {/* Rest Day Shield Indicator */}
          {isRestDayActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-medium text-xs">
              <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Rest Shield Active</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 relative">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
              title={isMuted ? "Unmute sound FX" : "Mute sound FX"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Download Options Button */}
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-purple-500/20"
              title="Download Options"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Get App / Backup</span>
            </button>

            {/* Download Modal Dropdown */}
            {showDownloadMenu && (
              <div className="absolute top-12 right-0 w-72 glass-panel p-4 rounded-2xl border border-purple-500/40 shadow-2xl z-50 bg-slate-950/95 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase text-purple-400 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Downloads & Save Data
                  </span>
                  <button onClick={() => setShowDownloadMenu(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Option 1: Direct APK Download */}
                <a
                  href="./QuestAscend.apk"
                  download="QuestAscend.apk"
                  onClick={() => setShowDownloadMenu(false)}
                  className="p-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 flex items-center gap-3 transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-purple-300">
                      📲 Download Android App (.apk)
                    </span>
                    <span className="text-[10px] text-slate-400">Direct mobile APK installer file</span>
                  </div>
                </a>

                {/* Option 2: Export JSON Save Data */}
                <button
                  onClick={() => {
                    exportDataAsJSON(userData);
                    setShowDownloadMenu(false);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-3 transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400">
                    <Save className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-indigo-300">
                      💾 Backup RPG Save Data (.json)
                    </span>
                    <span className="text-[10px] text-slate-400">Export your levels, stats & progress</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
