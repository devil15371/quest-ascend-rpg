import React, { useState } from 'react';
import { X, Calendar, Plus, Sun } from 'lucide-react';
import { audio } from '../utils/audioEngine';

export default function AddQuestModal({ isOpen, onClose, setUserData }) {
  const [title, setTitle] = useState('');
  const [expReward, setExpReward] = useState(60);
  const [goldReward, setGoldReward] = useState(25);
  const [isEarlyBird, setIsEarlyBird] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    audio.playClick();

    const newQuest = {
      id: 'dq_' + Date.now(),
      title: title.trim(),
      expReward: Number(expReward) || 50,
      goldReward: Number(goldReward) || 20,
      completed: false,
      dateSet: new Date().toISOString().split('T')[0],
      isEarlyBird
    };

    setUserData(prev => ({
      ...prev,
      dailyQuests: [...prev.dailyQuests, newQuest]
    }));

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-purple-500/40 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Set Morning Daily Quest
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Quest Title *</label>
            <input
              type="text"
              placeholder="e.g. Complete 3 GATE OS Lectures, Solve 30 PYQs, Wake up at 6:30 AM"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">EXP Reward</label>
              <input
                type="number"
                value={expReward}
                onChange={(e) => setExpReward(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                min="10"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Gold Reward</label>
              <input
                type="number"
                value={goldReward}
                onChange={(e) => setGoldReward(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                min="5"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="earlyBird"
              checked={isEarlyBird}
              onChange={(e) => setIsEarlyBird(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="earlyBird" className="text-xs font-semibold text-amber-300 cursor-pointer flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Morning Early Bird Task (+25% EXP Bonus)
            </label>
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Set Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
