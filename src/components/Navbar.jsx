import React from 'react';
import { Shield, Flame, Coins, Volume2, VolumeX, Download, RefreshCw, Sparkles, Award } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { getRankTier, calculateLevel } from '../utils/rpgEngine';
import { exportDataAsJSON } from '../utils/storage';

export default function Navbar({ userData, setUserData, isMuted, setIsMuted, onOpenLevelUp }) {
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
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
              title={isMuted ? "Unmute sound FX" : "Mute sound FX"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => exportDataAsJSON(userData)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition hidden sm:flex"
              title="Export backup data (JSON)"
            >
              <Download className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
