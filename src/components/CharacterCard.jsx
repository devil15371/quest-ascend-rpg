import React from 'react';
import { calculateLevel } from '../utils/rpgEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';
import { Shield, Zap, Flame, Award, ChevronRight, Cpu } from 'lucide-react';

export default function CharacterCard({ userData, setUserData }) {
  const levelInfo = calculateLevel(userData.profile.totalExp);
  const realm = levelInfo.realm;

  return (
    <div className="cyber-panel p-5 sm:p-6 rounded-3xl border-2 border-cyan-500/40 bg-slate-950/85 cyber-hud-brackets shadow-2xl relative overflow-hidden font-orbitron">
      
      {/* Top Ambient Glow Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Avatar & Realm Badge */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-1 shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-4xl">
                {realm.badge}
              </div>
            </div>
            <span className="absolute -bottom-2 -right-1 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-black text-[10px] shadow">
              LVL {levelInfo.level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider">{userData.profile.name}</h2>
              <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900 border ${realm.border} ${realm.color}`}>
                {realm.name}
              </span>
            </div>
            <p className="text-xs font-rajdhani text-slate-400 mt-1">
              Cultivation Path: GATE CS & IT • Solved {userData.activityLogs.length} Quests
            </p>
          </div>
        </div>

        {/* Right: EXP Arc Bar & Stats */}
        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-cyan-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> EXP PROGRESS
            </span>
            <span className="text-slate-300 font-mono">
              {levelInfo.expInLevel} / {levelInfo.expNeeded} ({levelInfo.progressPercent}%)
            </span>
          </div>

          {/* Energy Matrix Bar */}
          <div className="w-full h-3.5 rounded-full bg-slate-900 border border-slate-800 p-0.5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-500 relative"
              style={{ width: `${levelInfo.progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-rajdhani text-slate-400 pt-0.5">
            <span>Next Realm Breakthrough at LVL {realm.maxLevel + 1}</span>
            <span className="text-amber-400 font-mono">🪙 {userData.profile.gold} Gold</span>
          </div>
        </div>

      </div>

      {/* Hero Stat Matrix Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800 text-xs font-orbitron font-bold">
        <div 
          onMouseEnter={() => audio.playHoverSound()}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-center justify-between hover:border-blue-400 transition"
        >
          <span className="text-blue-400">🧠 INT:</span>
          <span className="text-white font-mono">{userData.profile.stats.int}</span>
        </div>

        <div 
          onMouseEnter={() => audio.playHoverSound()}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 flex items-center justify-between hover:border-purple-400 transition"
        >
          <span className="text-purple-400">📚 WIS:</span>
          <span className="text-white font-mono">{userData.profile.stats.wis}</span>
        </div>

        <div 
          onMouseEnter={() => audio.playHoverSound()}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between hover:border-emerald-400 transition"
        >
          <span className="text-emerald-400">🎯 DEX:</span>
          <span className="text-white font-mono">{userData.profile.stats.dex}</span>
        </div>

        <div 
          onMouseEnter={() => audio.playHoverSound()}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between hover:border-amber-400 transition"
        >
          <span className="text-amber-400">⚡ VIT:</span>
          <span className="text-white font-mono">{userData.profile.stats.vit}</span>
        </div>
      </div>

    </div>
  );
}
