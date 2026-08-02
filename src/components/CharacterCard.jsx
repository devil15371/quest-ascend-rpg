import React, { useState } from 'react';
import { Shield, Zap, BookOpen, Brain, Target, Sun, Edit2, Check, Award } from 'lucide-react';
import { calculateLevel, getRankTier, isEarlyBirdTime } from '../utils/rpgEngine';
import { audio } from '../utils/audioEngine';

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
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left: Avatar & Hero Info */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-900 via-slate-900 to-indigo-900 border-2 border-purple-500/40 flex items-center justify-center text-3xl sm:text-4xl shadow-xl group-hover:scale-105 transition-all">
              {userData.profile.avatar}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 text-xs px-1.5 py-0.5 rounded-full shadow">
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
                    className="bg-slate-900 border border-purple-500/60 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={saveName} 
                    className="p-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white">
                    {userData.profile.name}
                  </h2>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-purple-300 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-800/40">
                {userData.profile.activeTitle || "Novice Scholar"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${rank.color}`}>
                {rank.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right: EXP Bar & Rest Day Action */}
        <div className="w-full md:w-80">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span className="text-slate-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Level {levelInfo.level} Progress
            </span>
            <span className="text-purple-300 font-mono">
              {levelInfo.currentLevelExp} / {levelInfo.nextLevelNeeded} EXP
            </span>
          </div>

          <div className="w-full bg-slate-900/90 rounded-full h-3 p-0.5 border border-slate-700/60 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-md shadow-purple-500/50"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>

          {/* Buff Indicators & Rest Pass trigger */}
          <div className="flex items-center justify-between gap-2 mt-3 text-xs">
            <div className="flex items-center gap-2">
              {isEarlyBirdTime() && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300 font-medium flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> +25% Early Bird
                </span>
              )}

              {isRestDayActive ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Shield Active
                </span>
              ) : (
                <span className="text-slate-400">No active penalty freeze</span>
              )}
            </div>

            {!isRestDayActive && restPassCount > 0 && (
              <button
                onClick={useRestDayPass}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1 transition"
                title={`Use 1 Rest Pass (${restPassCount} remaining)`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Use Rest Pass ({restPassCount})
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
        
        {/* INT */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">INT (Lectures)</div>
            <div className="text-base font-black text-blue-300">{userData.profile.stats.int}</div>
          </div>
        </div>

        {/* WIS */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">WIS (Revision)</div>
            <div className="text-base font-black text-purple-300">{userData.profile.stats.wis}</div>
          </div>
        </div>

        {/* DEX */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">DEX (Questions)</div>
            <div className="text-base font-black text-emerald-300">{userData.profile.stats.dex}</div>
          </div>
        </div>

        {/* VIT */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">VIT (Discipline)</div>
            <div className="text-base font-black text-amber-300">{userData.profile.stats.vit}</div>
          </div>
        </div>

      </div>

    </div>
  );
}
