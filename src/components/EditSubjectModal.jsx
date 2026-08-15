import React, { useState, useEffect } from 'react';
import { X, Sliders, Check, BookOpen, HelpCircle, RotateCcw } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';
import { safeNum } from '../utils/safeMath';

export default function EditSubjectModal({ isOpen, onClose, subject, setUserData }) {
  const [totalLectures, setTotalLectures] = useState(25);
  const [targetQuestions, setTargetQuestions] = useState(200);
  const [completedLectures, setCompletedLectures] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(0);
  const [completedRevisions, setCompletedRevisions] = useState(0);

  useEffect(() => {
    if (subject) {
      setTotalLectures(subject.totalLectures || 25);
      setTargetQuestions(subject.targetQuestions || 200);
      setCompletedLectures(subject.completedLectures || 0);
      setCompletedQuestions(subject.completedQuestions || 0);
      setCompletedRevisions(subject.completedRevisions || 0);
    }
  }, [subject, isOpen]);

  if (!isOpen || !subject) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    audio.playLevelUp();
    triggerHapticFeedback('medium');

    const updatedTotalLectures = Math.max(1, safeNum(totalLectures, 25));
    const updatedTargetQuestions = Math.max(1, safeNum(targetQuestions, 200));
    const updatedCompletedLectures = Math.max(0, safeNum(completedLectures, 0));
    const updatedCompletedQuestions = Math.max(0, safeNum(completedQuestions, 0));
    const updatedCompletedRevisions = Math.max(0, safeNum(completedRevisions, 0));

    setUserData(prev => {
      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id !== prev.activeCampaignId) return camp;

        const updatedSubjects = camp.subjects.map(s => {
          if (s.id !== subject.id) return s;
          return {
            ...s,
            totalLectures: updatedTotalLectures,
            targetQuestions: updatedTargetQuestions,
            completedLectures: updatedCompletedLectures,
            completedQuestions: updatedCompletedQuestions,
            completedRevisions: updatedCompletedRevisions
          };
        });

        return { ...camp, subjects: updatedSubjects };
      });

      return {
        ...prev,
        campaigns: updatedCampaigns
      };
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in font-orbitron">
      <div className="cyber-panel max-w-md w-full rounded-3xl p-6 border-2 border-cyan-500/60 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase">CUSTOMIZE MODULE TARGETS</h3>
              <p className="text-[11px] font-rajdhani text-cyan-300 font-semibold">{subject.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Lectures Target Section */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <BookOpen className="w-4 h-4" />
              <span>LECTURE TARGETS</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Total Target Lectures</label>
                <input
                  type="number"
                  value={totalLectures}
                  onChange={(e) => setTotalLectures(e.target.value)}
                  min="1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Completed Lectures</label>
                <input
                  type="number"
                  value={completedLectures}
                  onChange={(e) => setCompletedLectures(e.target.value)}
                  min="0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Practice Questions Target Section */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <HelpCircle className="w-4 h-4" />
              <span>PRACTICE QUESTION TARGETS</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Total Target PYQs</label>
                <input
                  type="number"
                  value={targetQuestions}
                  onChange={(e) => setTargetQuestions(e.target.value)}
                  min="1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Solved PYQs</label>
                <input
                  type="number"
                  value={completedQuestions}
                  onChange={(e) => setCompletedQuestions(e.target.value)}
                  min="0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Revisions Section */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <RotateCcw className="w-4 h-4" />
              <span>REVISION ROUNDS</span>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Completed Revision Sessions</label>
              <input
                type="number"
                value={completedRevisions}
                onChange={(e) => setCompletedRevisions(e.target.value)}
                min="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-purple-300 font-bold focus:outline-none focus:border-purple-400"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Check className="w-4 h-4" />
              <span>SAVE TARGETS</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
