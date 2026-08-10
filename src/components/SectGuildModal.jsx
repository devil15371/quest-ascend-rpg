import React, { useState } from 'react';
import { X, Shield, Users, Zap, Trophy, Flame } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

const PRESET_SECTS = [
  { id: 'iit_bombay', name: 'IIT Bombay Dao Sect', members: 142, qiPool: '45,200 Qi', buff: '+10% EXP Boost' },
  { id: 'nit_trichy', name: 'NIT Trichy Cultivators', members: 98, qiPool: '31,800 Qi', buff: '+10% EXP Boost' },
  { id: 'night_owls', name: '2 AM Night Owl Sect', members: 215, qiPool: '68,900 Qi', buff: '+15% Night Report EXP' }
];

export default function SectGuildModal({ isOpen, onClose, userData, setUserData }) {
  const [activeSectId, setActiveSectId] = useState('iit_bombay');

  if (!isOpen) return null;

  const handleJoinSect = (sectId) => {
    audio.playLevelUp();
    triggerHapticFeedback('medium');
    setActiveSectId(sectId);
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
          {PRESET_SECTS.map(sect => (
            <div
              key={sect.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                activeSectId === sect.id
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{sect.name}</span>
                  {activeSectId === sect.id && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-black uppercase">
                      ACTIVE SECT
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-3 text-xs font-rajdhani text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-400" /> {sect.members} Scholars</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> {sect.qiPool}</span>
                </div>
              </div>

              {activeSectId !== sect.id ? (
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
          ))}
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
