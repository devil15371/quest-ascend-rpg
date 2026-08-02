import React from 'react';
import { BookOpen, Plus, CheckCircle2, RotateCcw, HelpCircle, Sparkles, FolderPlus, Trash2 } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { EXP_TABLE, isEarlyBirdTime } from '../utils/rpgEngine';

export default function SubjectTracker({ userData, setUserData, onOpenAddSubject, onOpenAddCampaign }) {
  const activeCampaign = userData.campaigns.find(c => c.id === userData.activeCampaignId) || userData.campaigns[0];

  const handleIncrement = (subjectId, type, count = 1) => {
    audio.playExpGain();

    const multiplier = isEarlyBirdTime() ? (1 + EXP_TABLE.EARLY_BIRD_BONUS) : 1;
    let baseExp = 0;
    let baseGold = 0;
    let statKey = '';
    let statVal = 0;
    let logDesc = '';

    if (type === 'lecture') {
      baseExp = EXP_TABLE.LECTURE.exp * count;
      baseGold = EXP_TABLE.LECTURE.gold * count;
      statKey = EXP_TABLE.LECTURE.stat;
      statVal = EXP_TABLE.LECTURE.val * count;
      logDesc = `Completed ${count} Lecture(s)`;
    } else if (type === 'revision') {
      baseExp = EXP_TABLE.REVISION.exp * count;
      baseGold = EXP_TABLE.REVISION.gold * count;
      statKey = EXP_TABLE.REVISION.stat;
      statVal = EXP_TABLE.REVISION.val * count;
      logDesc = `Completed ${count} Revision Session(s)`;
    } else if (type === 'question') {
      baseExp = EXP_TABLE.QUESTION.exp * count;
      baseGold = EXP_TABLE.QUESTION.gold * count;
      statKey = EXP_TABLE.QUESTION.stat;
      statVal = EXP_TABLE.QUESTION.val * count;
      logDesc = `Solved ${count} Practice Question(s)`;
    }

    const totalExpGain = Math.round(baseExp * multiplier);
    const totalGoldGain = baseGold;

    setUserData(prev => {
      // Update active campaign subjects
      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id !== prev.activeCampaignId) return camp;

        const updatedSubjects = camp.subjects.map(subj => {
          if (subj.id !== subjectId) return subj;

          if (type === 'lecture') {
            return { ...subj, completedLectures: Math.min(subj.totalLectures, subj.completedLectures + count) };
          } else if (type === 'revision') {
            return { ...subj, completedRevisions: subj.completedRevisions + count };
          } else if (type === 'question') {
            return { ...subj, completedQuestions: subj.completedQuestions + count };
          }
          return subj;
        });

        return { ...camp, subjects: updatedSubjects };
      });

      const targetSubj = activeCampaign.subjects.find(s => s.id === subjectId);

      return {
        ...prev,
        profile: {
          ...prev.profile,
          totalExp: prev.profile.totalExp + totalExpGain,
          gold: prev.profile.gold + totalGoldGain,
          stats: {
            ...prev.profile.stats,
            [statKey]: prev.profile.stats[statKey] + statVal
          }
        },
        campaigns: updatedCampaigns,
        activityLogs: [
          {
            id: 'log_' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: type.toUpperCase(),
            description: `${targetSubj ? targetSubj.name : 'Subject'}: ${logDesc}`,
            expGained: totalExpGain,
            timestamp: Date.now()
          },
          ...prev.activityLogs
        ]
      };
    });
  };

  const deleteSubject = (subjectId) => {
    if (!window.confirm("Remove this subject from campaign?")) return;
    
    audio.playClick();
    setUserData(prev => {
      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id !== prev.activeCampaignId) return camp;
        return {
          ...camp,
          subjects: camp.subjects.filter(s => s.id !== subjectId)
        };
      });
      return { ...prev, campaigns: updatedCampaigns };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Campaign Selector Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-purple-400">
            ACTIVE CAMPAIGN
          </span>
          <div className="flex items-center gap-3 mt-1">
            <select
              value={userData.activeCampaignId}
              onChange={(e) => {
                audio.playClick();
                setUserData(prev => ({ ...prev, activeCampaignId: e.target.value }));
              }}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-base font-black text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {userData.campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-1">{activeCampaign?.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddSubject}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      {/* Subjects Grid */}
      {activeCampaign?.subjects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center border border-dashed border-slate-700">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No subjects in this campaign yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Add subjects (e.g. Engineering Mathematics, OS, DBMS, Algorithms) with total lectures and question targets to start gamifying your preparation!
          </p>
          <button
            onClick={onOpenAddSubject}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCampaign.subjects.map(subject => {
            const lectureProgress = Math.min(100, Math.round((subject.completedLectures / (subject.totalLectures || 1)) * 100));
            const questionProgress = Math.min(100, Math.round((subject.completedQuestions / (subject.targetQuestions || 1)) * 100));

            return (
              <div 
                key={subject.id}
                className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Header Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-purple-300">
                      {subject.category || 'Core Subject'}
                    </span>
                    <button
                      onClick={() => deleteSubject(subject.id)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                      title="Remove subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{subject.name}</h3>
                  {subject.notes && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{subject.notes}</p>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="space-y-3 my-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  {/* Lectures */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        Lectures Completed
                      </span>
                      <span className="text-blue-300 font-mono">
                        {subject.completedLectures} / {subject.totalLectures}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${lectureProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Practice Questions */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Questions Solved
                      </span>
                      <span className="text-emerald-300 font-mono">
                        {subject.completedQuestions} / {subject.targetQuestions}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${questionProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Revisions */}
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-purple-400" /> Revisions Done:
                    </span>
                    <span className="font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                      {subject.completedRevisions} Rounds
                    </span>
                  </div>
                </div>

                {/* Quick Action EXP Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <button
                    onClick={() => handleIncrement(subject.id, 'lecture', 1)}
                    disabled={subject.completedLectures >= subject.totalLectures}
                    className="px-2 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-200 font-bold text-xs flex flex-col items-center justify-center transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="+50 EXP | +15 INT"
                  >
                    <span>+1 Lecture</span>
                    <span className="text-[10px] text-blue-400 font-normal">+50 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'question', 10)}
                    className="px-2 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 font-bold text-xs flex flex-col items-center justify-center transition active:scale-95"
                    title="+100 EXP | +30 DEX"
                  >
                    <span>+10 Questions</span>
                    <span className="text-[10px] text-emerald-400 font-normal">+100 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'revision', 1)}
                    className="px-2 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs flex flex-col items-center justify-center transition active:scale-95"
                    title="+35 EXP | +12 WIS"
                  >
                    <span>+1 Revision</span>
                    <span className="text-[10px] text-purple-400 font-normal">+35 EXP</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
