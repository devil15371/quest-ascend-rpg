import React, { useState } from 'react';
import { X, Moon, CheckCircle, HelpCircle, Award, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { getGATEVerificationQuiz } from '../utils/gateQuizBank';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function NightReportModal({ isOpen, onClose, userData, setUserData }) {
  const [step, setStep] = useState(1); // 1: Progress Entry, 2: GATE Verification Quiz, 3: Results
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [lecturesDone, setLecturesDone] = useState(2);
  const [topicName, setTopicName] = useState('');
  const [questionsDone, setQuestionsDone] = useState(25);

  const activeCampaign = userData.campaigns.find(c => c.id === userData.activeCampaignId) || userData.campaigns[0];
  const subjects = activeCampaign?.subjects || [];

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(0);

  if (!isOpen) return null;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const handleProceedToQuiz = (e) => {
    e.preventDefault();
    if (!currentSubject) return;

    audio.playClick();
    triggerHapticFeedback('medium');

    const questions = getGATEVerificationQuiz(currentSubject.name);
    setQuizQuestions(questions);
    setUserAnswers({});
    setStep(2);
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    audio.playClick();
    triggerHapticFeedback('light');
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    audio.playLevelUp();
    triggerHapticFeedback('heavy');

    let correctCount = 0;
    quizQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    setQuizScore(correctCount);

    // Calculate EXP & Gold rewards based on study effort + quiz score
    const baseExp = (Number(lecturesDone) * 40) + (Number(questionsDone) * 2);
    const bonusMultiplier = correctCount === 3 ? 1.5 : correctCount === 2 ? 1.2 : 0.8;
    const earnedExp = Math.round(baseExp * bonusMultiplier);
    const earnedGold = Math.round(earnedExp * 0.4);

    // Update User State & Subject Progress
    setUserData(prev => {
      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id !== prev.activeCampaignId) return camp;
        const updatedSubjects = camp.subjects.map(subj => {
          if (subj.id !== (currentSubject?.id || subj.id)) return subj;
          return {
            ...subj,
            completedLectures: Math.min(subj.totalLectures, subj.completedLectures + Number(lecturesDone)),
            completedQuestions: subj.completedQuestions + Number(questionsDone)
          };
        });
        return { ...camp, subjects: updatedSubjects };
      });

      const newLog = {
        id: 'log_' + Date.now(),
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        description: `🌙 Night Report: ${currentSubject?.name || 'Subject'} (${lecturesDone} lectures, ${topicName || 'General'}). GATE Quiz Score: ${correctCount}/3`,
        expGained: earnedExp
      };

      return {
        ...prev,
        profile: {
          ...prev.profile,
          totalExp: prev.profile.totalExp + earnedExp,
          gold: prev.profile.gold + earnedGold
        },
        campaigns: updatedCampaigns,
        activityLogs: [newLog, ...prev.activityLogs]
      };
    });

    setStep(3);
  };

  const handleFinish = () => {
    setStep(1);
    setTopicName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="cyber-panel max-w-lg w-full rounded-3xl p-6 border-2 border-cyan-500/60 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets font-orbitron">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Night Progress Submission */}
        {step === 1 && (
          <form onSubmit={handleProceedToQuiz} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Moon className="w-6 h-6 text-purple-400 animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-white uppercase">Night Study Progress Report</h3>
                <p className="text-xs font-rajdhani text-slate-400">Log completed lectures & unlock your GATE Verification Quiz</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.completedLectures}/{s.totalLectures} Lec)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Lectures Completed</label>
                <input
                  type="number"
                  value={lecturesDone}
                  onChange={(e) => setLecturesDone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">PYQs Solved</label>
                <input
                  type="number"
                  value={questionsDone}
                  onChange={(e) => setQuestionsDone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Main Chapter Heading / Topic *</label>
              <input
                type="text"
                placeholder="e.g. Peterson's Algorithm & Semaphores"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>PROCEED TO GATE AI QUIZ VERIFICATION</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: GATE Verification Quiz */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                GATE KNOWLEDGE CHECK: {currentSubject?.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono">{Object.keys(userAnswers).length}/3 Answered</span>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {quizQuestions.map((q, qIdx) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-white">Q{qIdx + 1}. {q.question}</p>
                  <div className="grid grid-cols-1 gap-1.5 text-xs font-rajdhani">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        className={`text-left p-2.5 rounded-lg border transition ${
                          userAnswers[q.id] === optIdx
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(userAnswers).length < quizQuestions.length}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20"
            >
              VERIFY & CLAIM EXP REWARDS
            </button>
          </div>
        )}

        {/* STEP 3: Results & Rewards */}
        {step === 3 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-2xl animate-bounce">
              🏆
            </div>

            <h3 className="text-xl font-black text-white">GATE VERIFICATION COMPLETE!</h3>
            <p className="text-sm font-rajdhani text-cyan-300">
              Quiz Accuracy Score: <span className="font-bold font-mono text-white">{quizScore}/3</span> Correct
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-around text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">EXP GAINED</span>
                <span className="text-lg font-black text-emerald-400 font-mono">+{Math.round((Number(lecturesDone) * 40 + Number(questionsDone) * 2) * (quizScore === 3 ? 1.5 : 1.0))} EXP</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">GOLD EARNED</span>
                <span className="text-lg font-black text-amber-400 font-mono">+{Math.round(((Number(lecturesDone) * 40 + Number(questionsDone) * 2) * 0.4))} GOLD</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl"
            >
              ASCEND TO NIGHT REST
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
