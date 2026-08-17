import React, { useState } from 'react';
import { X, BookOpen, Plus, Cpu, FileText, HelpCircle, Zap } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function AddSubjectModal({ isOpen, onClose, userData, setUserData }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Core CS');
  const [totalLectures, setTotalLectures] = useState(25);
  const [totalDpps, setTotalDpps] = useState(20);
  const [targetQuestions, setTargetQuestions] = useState(150);
  const [targetPyqs, setTargetPyqs] = useState(100);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    audio.playClick();
    triggerHapticFeedback('light');

    const newSubject = {
      id: 'subj_' + Date.now(),
      name: name.trim(),
      category: category.trim() || 'Core Subject',
      color: "from-cyan-500 to-blue-600",
      totalLectures: Number(totalLectures) || 25,
      completedLectures: 0,
      totalDpps: Number(totalDpps) || 20,
      completedDpps: 0,
      targetQuestions: Number(targetQuestions) || 150,
      completedQuestions: 0,
      targetPyqs: Number(targetPyqs) || 100,
      completedPyqs: 0,
      completedRevisions: 0,
      notes: notes.trim()
    };

    setUserData(prev => {
      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id !== prev.activeCampaignId) return camp;
        return {
          ...camp,
          subjects: [...camp.subjects, newSubject]
        };
      });
      return { ...prev, campaigns: updatedCampaigns };
    });

    setName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-orbitron">
      <div className="cyber-panel max-w-lg w-full rounded-3xl p-6 border border-cyan-500/50 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Add Subject Module
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Subject Name *</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems, Engineering Math, Computer Networks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
            <input
              type="text"
              placeholder="e.g. Core CS, Math, Systems, Theoretical CS"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-cyan-400 block mb-1">Lectures</label>
              <input
                type="number"
                value={totalLectures}
                onChange={(e) => setTotalLectures(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono font-bold"
                min="1"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-amber-400 block mb-1">DPPs</label>
              <input
                type="number"
                value={totalDpps}
                onChange={(e) => setTotalDpps(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
                min="1"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-400 block mb-1">Questions</label>
              <input
                type="number"
                value={targetQuestions}
                onChange={(e) => setTargetQuestions(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono font-bold"
                min="1"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-blue-400 block mb-1">PYQs</label>
              <input
                type="number"
                value={targetPyqs}
                onChange={(e) => setTargetPyqs(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-blue-300 focus:outline-none focus:border-blue-400 font-mono font-bold"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Topics / Syllabus Notes</label>
            <textarea
              placeholder="e.g. Process Sync, Deadlocks, Memory Management..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 h-16 font-rajdhani"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 uppercase"
            >
              Add Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
