import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, Shield, Flame, RefreshCw, Cpu } from 'lucide-react';
import { generateGuildMasterMessage } from '../utils/rpgEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function GuildMasterModal({ userData, setUserData }) {
  const [personality, setPersonality] = useState(userData.guildMasterPersonality || 'cyber_mentor');

  const message = generateGuildMasterMessage({
    name: userData.profile.name,
    level: userData.profile.totalExp ? Math.floor(Math.sqrt(userData.profile.totalExp / 100)) + 1 : 1,
    streak: userData.profile.streak,
    restDayActive: userData.profile.restDayActiveUntil && new Date(userData.profile.restDayActiveUntil) >= new Date(),
    totalExp: userData.profile.totalExp
  });

  const personalities = [
    { id: 'cyber_mentor', name: '🤖 Cyber AI Core', avatar: '🤖' },
    { id: 'strict_sensei', name: '⚔️ Dungeon Commander', avatar: '🧙‍♂️' },
    { id: 'anime_hero', name: '⚡ Mech Guild Master', avatar: '🦸' }
  ];

  const currentAvatar = personalities.find(p => p.id === personality)?.avatar || '🤖';

  return (
    <div className="cyber-panel rounded-2xl p-5 border border-cyan-500/40 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 shadow-2xl cyber-hud-brackets">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        
        {/* Holographic AI Avatar Ring */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/40 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              {currentAvatar}
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-950 animate-ping" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-950" />
        </div>

        {/* Dynamic Holographic Dialogue */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-orbitron font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                AI GUILD MENTOR TERMINAL
              </span>
            </div>

            <select
              value={personality}
              onChange={(e) => {
                audio.playClick();
                triggerHapticFeedback('light');
                setPersonality(e.target.value);
                setUserData(prev => ({ ...prev, guildMasterPersonality: e.target.value }));
              }}
              className="bg-slate-900 border border-cyan-500/40 rounded-lg px-2 py-1 text-[11px] font-orbitron font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              {personalities.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm font-rajdhani font-semibold text-slate-100 italic leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-cyan-500/30 text-cyan-100 shadow-inner">
            "{message.quote}"
          </p>
        </div>

      </div>
    </div>
  );
}
