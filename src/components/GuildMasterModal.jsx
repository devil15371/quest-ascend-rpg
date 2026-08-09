import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, MessageSquare, Shield, Flame, RefreshCw, Cpu, Key } from 'lucide-react';
import { generateGuildMasterMessage } from '../utils/rpgEngine';
import { generateCoPilotAdviceWithGemini, getStoredGeminiApiKey } from '../utils/geminiAiService';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function GuildMasterModal({ userData, setUserData, onOpenApiKeyModal }) {
  const [personality, setPersonality] = useState(userData?.guildMasterPersonality || 'cyber_mentor');
  const [aiQuote, setAiQuote] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const hasApiKey = Boolean(getStoredGeminiApiKey());

  const defaultMessage = generateGuildMasterMessage({
    name: userData?.profile?.name || 'Hunter Candidate',
    totalExp: userData?.profile?.totalExp || 0
  });

  const fetchGeminiAdvice = async () => {
    if (!hasApiKey) return;
    setIsLoadingAi(true);
    const customQuote = await generateCoPilotAdviceWithGemini(userData);
    if (customQuote) {
      setAiQuote(customQuote);
    }
    setIsLoadingAi(false);
  };

  useEffect(() => {
    fetchGeminiAdvice();
  }, [userData?.profile?.totalExp]);

  const displayQuote = aiQuote || defaultMessage.quote;

  const personalities = [
    { id: 'cyber_mentor', name: '🤖 Antigravity Core', avatar: '🤖' },
    { id: 'strict_sensei', name: '⚔️ Quantum Commander', avatar: '🧙‍♂️' },
    { id: 'anime_hero', name: '⚡ Mech Guild Master', avatar: '🦸' }
  ];

  const currentAvatar = personalities.find(p => p.id === personality)?.avatar || '🤖';

  return (
    <div className="cyber-panel rounded-2xl p-5 border border-cyan-500/40 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 shadow-2xl cyber-hud-brackets font-orbitron">
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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                ANTIGRAVITY QUANTUM CO-PILOT
              </span>
              {hasApiKey && (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  GEMINI AI ACTIVE
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenApiKeyModal}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-[10px] text-cyan-300 font-bold flex items-center gap-1"
              >
                <Key className="w-3 h-3 text-cyan-400" />
                <span>{hasApiKey ? 'AI Key' : 'Setup Gemini AI'}</span>
              </button>

              <select
                value={personality}
                onChange={(e) => {
                  audio.playClick();
                  triggerHapticFeedback('light');
                  setPersonality(e.target.value);
                  setUserData(prev => ({ ...prev, guildMasterPersonality: e.target.value }));
                }}
                className="bg-slate-900 border border-cyan-500/40 rounded-lg px-2 py-1 text-[11px] font-bold text-cyan-300 focus:outline-none cursor-pointer"
              >
                {personalities.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm font-rajdhani font-semibold text-slate-100 italic leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-cyan-500/30 text-cyan-100 shadow-inner">
            "{isLoadingAi ? 'Communicating with Antigravity AI Subspace...' : displayQuote}"
          </p>
        </div>

      </div>
    </div>
  );
}
