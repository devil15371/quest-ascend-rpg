import React, { useState } from 'react';
import { Shield, Flame, Coins, Volume2, VolumeX, Download, Sparkles, Smartphone, Save, X, Cpu } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { getRankTier, calculateLevel } from '../utils/rpgEngine';
import { exportDataAsJSON } from '../utils/storage';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function Navbar({ userData, setUserData, isMuted, setIsMuted, onOpenLevelUp }) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const levelInfo = calculateLevel(userData.profile.totalExp);
  const rank = getRankTier(levelInfo.level);

  const toggleMute = () => {
    triggerHapticFeedback('light');
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const isRestDayActive = userData.profile.restDayActiveUntil && new Date(userData.profile.restDayActiveUntil) >= new Date();

  return (
    <header className="sticky top-0 z-40 cyber-panel border-b border-cyan-500/30 px-4 lg:px-8 py-3 shadow-2xl bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Futuristic Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-orbitron font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 text-lg sm:text-xl">
                QUEST ASCEND
              </h1>
              <span className="text-[9px] font-orbitron font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20">
                CYBER RPG HUD
              </span>
            </div>
            <p className="text-[11px] font-rajdhani text-slate-400 hidden sm:block tracking-wide">
              SYSTEM v2.0 • GAMIFIED GATE & LIFE SYSTEM
            </p>
          </div>
        </div>

        {/* Hero Quick Stats HUD */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          
          {/* Level & Rank Badge */}
          <div 
            onClick={() => {
              triggerHapticFeedback('medium');
              onOpenLevelUp();
            }}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl border cyber-hud-brackets flex items-center gap-2.5 transition-all hover:scale-105 ${rank.color}`}
            title="Click to view Level Up stats & rank progress"
          >
            <span className="text-base">{rank.badge}</span>
            <div>
              <div className="text-xs font-orbitron font-bold tracking-wider flex items-center gap-1.5">
                <span className="text-cyan-300">LVL {levelInfo.level}</span>
                <span className="opacity-75 text-[11px]">• {rank.name}</span>
              </div>
              <div className="w-24 bg-slate-950/80 rounded-full h-1.5 mt-0.5 overflow-hidden border border-slate-700/60 p-0.5">
                <div 
                  className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 shadow-md shadow-cyan-500/50" 
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gold Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-orbitron font-bold text-xs shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>{userData.profile.gold} GOLD</span>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-orbitron font-bold text-xs">
            <Flame className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
            <span>{userData.profile.streak} STREAK</span>
          </div>

          {/* Rest Day Shield Indicator */}
          {isRestDayActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-rajdhani font-semibold text-xs">
              <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Shield Active</span>
            </div>
          )}

          {/* Controls Menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 relative">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
              title={isMuted ? "Unmute sound FX" : "Mute sound FX"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Download Options Button */}
            <button
              onClick={() => {
                triggerHapticFeedback('light');
                setShowDownloadMenu(!showDownloadMenu);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-orbitron font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-purple-500/20 active:scale-95"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">GET APP / BACKUP</span>
            </button>

            {/* Download Modal Dropdown */}
            {showDownloadMenu && (
              <div className="absolute top-12 right-0 w-72 cyber-panel p-4 rounded-2xl border border-cyan-500/50 shadow-2xl z-50 bg-slate-950/95 space-y-3 cyber-hud-brackets">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-orbitron font-black uppercase text-cyan-400 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Mobile Downloads & Save
                  </span>
                  <button onClick={() => setShowDownloadMenu(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct APK Download */}
                <a
                  href="./QuestAscend.apk"
                  download="QuestAscend.apk"
                  onClick={() => setShowDownloadMenu(false)}
                  className="p-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 flex items-center gap-3 transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-cyan-300">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-orbitron font-bold text-white block group-hover:text-cyan-300">
                      📲 Download Android APK (.apk)
                    </span>
                    <span className="text-[10px] font-rajdhani text-slate-400">Direct mobile installer file</span>
                  </div>
                </a>

                {/* Export Save Data */}
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
                    <span className="text-xs font-orbitron font-bold text-white block group-hover:text-indigo-300">
                      💾 Backup RPG Save Data (.json)
                    </span>
                    <span className="text-[10px] font-rajdhani text-slate-400">Export stats, level & progress</span>
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
