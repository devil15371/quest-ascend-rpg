import React, { useState } from 'react';
import { X, Flame, ShieldAlert, Zap, CheckCircle, AlertOctagon, Award, Sparkles } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

const TRIBULATION_QUESTIONS = [
  {
    id: "trib_1",
    subject: "Operating Systems",
    question: "Which scheduling algorithm is non-preemptive and guarantees minimum average waiting time for a given set of processes?",
    options: ["A) Round Robin", "B) Shortest Job First (SJF)", "C) Priority Scheduling", "D) Multilevel Queue"],
    correctIndex: 1,
    explanation: "Shortest Job First (SJF) is mathematically optimal for minimizing average waiting time."
  },
  {
    id: "trib_2",
    subject: "Database Systems",
    question: "Which normal form removes partial dependency in a relational database schema?",
    options: ["A) 1NF", "B) 2NF", "C) 3NF", "D) BCNF"],
    correctIndex: 1,
    explanation: "2NF requires 1NF and no non-prime attribute to be partially dependent on any candidate key."
  },
  {
    id: "trib_3",
    subject: "Engineering Mathematics",
    question: "If A is an n x n non-singular matrix, what is Det(A^-1)?",
    options: ["A) Det(A)", "B) 1 / Det(A)", "C) -Det(A)", "D) 0"],
    correctIndex: 1,
    explanation: "Det(A^-1) = 1 / Det(A) for non-singular matrices."
  },
  {
    id: "trib_4",
    subject: "Algorithms",
    question: "What is the tight worst-case time complexity of QuickSort?",
    options: ["A) O(N log N)", "B) O(N)", "C) O(N^2)", "D) O(2^N)"],
    correctIndex: 2,
    explanation: "QuickSort exhibits O(N^2) worst-case time complexity when array is already sorted and bad pivots are picked."
  }
];

export default function HeavenlyTribulationModal({ isOpen, onClose, targetRealm, userData, setUserData }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen) return null;

  const currentQ = TRIBULATION_QUESTIONS[currentIdx];

  const handleSelectAnswer = (optionIdx) => {
    audio.playClick();
    triggerHapticFeedback('light');
    setUserAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIdx < TRIBULATION_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Calculate score
      let correct = 0;
      TRIBULATION_QUESTIONS.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex) correct++;
      });

      const passBool = correct >= 3;
      setScore(correct);
      setPassed(passBool);
      setIsFinished(true);

      if (passBool) {
        audio.playLevelUp();
        triggerHapticFeedback('heavy');
        setUserData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            totalExp: prev.profile.totalExp + 250,
            gold: prev.profile.gold + 100
          }
        }));
      } else {
        audio.playClick();
        triggerHapticFeedback('heavy');
        setUserData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            totalExp: Math.max(0, prev.profile.totalExp - 50)
          }
        }));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in font-orbitron">
      <div className="cyber-panel max-w-lg w-full rounded-3xl p-6 border-2 border-red-500/70 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        {!isFinished ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-red-900/60 pb-3">
              <Flame className="w-7 h-7 text-red-500 animate-bounce" />
              <div>
                <h3 className="text-base font-black text-red-400 uppercase tracking-widest">HEAVENLY TRIBULATION MOCK TEST</h3>
                <p className="text-xs font-rajdhani text-slate-300">Breakthrough Trial to {targetRealm?.name || 'Next Realm'}</p>
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Question {currentIdx + 1} of {TRIBULATION_QUESTIONS.length}</span>
              <span className="text-red-400 font-bold">Passing Score: 3/4</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-red-900/40 space-y-3">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                {currentQ.subject}
              </span>
              <p className="text-sm font-bold text-white leading-relaxed">{currentQ.question}</p>

              <div className="grid grid-cols-1 gap-2 text-xs font-rajdhani pt-1">
                {currentQ.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(optIdx)}
                    className={`text-left p-3 rounded-xl border transition ${
                      userAnswers[currentIdx] === optIdx
                        ? 'bg-red-950/80 border-red-400 text-red-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-red-900/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={userAnswers[currentIdx] === undefined}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl"
            >
              {currentIdx === TRIBULATION_QUESTIONS.length - 1 ? 'SUBMIT TRIBULATION TRIAL' : 'NEXT QUESTION ➔'}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 py-3">
            {passed ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-amber-950 border-4 border-amber-400 flex items-center justify-center text-4xl animate-bounce">
                  ⚡
                </div>
                <h3 className="text-2xl font-black text-amber-400 uppercase">TRIBULATION PASSED!</h3>
                <p className="text-sm font-rajdhani text-slate-300">
                  You survived the Heavenly Tribulation with <span className="text-white font-bold">{score}/4</span> score! You have ascended to <span className="text-cyan-400 font-bold">{targetRealm?.name}</span>!
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-xs font-mono text-amber-300">
                  +250 EXP • +100 Gold • Realm Aura Unlocked
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-red-950 border-4 border-red-500 flex items-center justify-center text-4xl">
                  💀
                </div>
                <h3 className="text-2xl font-black text-red-500 uppercase">CULTIVATION BACKLASH!</h3>
                <p className="text-sm font-rajdhani text-slate-300">
                  Your score was <span className="text-white font-bold">{score}/4</span>. The Heavenly Tribulation broke your Qi focus (-50 EXP). Meditate and try again!
                </p>
              </>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-white font-bold text-xs uppercase"
            >
              RETURN TO CULTIVATION CAVE
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
