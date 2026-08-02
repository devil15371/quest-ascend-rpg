import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, Shield, Flame, RefreshCw } from 'lucide-react';
import { generateGuildMasterMessage } from '../utils/rpgEngine';
import { audio } from '../utils/audioEngine';

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
    { id: 'cyber_mentor', name: '🤖 Cyber AI Mentor', avatar: '🤖' },
    { id: 'strict_sensei', name: '⚔️ Strict Dungeon Master', avatar: '🧙‍♂️' },
    { id: 'anime_hero', name: '⚡ Anime Guild Host', avatar: '🦸' }
  ];

  const currentAvatar = personalities.find(p => p.id === personality)?.avatar || '🤖';

  return (
    <div className="glass-panel rounded-2xl p-5 border border-purple-500/30 relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-indigo-950/40 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        
        {/* Companion Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              {currentAvatar}
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
        </div>

        {/* Dynamic Speech & Personality Switcher */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-purple-300 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                AI Guild Master
              </span>
            </div>

            <select
              value={personality}
              onChange={(e) => {
                audio.playClick();
                setPersonality(e.target.value);
                setUserData(prev => ({ ...prev, guildMasterPersonality: e.target.value }));
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
            >
              {personalities.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm font-medium text-slate-100 italic leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            "{message.quote}"
          </p>
        </div>

      </div>
    </div>
  );
}
