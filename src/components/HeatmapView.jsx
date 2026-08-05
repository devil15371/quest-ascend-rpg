import React from 'react';
import { History, Zap, Shield, Award, RefreshCw, Layers, Cpu } from 'lucide-react';
import { PRESET_CAMPAIGNS } from '../utils/presets';
import { INITIAL_USER_STATE } from '../utils/storage';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function HeatmapView({ userData, setUserData }) {

  const loadPreset = (presetKey) => {
    if (!window.confirm(`Load ${PRESET_CAMPAIGNS[presetKey].name}? Existing campaign data will be updated.`)) return;
    
    audio.playClick();
    triggerHapticFeedback('medium');
    const targetPreset = PRESET_CAMPAIGNS[presetKey];

    setUserData(prev => {
      const exists = prev.campaigns.some(c => c.id === targetPreset.id);
      const updatedCampaigns = exists 
        ? prev.campaigns.map(c => c.id === targetPreset.id ? targetPreset : c)
        : [...prev.campaigns, targetPreset];

      return {
        ...prev,
        activeCampaignId: targetPreset.id,
        campaigns: updatedCampaigns
      };
    });
  };

  const resetAllData = () => {
    if (!window.confirm("⚠️ ARE YOU SURE? This will reset all your progress, EXP, and level back to zero.")) return;
    audio.playClick();
    triggerHapticFeedback('heavy');
    setUserData(INITIAL_USER_STATE);
  };

  return (
    <div className="space-y-6">
      
      {/* Preset Campaign Templates */}
      <div className="cyber-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 bg-slate-950/80 cyber-hud-brackets">
        <div>
          <h3 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            PRESET CAMPAIGN MATRIX
          </h3>
          <p className="text-xs font-rajdhani text-slate-400 mt-1">
            Instantly load structured preparation paths tailored for exams and skill mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div 
            onClick={() => loadPreset('gate_cs')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <span className="text-[9px] font-orbitron font-extrabold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300">Exam Prep</span>
              <h4 className="text-sm font-orbitron font-bold text-white mt-1 group-hover:text-cyan-300">GATE CS & IT Arc</h4>
              <p className="text-xs font-rajdhani text-slate-400 mt-1">7 Core subjects, 180+ lectures, 1200+ target practice PYQs.</p>
            </div>
            <button className="mt-3 text-xs font-orbitron font-bold text-cyan-400 hover:text-cyan-300 text-left uppercase">Load Campaign →</button>
          </div>

          <div 
            onClick={() => loadPreset('fullstack')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <span className="text-[9px] font-orbitron font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Software Eng</span>
              <h4 className="text-sm font-orbitron font-bold text-white mt-1 group-hover:text-cyan-300">Full-Stack Engineer Arc</h4>
              <p className="text-xs font-rajdhani text-slate-400 mt-1">React, Next.js, Node.js, System Design, Distributed Systems.</p>
            </div>
            <button className="mt-3 text-xs font-orbitron font-bold text-cyan-400 hover:text-cyan-300 text-left uppercase">Load Campaign →</button>
          </div>

          <div 
            onClick={resetAllData}
            className="p-4 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 cursor-pointer transition flex flex-col justify-between"
          >
            <div>
              <span className="text-[9px] font-orbitron font-extrabold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300">System Reset</span>
              <h4 className="text-sm font-orbitron font-bold text-rose-200 mt-1">Wipe All Progress</h4>
              <p className="text-xs font-rajdhani text-rose-300/70 mt-1">Reset LocalStorage and start fresh from Level 1.</p>
            </div>
            <button className="mt-3 text-xs font-orbitron font-bold text-rose-400 hover:text-rose-300 text-left uppercase">Reset Progress →</button>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="cyber-panel p-6 rounded-2xl border border-cyan-500/30 bg-slate-950/80 cyber-hud-brackets">
        <h3 className="text-base font-orbitron font-bold text-white flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-purple-400" />
          SYSTEM ACTIVITY LOG MATRIX
        </h3>

        {userData.activityLogs.length === 0 ? (
          <p className="text-xs font-rajdhani text-slate-500">No activity logged yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {userData.activityLogs.map((log) => (
              <div 
                key={log.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-rajdhani"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-[11px]">{log.date}</span>
                  <span className="font-semibold text-slate-200 text-sm">{log.description}</span>
                </div>

                {log.expGained !== 0 && (
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    log.expGained > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950 text-rose-300 border border-rose-800/40'
                  }`}>
                    {log.expGained > 0 ? `+${log.expGained}` : log.expGained} EXP
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
