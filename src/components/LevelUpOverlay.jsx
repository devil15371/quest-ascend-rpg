import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Zap, Sparkles, X, ChevronRight, ShieldCheck, Cpu } from 'lucide-react';
import { calculateLevel, getRankTier } from '../utils/rpgEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function LevelUpOverlay({ isOpen, onClose, userData }) {
  const levelInfo = calculateLevel(userData.profile.totalExp);
  const rank = getRankTier(levelInfo.level);

  useEffect(() => {
    if (isOpen) {
      audio.playLevelUp();
      triggerHapticFeedback('levelUp');
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#06b6d4', '#a855f7', '#ec4899', '#eab308']
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="cyber-panel max-w-md w-full rounded-3xl p-6 border-2 border-cyan-400 shadow-2xl relative text-center overflow-hidden animate-cyber-pulse cyber-hud-brackets bg-slate-950/95">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge Banner */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-400 via-purple-600 to-pink-500 p-1 shadow-2xl shadow-cyan-500/40 my-3 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-4xl">
            {rank.badge}
          </div>
        </div>

        <span className="text-xs font-orbitron font-black tracking-widest uppercase text-cyan-400 bg-cyan-950/90 px-3.5 py-1 rounded-full border border-cyan-500/60 shadow-lg shadow-cyan-500/30">
          LEVEL UP OVERCHARGE!
        </span>

        <h2 className="text-3xl font-orbitron font-black text-white mt-3 mb-1 tracking-wider">
          LEVEL {levelInfo.level}
        </h2>
        <p className="text-sm font-orbitron font-bold text-cyan-300">
          RANK STATUS: <span className={rank.color}>{rank.name}</span>
        </p>

        {/* Stat Gains Summary */}
        <div className="my-5 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-left space-y-2">
          <div className="text-xs font-orbitron font-bold text-slate-400 uppercase tracking-wider mb-2">
            Hero Stat Matrix
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-orbitron font-semibold">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-blue-500/30">
              <span className="text-blue-400">🧠 INT:</span>
              <span className="text-white font-mono">{userData.profile.stats.int}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-purple-500/30">
              <span className="text-purple-400">📚 WIS:</span>
              <span className="text-white font-mono">{userData.profile.stats.wis}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-emerald-500/30">
              <span className="text-emerald-400">🎯 DEX:</span>
              <span className="text-white font-mono">{userData.profile.stats.dex}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-amber-500/30">
              <span className="text-amber-400">⚡ VIT:</span>
              <span className="text-white font-mono">{userData.profile.stats.vit}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-slate-950 font-orbitron font-black text-xs tracking-widest uppercase shadow-xl shadow-cyan-500/30 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <span>CONTINUE ASCENSION</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
