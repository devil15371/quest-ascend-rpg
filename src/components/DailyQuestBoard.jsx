import React, { useState } from 'react';
import { Calendar, Sun, CheckCircle2, Circle, Plus, AlertCircle, Sparkles, Trash2, Award } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { isEarlyBirdTime } from '../utils/rpgEngine';

export default function DailyQuestBoard({ userData, setUserData, onOpenAddQuest }) {
  const isEarly = isEarlyBirdTime();
  const isRestDayActive = userData.profile.restDayActiveUntil && new Date(userData.profile.restDayActiveUntil) >= new Date();

  const toggleQuest = (questId) => {
    const quest = userData.dailyQuests.find(q => q.id === questId);
    if (!quest) return;

    if (!quest.completed) {
      audio.playQuestComplete();
    } else {
      audio.playClick();
    }

    const multiplier = (isEarly || quest.isEarlyBird) ? 1.25 : 1.0;
    const finalExp = Math.round(quest.expReward * multiplier);
    const finalGold = quest.goldReward;

    setUserData(prev => {
      const updatedQuests = prev.dailyQuests.map(q => {
        if (q.id === questId) {
          return { ...q, completed: !q.completed };
        }
        return q;
      });

      const expDelta = !quest.completed ? finalExp : -finalExp;
      const goldDelta = !quest.completed ? finalGold : -finalGold;

      return {
        ...prev,
        profile: {
          ...prev.profile,
          totalExp: Math.max(0, prev.profile.totalExp + expDelta),
          gold: Math.max(0, prev.profile.gold + goldDelta),
          stats: {
            ...prev.profile.stats,
            vit: prev.profile.stats.vit + (!quest.completed ? 10 : -10)
          }
        },
        dailyQuests: updatedQuests,
        activityLogs: !quest.completed ? [
          {
            id: 'log_' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'QUEST',
            description: `Completed Morning Quest: ${quest.title}`,
            expGained: finalExp,
            timestamp: Date.now()
          },
          ...prev.activityLogs
        ] : prev.activityLogs
      };
    });
  };

  const deleteQuest = (questId) => {
    audio.playClick();
    setUserData(prev => ({
      ...prev,
      dailyQuests: prev.dailyQuests.filter(q => q.id !== questId)
    }));
  };

  const completedCount = userData.dailyQuests.filter(q => q.completed).length;
  const totalCount = userData.dailyQuests.length;
  const questProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
      
      {/* Header & Early Bird Bonus Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Daily Morning Quest Board
            </h2>
            {isEarly && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1 animate-pulse">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Early Bird Buff Active (+25% EXP)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Commit to your daily targets in the morning. Completing them boosts Vitality & EXP!
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-semibold">Today's Audit Status</span>
            <div className="text-xs font-mono font-bold text-purple-300">
              {completedCount} / {totalCount} Completed ({questProgress}%)
            </div>
          </div>
          <button
            onClick={onOpenAddQuest}
            className="px-3.5 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4 text-purple-400" /> Add Morning Task
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div 
          className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
          style={{ width: `${questProgress}%` }}
        />
      </div>

      {/* Quests List */}
      {userData.dailyQuests.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-slate-300">No morning quests set for today</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">
            Set 2-4 tasks every morning (e.g. 2 Lectures, 30 Questions, Wake at 6:30 AM) to claim daily EXP & Gold!
          </p>
          <button
            onClick={onOpenAddQuest}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Set Morning Quests
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {userData.dailyQuests.map((quest) => (
            <div
              key={quest.id}
              onClick={() => toggleQuest(quest.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                quest.completed
                  ? 'bg-slate-950/40 border-emerald-900/40 text-slate-400 line-through'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-700/70 text-slate-100 shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                {quest.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                )}
                <div>
                  <span className="text-sm font-bold">{quest.title}</span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    {quest.isEarlyBird && (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <Sun className="w-3 h-3" /> Early Bird Task
                      </span>
                    )}
                    <span>Reward: +{quest.expReward} EXP • {quest.goldReward} Gold</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQuest(quest.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discipline Audit Warning Banner */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <p className="text-slate-400">
          <strong className="text-amber-300">Discipline Audit:</strong> Unfinished morning quests will deduct <span className="text-rose-400 font-bold">25 EXP each</span> at midnight unless a <span className="text-emerald-300 font-bold">Rest Day Pass</span> is active!
        </p>
      </div>

    </div>
  );
}
