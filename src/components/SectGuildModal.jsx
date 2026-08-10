import React, { useState } from 'react';
import { X, Shield, Users, Zap, Trophy, Flame } from 'lucide-react';
import { loadSectState, saveSectState } from '../utils/sectEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function SectGuildModal({ isOpen, onClose }) {
  const [sectState, setSectState] = useState(() => loadSectState());

  if (!isOpen) return null;

  const handleJoinSect = (sectId) => {
    audio.playLevelUp();
    triggerHapticFeedback('medium');
    const updated = { ...sectState, activeSectId: sectId };
    setSectState(updated);
    saveSectState(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in font-orbitron">
      <div className="cyber-panel max-w-lg w-full rounded-3xl p-6 border-2 border-cyan-500/60 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-white uppercase">CULTIVATION SECT GUILDS</h3>
            <p className="text-xs font-rajdhani text-slate-400">Pool Sect Qi with fellow GATE scholars for global EXP multipliers</p>
          </div>
        </div>

        <div className="space-y-3">
          {sectState.sects.map(sect => {
            const isActive = sectState.activeSectId === sect.id;
            const totalQi = sect.baseQi + sect.userContributionQi;

            return (
              <div
                key={sect.id}
                className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <span>{sect.name}</span>
                    {isActive && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-black uppercase">
                        ACTIVE SECT
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-rajdhani text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-400" /> {sect.baseMembers + (isActive ? 1 : 0)} Scholars</span>
                    <span className="text-emerald-400 font-bold">• 3 active cultivators online</span>
                    <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> {totalQi.toLocaleString()} Qi</span>
                  </div>
                  {sect.userContributionQi > 0 && (
                    <span className="text-[10px] text-cyan-300 font-mono block mt-0.5">
                      Your Qi Contribution: +{sect.userContributionQi} Qi
                    </span>
                  )}
                </div>

                {!isActive ? (
                  <button
                    onClick={() => handleJoinSect(sect.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-cyan-300"
                  >
                    JOIN SECT
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 block">{sect.buff}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Qi Pool Active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase"
          >
            CONFIRM SECT SELECTION
          </button>
        </div>

      </div>
    </div>
  );
}
