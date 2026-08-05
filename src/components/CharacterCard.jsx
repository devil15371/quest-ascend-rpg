import React, { useState } from 'react';
import { Shield, Zap, BookOpen, Brain, Target, Sun, Edit2, Check, Sparkles, Cpu, Award } from 'lucide-react';
import { calculateLevel, getRankTier, isEarlyBirdTime } from '../utils/rpgEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function CharacterCard({ userData, setUserData }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userData.profile.name);

  const levelInfo = calculateLevel(userData.profile.totalExp);
  const rank = getRankTier(levelInfo.level);

  const isRestDayActive = userData.profile.restDayActiveUntil && new Date(userData.profile.restDayActiveUntil) >= new Date();
  const restPassCount = userData.inventory.find(i => i.type === 'REST_PASS')?.count || 0;

  const saveName = () => {
    if (tempName.trim()) {
      setUserData(prev => ({
        ...prev,
        profile: { ...prev.profile, name: tempName.trim() }
      }));
    }
    setIsEditingName(false);
  };

  const useRestDayPass = () => {
    if (restPassCount <= 0) return;

    audio.playBuy();
    triggerHapticFeedback('heavy');
    const restUntil = new Date(Date.now() + 86400000).toISOString();

    setUserData(prev => {
      const updatedInv = prev.inventory.map(item => 
        item.type === 'REST_PASS' ? { ...item, count: item.count - 1 } : item
      ).filter(item => item.count > 0);

      return {
        ...prev,
        profile: {
          ...prev.profile,
          restDayActiveUntil: restUntil
        },
        inventory: updatedInv,
        activityLogs: [
          {
            id: 'log_' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'BUFF',
            description: 'Activated 🛡️ 24-Hour Rest Day Shield',
            expGained: 0,
            timestamp: Date.now()
          },
          ...prev.activityLogs
        ]
      };
    });
  };

  return (
    <div className="cyber-panel rounded-2xl p-5 sm:p-6 border border-cyan-500/30 relative overflow-hidden shadow-2xl bg-slate-950/80 cyber-hud-brackets">
      {/* Background Energy Grid Blur */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        
        {/* Avatar & Hero Identity */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {/* Pulsing Holographic Ring */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-70 blur-sm group-hover:opacity-100 transition animate-radar-pulse" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-2 border-cyan-400/80 flex items-center justify-center text-3xl sm:text-4xl shadow-xl relative z-10">
              {userData.profile.avatar}
            </div>
            <span className="absolute -bottom-1 -right-1 z-20 bg-slate-900 border border-cyan-400/60 text-xs px-1.5 py-0.5 rounded-md shadow">
              {rank.badge}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-slate-900 border border-cyan-500 rounded-lg px-2.5 py-1 text-sm font-orbitron font-bold text-white focus:outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={saveName} 
                    className="p-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-orbitron font-black tracking-wider text-white">
                    {userData.profile.name}
                  </h2>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-cyan-300 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2 mt-1.5">
              <span className="text-xs font-orbitron font-semibold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/40">
                {userData.profile.activeTitle || "Novice Scholar"}
              </span>
              <span className={`text-xs font-orbitron px-2.5 py-0.5 rounded font-bold ${rank.color}`}>
                {rank.name}
              </span>
            </div>
          </div>
        </div>

        {/* Level Energy Arc Reactor Progress */}
        <div className="w-full md:w-80">
          <div className="flex justify-between items-center text-xs font-orbitron font-semibold mb-1.5">
            <span className="text-cyan-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              LVL {levelInfo.level} Energy Matrix
            </span>
            <span className="text-purple-300 font-mono">
              {levelInfo.currentLevelExp} / {levelInfo.nextLevelNeeded} EXP
            </span>
          </div>

          <div className="w-full bg-slate-900/90 rounded-full h-3.5 p-0.5 border border-slate-700/80 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 shadow-md shadow-cyan-500/50 relative"
              style={{ width: `${levelInfo.progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </div>
          </div>

          {/* Buff Indicators & Rest Pass Action */}
          <div className="flex items-center justify-between gap-2 mt-3 text-xs">
            <div className="flex items-center gap-2">
              {isEarlyBirdTime() && (
                <span className="px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-rajdhani font-semibold flex items-center gap-1 animate-pulse">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> +25% Early Bird
                </span>
              )}

              {isRestDayActive ? (
                <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-rajdhani font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Shield Active
                </span>
              ) : (
                <span className="text-slate-400 font-rajdhani">No penalty freeze</span>
              )}
            </div>

            {!isRestDayActive && restPassCount > 0 && (
              <button
                onClick={useRestDayPass}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 font-orbitron font-bold flex items-center gap-1 transition active:scale-95 shadow-md shadow-emerald-500/20"
                title={`Use 1 Rest Pass (${restPassCount} remaining)`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Use Rest Pass ({restPassCount})
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Cybernetic Stat Nodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
        
        {/* INT */}
        <div className="bg-slate-900/70 rounded-xl p-3 border border-blue-500/30 flex items-center gap-3 hover:border-blue-400/60 transition">
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider">INT (Matrix)</div>
            <div className="text-base font-orbitron font-black text-blue-300">{userData.profile.stats.int}</div>
          </div>
        </div>

        {/* WIS */}
        <div className="bg-slate-900/70 rounded-xl p-3 border border-purple-500/30 flex items-center gap-3 hover:border-purple-400/60 transition">
          <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider">WIS (Memory)</div>
            <div className="text-base font-orbitron font-black text-purple-300">{userData.profile.stats.wis}</div>
          </div>
        </div>

        {/* DEX */}
        <div className="bg-slate-900/70 rounded-xl p-3 border border-emerald-500/30 flex items-center gap-3 hover:border-emerald-400/60 transition">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider">DEX (Tactical)</div>
            <div className="text-base font-orbitron font-black text-emerald-300">{userData.profile.stats.dex}</div>
          </div>
        </div>

        {/* VIT */}
        <div className="bg-slate-900/70 rounded-xl p-3 border border-amber-500/30 flex items-center gap-3 hover:border-amber-400/60 transition">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider">VIT (Overcharge)</div>
            <div className="text-base font-orbitron font-black text-amber-300">{userData.profile.stats.vit}</div>
          </div>
        </div>

      </div>

    </div>
  );
}
