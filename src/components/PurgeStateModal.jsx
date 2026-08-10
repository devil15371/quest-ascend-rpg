import React, { useState, useEffect } from 'react';
import { X, Flame, ShieldAlert, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function PurgeStateModal({ isOpen, onClose, userData, setUserData }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      audio.playLevelUp();
      triggerHapticFeedback('heavy');

      // Purge Heart Demons & reward user
      setUserData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          totalExp: prev.profile.totalExp + 150,
          gold: prev.profile.gold + 50,
          stats: {
            ...prev.profile.stats,
            vit: (prev.profile.stats.vit || 20) + 5
          }
        }
      }));
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleToggleTimer = () => {
    audio.playClick();
    triggerHapticFeedback('medium');
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in font-orbitron">
      <div className="cyber-panel max-w-md w-full rounded-3xl p-6 border-2 border-red-500/70 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets text-center">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-4 border-b border-red-900/60 pb-3">
          <Flame className="w-6 h-6 text-red-500 animate-pulse" />
          <h3 className="text-base font-black text-red-400 uppercase tracking-widest">HEART DEMON PURGE STATE</h3>
        </div>

        {!isCompleted ? (
          <div className="space-y-6 py-2">
            <p className="text-xs font-rajdhani text-slate-300">
              25-Minute Unbroken Focus Session to cleanse corrupted Heart Demon nodes from your 3D Brain Matrix.
            </p>

            {/* Countdown Clock Ring */}
            <div className="w-48 h-48 mx-auto rounded-full bg-slate-900 border-4 border-red-500/60 flex items-center justify-center shadow-2xl shadow-red-500/20 relative">
              <span className="text-4xl font-black text-white font-mono tracking-widest">
                {formattedTime}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleToggleTimer}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isActive ? 'PAUSE PURGE' : 'START PURGE TIMER'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <CheckCircle className="w-16 h-16 mx-auto text-emerald-400 animate-bounce" />
            <h3 className="text-xl font-black text-emerald-400">HEART DEMON PURGED!</h3>
            <p className="text-xs font-rajdhani text-slate-300">
              Your 3D Brain Matrix nodes have been cleansed of dark corruption. Deep focus restored!
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-mono text-emerald-300">
              +150 EXP • +50 Gold • +5 VIT (Vitality)
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase"
            >
              RETURN TO BRAIN MATRIX
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
