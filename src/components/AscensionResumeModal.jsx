import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Sparkles, Copy, Check } from 'lucide-react';
import { generateAscensionResume } from '../utils/geminiAiService';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function AscensionResumeModal({ isOpen, onClose, userData }) {
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      generateAscensionResume(userData).then(res => {
        setResumeText(res);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    audio.playClick();
    triggerHapticFeedback('light');
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in font-orbitron">
      <div className="cyber-panel max-w-2xl w-full rounded-3xl p-6 border-2 border-cyan-500/60 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            DAO FORGE • ASCENSION RESUME
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 mx-auto text-cyan-400 animate-spin" />
            <p className="text-xs font-rajdhani text-cyan-300">FORGING TECHNICAL RESUME FROM MASTERED BRAIN MATRIX...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-h-96 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {resumeText}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-rajdhani text-slate-400">
                Verified by QuestAscend Neural Skills Graph
              </span>

              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY RESUME MARKDOWN'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
