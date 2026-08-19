import React from 'react';
import { calculateLevel, calculateStatResonances, isCultivationBonusTime } from '../utils/rpgEngine';
import { safeNum } from '../utils/safeMath';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';
import { Brain, BookOpen, Coins, Flame, Zap, Sun, Moon, Sparkles, Shield, Award } from 'lucide-react';

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
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Avatar & Realm Badge */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-slate-700/80 p-1 flex items-center justify-center text-3xl shadow-inner ${equippedAura ? 'ring-2 ring-cyan-400/80' : ''}`}>
              <span>{userData?.profile?.avatar || '🧙‍♂️'}</span>
            </div>
            <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-[10px] shadow">
              LVL {levelInfo.level}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {userData?.profile?.name || 'Hero Candidate'}
              </h2>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                {realm.name}
              </span>
              {equippedTitle && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-300 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  {equippedTitle}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Curriculum: GATE CS & IT • Adaptive Retention Matrix
            </p>
          </div>
        </div>

        {/* Right: EXP Arc Bar & Cultivation Window Pill */}
        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> EXP Progress
            </span>
            <span className="text-slate-400 font-mono text-[11px] tabular-nums">
              {levelInfo.expInLevel} / {levelInfo.expNeeded} ({levelInfo.progressPercent}%)
            </span>
          </div>

          {/* Energy Matrix Bar */}
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
            <span>Next Realm at LVL {realm.maxLevel + 1}</span>
            <span className="text-amber-400 font-mono font-bold tabular-nums">{currentGold} Gold</span>
          </div>

          {/* Cultivation Window Selector */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Focus Window:</span>
            <button
              onClick={handleToggleWindow}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition active:scale-95 border ${
                cultivationWindow === 'EARLY_BIRD'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Hero Stat Matrix Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
        <div 
          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          title={`INT Perk: +${perks.memoryDecayResistancePercent}% Ebbinghaus Decay Resistance`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-blue-400" /> INT:
            </span>
            <span className="text-white font-mono font-bold tabular-nums">{safeNum(heroStats.int, 45)}</span>
          </div>
          <span className="text-[10px] text-blue-300/90 font-mono mt-1">
            +{perks.memoryDecayResistancePercent}% Memory Stability
          </span>
        </div>

        <div 
          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          title={`WIS Perk: +${perks.lectureExpBonusPercent}% Bonus Lecture EXP`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" /> WIS:
            </span>
            <span className="text-white font-mono font-bold tabular-nums">{safeNum(heroStats.wis, 30)}</span>
          </div>
          <span className="text-[10px] text-purple-300/90 font-mono mt-1">
            +{perks.lectureExpBonusPercent}% Lecture EXP
          </span>
        </div>

        <div 
          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          title={`DEX Perk: +${perks.pyqGoldBonusPercent}% Extra Gold from Practice PYQs`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" /> DEX:
            </span>
            <span className="text-white font-mono font-bold tabular-nums">{safeNum(heroStats.dex, 25)}</span>
          </div>
          <span className="text-[10px] text-emerald-300/90 font-mono mt-1">
            +{perks.pyqGoldBonusPercent}% Practice Gold
          </span>
        </div>

        <div 
          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          title={`VIT Perk: +${perks.purgeExpBonusPercent}% Focus Purge Session Bonus`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> VIT:
            </span>
            <span className="text-white font-mono font-bold tabular-nums">{safeNum(heroStats.vit, 20)}</span>
          </div>
          <span className="text-[10px] text-amber-300/90 font-mono mt-1">
            +{perks.purgeExpBonusPercent}% Focus Stamina
          </span>
        </div>
      </div>

    </div>
  );
}
