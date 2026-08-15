import React from 'react';
import { calculateLevel, calculateStatResonances, isCultivationBonusTime } from '../utils/rpgEngine';
import { safeNum } from '../utils/safeMath';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';
import { Shield, Zap, Flame, Award, ChevronRight, Cpu, Sun, Moon, Sparkles } from 'lucide-react';

export default function CharacterCard({ userData, setUserData }) {
  const currentExp = safeNum(userData?.profile?.totalExp, 150);
  const currentGold = safeNum(userData?.profile?.gold, 120);
  const cultivationWindow = userData?.profile?.cultivationWindow || 'EARLY_BIRD';
  const isBonusActive = isCultivationBonusTime(cultivationWindow);

  const levelInfo = calculateLevel(currentExp);
  const realm = levelInfo.realm;
  const heroStats = userData?.profile?.stats || { int: 45, wis: 30, dex: 25, vit: 20 };
  const perks = calculateStatResonances(heroStats);
  const equippedTitle = userData?.profile?.equippedTitle || '';
  const equippedAura = userData?.profile?.equippedAura || '';

  const handleToggleWindow = () => {
    audio.playClick();
    triggerHapticFeedback('medium');
    const nextWindow = cultivationWindow === 'EARLY_BIRD' ? 'NIGHT_OWL' : 'EARLY_BIRD';
    setUserData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        cultivationWindow: nextWindow
      }
    }));
  };

  return (
    <div className="cyber-panel p-5 sm:p-6 rounded-3xl border-2 border-cyan-500/40 bg-slate-950/85 cyber-hud-brackets shadow-2xl relative overflow-hidden font-orbitron">
      
      {/* Top Ambient Glow Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Avatar & Realm Badge */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-600 to-pink-500 p-1 shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition duration-300 ${equippedAura ? 'ring-4 ring-cyan-400/80 animate-pulse' : ''}`}>
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-4xl">
                {realm.badge}
              </div>
            </div>
            <span className="absolute -bottom-2 -right-1 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-black text-[10px] shadow">
              LVL {levelInfo.level}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider">
                {userData?.profile?.name || 'Hero Candidate'}
              </h2>
              <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900 border ${realm.border} ${realm.color}`}>
                {realm.name}
              </span>
              {equippedTitle && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 flex items-center gap-1 shadow-sm shadow-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {equippedTitle}
                </span>
              )}
            </div>
            <p className="text-xs font-rajdhani text-slate-400 mt-1">
              Cultivation Path: GATE CS & IT • Calibrated for top-rank readiness
            </p>
          </div>
        </div>

        {/* Right: EXP Arc Bar & Cultivation Window Pill */}
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

          <div className="flex justify-between items-center text-[11px] font-rajdhani text-slate-400 pt-0.5">
            <span>Breakthrough at LVL {realm.maxLevel + 1}</span>
            <span className="text-amber-400 font-mono font-bold">🪙 {currentGold} GOLD</span>
          </div>

          {/* Cultivation Window Selector */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 font-rajdhani">Peak Focus Window:</span>
            <button
              onClick={handleToggleWindow}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-orbitron font-bold flex items-center gap-1.5 transition active:scale-95 border ${
                cultivationWindow === 'EARLY_BIRD'
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-500/20'
                  : 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300 shadow-sm shadow-indigo-500/20'
              }`}
              title="Click to switch your +25% EXP bonus time window"
            >
              {cultivationWindow === 'EARLY_BIRD' ? (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Early Bird (5-9 AM)</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span>Night Owl (11PM-2AM)</span>
                </>
              )}
              {isBonusActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Hero Stat Matrix Nodes with Active Gameplay Perks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800 text-xs font-orbitron font-bold">
        <div 
          onMouseEnter={() => audio.playHoverSound()}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex flex-col justify-between hover:border-blue-400 transition"
          title={`INT Perk: +${perks.memoryDecayResistancePercent}% Ebbinghaus Decay Resistance`}
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-400">🧠 INT:</span>
            <span className="text-white font-mono">{safeNum(heroStats.int, 45)}</span>
          </div>
          <span className="text-[9px] font-rajdhani text-blue-300/80 mt-1">
            🛡️ +{perks.memoryDecayResistancePercent}% Memory Stability
          </span>
        </div>

        <div 
          onMouseEnter={() => audio.playHoverSound()}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 flex flex-col justify-between hover:border-purple-400 transition"
          title={`WIS Perk: +${perks.lectureExpBonusPercent}% Bonus Lecture EXP`}
        >
          <div className="flex items-center justify-between">
            <span className="text-purple-400">📚 WIS:</span>
            <span className="text-white font-mono">{safeNum(heroStats.wis, 30)}</span>
          </div>
          <span className="text-[9px] font-rajdhani text-purple-300/80 mt-1">
            ⚡ +{perks.lectureExpBonusPercent}% Lecture EXP
          </span>
        </div>

        <div 
          onMouseEnter={() => audio.playHoverSound()}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-400 transition"
          title={`DEX Perk: +${perks.pyqGoldBonusPercent}% Extra Gold from Practice PYQs`}
        >
          <div className="flex items-center justify-between">
            <span className="text-emerald-400">🎯 DEX:</span>
            <span className="text-white font-mono">{safeNum(heroStats.dex, 25)}</span>
          </div>
          <span className="text-[9px] font-rajdhani text-emerald-300/80 mt-1">
            🪙 +{perks.pyqGoldBonusPercent}% PYQ Gold
          </span>
        </div>

        <div 
          onMouseEnter={() => audio.playHoverSound()}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between hover:border-amber-400 transition"
          title={`VIT Perk: +${perks.purgeExpBonusPercent}% Focus Purge Session Bonus`}
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-400">⚡ VIT:</span>
            <span className="text-white font-mono">{safeNum(heroStats.vit, 20)}</span>
          </div>
          <span className="text-[9px] font-rajdhani text-amber-300/80 mt-1">
            🔥 +{perks.purgeExpBonusPercent}% Purge Focus EXP
          </span>
        </div>
      </div>

    </div>
  );
}
