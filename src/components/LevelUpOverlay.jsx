import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Zap, Sparkles, X, ChevronRight, ShieldCheck } from 'lucide-react';
import { calculateLevel, getRankTier } from '../utils/rpgEngine';
import { audio } from '../utils/audioEngine';

export default function LevelUpOverlay({ isOpen, onClose, userData }) {
  const levelInfo = calculateLevel(userData.profile.totalExp);
  const rank = getRankTier(levelInfo.level);

  useEffect(() => {
    if (isOpen) {
      audio.playLevelUp();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border-2 border-purple-500/60 shadow-2xl relative text-center overflow-hidden animate-level-pulse">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge Banner */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-1 shadow-2xl shadow-purple-500/40 my-3">
          <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
            {rank.badge}
          </div>
        </div>

        <span className="text-xs font-black tracking-widest uppercase text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60">
          LEVEL UP ACHIEVED!
        </span>

        <h2 className="text-3xl font-black text-white mt-2 mb-1">
          Level {levelInfo.level}
        </h2>
        <p className="text-sm font-bold text-cyan-300">
          Rank Status: <span className={rank.color}>{rank.name}</span>
        </p>

        {/* Stat Gains Summary */}
        <div className="my-5 bg-slate-950/70 rounded-2xl p-4 border border-slate-800 text-left space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Hero Stat Attributes
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-blue-400">🧠 INT (Lectures):</span>
              <span className="text-white">{userData.profile.stats.int}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-purple-400">📚 WIS (Revision):</span>
              <span className="text-white">{userData.profile.stats.wis}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-emerald-400">🎯 DEX (Questions):</span>
              <span className="text-white">{userData.profile.stats.dex}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-amber-400">⚡ VIT (Discipline):</span>
              <span className="text-white">{userData.profile.stats.vit}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-purple-500/25 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Continue Ascension</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
