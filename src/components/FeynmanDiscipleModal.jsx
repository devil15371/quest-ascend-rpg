import React, { useState } from 'react';
import { X, GraduationCap, Mic, Sparkles, CheckCircle, HelpCircle } from 'lucide-react';
import { evaluateFeynmanTeaching } from '../utils/geminiAiService';
import { voiceEngine } from '../utils/voiceEngine';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function FeynmanDiscipleModal({ isOpen, onClose, userData, setUserData }) {
  const [topic, setTopic] = useState('Operating Systems: Semaphores');
  const [explanation, setExplanation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const handleVoiceChant = () => {
    if (isListening) {
      voiceEngine.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    triggerHapticFeedback('light');

    voiceEngine.listenForMantra(
      (transcript) => {
        setExplanation(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      },
      (err) => {
        setIsListening(false);
      }
    );
  };

  const handleSubmitTeaching = async (e) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    audio.playClick();
    triggerHapticFeedback('medium');
    setIsEvaluating(true);

    const evalResult = await evaluateFeynmanTeaching(topic, explanation);
    setResult(evalResult);
    setIsEvaluating(false);

    if (evalResult.passed) {
      audio.playLevelUp();
      triggerHapticFeedback('heavy');
      setUserData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          totalExp: prev.profile.totalExp + 120,
          gold: prev.profile.gold + 40,
          stats: {
            ...prev.profile.stats,
            wis: (prev.profile.stats.wis || 30) + 5
          }
        }
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in font-orbitron">
      <div className="cyber-panel max-w-lg w-full rounded-3xl p-6 border-2 border-purple-500/60 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <GraduationCap className="w-6 h-6 text-purple-400 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-white uppercase">FEYNMAN AI DISCIPLE</h3>
            <p className="text-xs font-rajdhani text-slate-400">Teach your Junior Disciple to prove 100% Dao mastery</p>
          </div>
        </div>

        {!result ? (
          <form onSubmit={handleSubmitTeaching} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target GATE Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">Explain it in simple terms (Type or Voice Chant)</label>
                <button
                  type="button"
                  onClick={handleVoiceChant}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                    isListening ? 'bg-red-950 text-red-400 border border-red-500 animate-pulse' : 'bg-slate-900 border border-slate-700 text-purple-300'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span>{isListening ? 'Listening...' : 'Voice Chant'}</span>
                </button>
              </div>

              <textarea
                rows={4}
                placeholder="Teach as if explaining to a beginner. e.g. A semaphore is an integer variable used to solve critical section problems using wait and signal atomic operations..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-400 font-rajdhani"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isEvaluating}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-500/20"
            >
              {isEvaluating ? 'JUNIOR DISCIPLE EVALUATING...' : 'TEACH AI DISCIPLE (+120 EXP)'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center text-2xl animate-bounce">
              🎓
            </div>

            <h3 className="text-xl font-black text-white">DISCIPLE COMPREHENSION SCORE: {result.score}%</h3>
            <p className="text-sm font-rajdhani text-purple-200 italic p-3 rounded-xl bg-slate-900 border border-purple-900/40">
              "{result.discipleFeedback}"
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              +120 EXP • +40 Gold • +5 WIS (Wisdom)
            </div>

            <button
              onClick={() => { setResult(null); onClose(); }}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-xl"
            >
              ASCEND DISCIPLE LESSON
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
