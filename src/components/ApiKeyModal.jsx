import React, { useState } from 'react';
import { X, Key, Cpu, ExternalLink, Check, Sparkles } from 'lucide-react';
import { getStoredGeminiApiKey, saveGeminiApiKey } from '../utils/geminiAiService';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState(() => getStoredGeminiApiKey());
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    audio.playClick();
    triggerHapticFeedback('medium');

    saveGeminiApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in font-orbitron">
      <div className="cyber-panel max-w-md w-full rounded-3xl p-6 border-2 border-cyan-500/60 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            ACTIVATE GEMINI AI CO-PILOT
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
            Enter your free Google Gemini API Key to enable live AI GATE exam question generation & real-time Co-Pilot speech.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-rajdhani pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>Get Free Gemini API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>KEY ACTIVATED!</span>
                </>
              ) : (
                <span>SAVE & ACTIVATE AI</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
