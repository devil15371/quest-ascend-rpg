import React, { useState } from 'react';
import { X, BookOpen, Plus } from 'lucide-react';
import { audio } from '../utils/audioEngine';

export default function AddSubjectModal({ isOpen, onClose, userData, setUserData }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Core Subject');
  const [totalLectures, setTotalLectures] = useState(20);
  const [targetQuestions, setTargetQuestions] = useState(150);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    audio.playClick();

    const newSubject = {
      id: 'subj_' + Date.now(),
      name: name.trim(),
      category: category.trim() || 'Core Subject',
      color: "from-purple-600 to-indigo-600",
      totalLectures: Number(totalLectures) || 1,
      completedLectures: 0,
      completedRevisions: 0,
      completedQuestions: 0,
      targetQuestions: Number(targetQuestions) || 50,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-purple-500/40 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Add New Subject / Module
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Subject Name *</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems, Engineering Math, Machine Learning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Core CS, Math"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Total Lectures</label>
              <input
                type="number"
                value={totalLectures}
                onChange={(e) => setTotalLectures(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Questions</label>
              <input
                type="number"
                value={targetQuestions}
                onChange={(e) => setTargetQuestions(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Topics / Notes</label>
            <textarea
              placeholder="e.g. Process Sync, Deadlocks, Memory Management..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 h-20"
            />
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
            >
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
