import React from 'react';
import { History, Zap, Shield, Award, RefreshCw, Layers } from 'lucide-react';
import { PRESET_CAMPAIGNS } from '../utils/presets';
import { INITIAL_USER_STATE } from '../utils/storage';
import { audio } from '../utils/audioEngine';

export default function HeatmapView({ userData, setUserData }) {

  const loadPreset = (presetKey) => {
    if (!window.confirm(`Load ${PRESET_CAMPAIGNS[presetKey].name}? Existing campaign data will be updated.`)) return;
    
    audio.playClick();
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
    setUserData(INITIAL_USER_STATE);
  };

  return (
    <div className="space-y-6">
      
      {/* Preset Campaign Selector Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Load Campaign Presets & Templates
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Instantly load structured preparation paths tailored for exams and skill mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div 
            onClick={() => loadPreset('gate_cs')}
            className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-purple-500/60 cursor-pointer transition flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300">Exam Prep</span>
              <h4 className="text-sm font-bold text-white mt-1">GATE CS & IT Arc</h4>
              <p className="text-xs text-slate-400 mt-1">7 Core subjects, 180+ lectures, 1200+ target practice PYQs.</p>
            </div>
            <button className="mt-3 text-xs font-bold text-purple-400 hover:text-purple-300 text-left">Load Campaign →</button>
          </div>

          <div 
            onClick={() => loadPreset('fullstack')}
            className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 cursor-pointer transition flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Software Engineering</span>
              <h4 className="text-sm font-bold text-white mt-1">Full-Stack Engineer Arc</h4>
              <p className="text-xs text-slate-400 mt-1">React, Next.js, Node.js, System Design, Distributed Systems.</p>
            </div>
            <button className="mt-3 text-xs font-bold text-cyan-400 hover:text-cyan-300 text-left">Load Campaign →</button>
          </div>

          <div 
            onClick={resetAllData}
            className="p-4 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 cursor-pointer transition flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300">Danger Zone</span>
              <h4 className="text-sm font-bold text-rose-200 mt-1">Reset All Hero Data</h4>
              <p className="text-xs text-rose-300/70 mt-1">Wipe LocalStorage and start fresh from Level 1.</p>
            </div>
            <button className="mt-3 text-xs font-bold text-rose-400 hover:text-rose-300 text-left">Reset Progress →</button>
          </div>
        </div>
      </div>

      {/* Activity Log History */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-purple-400" />
          Quest Activity History Log
        </h3>

        {userData.activityLogs.length === 0 ? (
          <p className="text-xs text-slate-500">No activity logged yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {userData.activityLogs.map((log) => (
              <div 
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-[11px]">{log.date}</span>
                  <span className="font-semibold text-slate-200">{log.description}</span>
                </div>

                {log.expGained !== 0 && (
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
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
