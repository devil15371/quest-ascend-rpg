import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { generateGuildMasterMessage } from '../utils/rpgEngine';
import { generateCoPilotAdviceWithGemini, getStoredGeminiApiKey } from '../utils/geminiAiService';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function GuildMasterModal({ userData, onOpenChat }) {
  const [aiQuote, setAiQuote] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const hasApiKey = Boolean(getStoredGeminiApiKey());

  const defaultMessage = generateGuildMasterMessage({
    name: userData?.profile?.name || 'Hero Candidate',
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

  const handleCardClick = () => {
    audio.playClick();
    triggerHapticFeedback('medium');
    if (onOpenChat) onOpenChat();
  };

  return (
    <div 
      onClick={handleCardClick}
      className="cyber-panel rounded-2xl p-4 sm:p-5 border border-cyan-500/40 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 shadow-2xl cyber-hud-brackets font-orbitron cursor-pointer hover:border-cyan-400/80 transition-all duration-300 group active:scale-[0.99]"
      title="Click to chat with AI Mentor"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        
        {/* Holographic AI Avatar Ring */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/40 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              🤖
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-950 animate-ping" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-950" />
        </div>

        {/* Clean Greeting Bubble */}
        <div className="flex-1 space-y-1.5 w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
              <span>AI QUANTUM MENTOR</span>
            </span>

            <span className="text-[10px] font-rajdhani text-cyan-400/80 group-hover:text-cyan-300 flex items-center gap-1 font-bold">
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span>Tap to Chat & Analyze App ➔</span>
            </span>
          </div>

          <p className="text-sm font-rajdhani font-semibold text-slate-100 italic leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-cyan-500/30 text-cyan-100 shadow-inner group-hover:border-cyan-400/60 transition-colors">
            "{isLoadingAi ? 'Connecting to AI Quantum Subspace...' : displayQuote}"
          </p>
        </div>

      </div>
    </div>
  );
}
