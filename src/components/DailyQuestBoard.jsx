import React from 'react';
import { Terminal, Sun, CheckCircle2, Circle, Plus, AlertCircle, Trash2, Award, Zap } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { isEarlyBirdTime } from '../utils/rpgEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function DailyQuestBoard({ userData, setUserData, onOpenAddQuest }) {
  const isEarly = isEarlyBirdTime();

  const toggleQuest = (questId) => {
    const quest = userData.dailyQuests.find(q => q.id === questId);
    if (!quest) return;

    if (!quest.completed) {
      audio.playQuestComplete();
      triggerHapticFeedback('heavy');
    } else {
      audio.playClick();
      triggerHapticFeedback('light');
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
            description: `Completed Daily Quest: ${quest.title}`,
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
    triggerHapticFeedback('light');
    setUserData(prev => ({
      ...prev,
      dailyQuests: prev.dailyQuests.filter(q => q.id !== questId)
    }));
  };

  const completedCount = userData.dailyQuests.filter(q => q.completed).length;
  const totalCount = userData.dailyQuests.length;
  const questProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              Daily Study Tasks
            </h2>
            {isEarly && (
              <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-medium flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> +25% Early Bird
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Commit to key milestones each morning. Completing them protects your streak and cultivates discipline.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Daily Audit</span>
            <div className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {completedCount} / {totalCount} Completed ({questProgress}%)
            </div>
          </div>
          <button
            onClick={() => {
              triggerHapticFeedback('light');
              onOpenAddQuest();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ml-auto md:ml-0 shadow-sm shadow-cyan-500/20"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
          style={{ width: `${questProgress}%` }}
        />
      </div>

      {/* Quests List */}
      {userData.dailyQuests.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          <p className="text-xs font-semibold text-slate-300">No Daily Tasks Set For Today</p>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">
            Set 2-3 target tasks to cultivate your daily study habit.
          </p>
          <button
            onClick={onOpenAddQuest}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" /> Set First Task
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {userData.dailyQuests.map((quest) => (
            <div
              key={quest.id}
              onClick={() => toggleQuest(quest.id)}
              className={`py-3 px-4 rounded-xl border transition duration-150 cursor-pointer flex items-center justify-between gap-3 group ${
                quest.completed
                  ? 'bg-slate-950/40 border-slate-800/80 text-slate-500 line-through'
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {quest.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-cyan-400 flex-shrink-0 group-hover:scale-105 transition" />
                )}
                <div className="truncate">
                  <span className="text-xs font-medium block truncate text-slate-200">{quest.title}</span>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                    {quest.isEarlyBird && (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <Sun className="w-3 h-3" /> Early Bird
                      </span>
                    )}
                    <span className="tabular-nums">+{quest.expReward} EXP • {quest.goldReward} Gold</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQuest(quest.id);
                  }}
                  className="p-1 text-slate-600 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discipline Footer Note */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <p className="text-slate-400 text-[11px] leading-relaxed">
          <strong className="text-slate-300">Midnight Audit:</strong> Uncompleted daily tasks apply a -50 EXP corruption penalty unless shielded by a Rest Day Pass.
        </p>
      </div>

    </div>
  );
}
