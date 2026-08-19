import React, { useState } from 'react';
import { BookOpen, Plus, RotateCcw, HelpCircle, Trash2, Sliders, Zap, FileText, ChevronRight } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import { EXP_TABLE, isCultivationBonusTime, calculateStatResonances } from '../utils/rpgEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';
import EditSubjectModal from './EditSubjectModal';

export default function SubjectTracker({ userData, setUserData, onOpenAddSubject }) {
  const [editingSubject, setEditingSubject] = useState(null);

  const activeCampaign = userData?.campaigns?.find(c => c.id === userData?.activeCampaignId) || userData?.campaigns?.[0] || { subjects: [] };
  const heroStats = userData?.profile?.stats || { int: 20, wis: 20, dex: 20, vit: 20 };
  const statResonances = calculateStatResonances(heroStats);
  const cultivationWindow = userData?.profile?.cultivationWindow || 'EARLY_BIRD';
  const isBonusActive = isCultivationBonusTime(cultivationWindow);

  const handleIncrement = (subjectId, type, count = 1) => {
    audio.playExpGain();
    triggerHapticFeedback('medium');

    const bonusMultiplier = isBonusActive ? (1 + (EXP_TABLE?.CULTIVATION_TIME_BONUS || 0.25)) : 1;
    let baseExp = 0;
    let baseGold = 0;
    let statKey = '';
    let statVal = 0;
    let logDesc = '';

    if (type === 'lecture') {
      const wisMultiplier = 1 + (statResonances.lectureExpBonusPercent / 100);
      baseExp = (EXP_TABLE.LECTURE.exp * count) * wisMultiplier;
      baseGold = EXP_TABLE.LECTURE.gold * count;
      statKey = EXP_TABLE.LECTURE.stat;
      statVal = EXP_TABLE.LECTURE.val * count;
      logDesc = `Completed ${count} Lecture(s)`;
    } else if (type === 'dpp') {
      const dexMultiplier = 1 + (statResonances.pyqGoldBonusPercent / 100);
      baseExp = (EXP_TABLE.DPP.exp * count);
      baseGold = (EXP_TABLE.DPP.gold * count) * dexMultiplier;
      statKey = EXP_TABLE.DPP.stat;
      statVal = EXP_TABLE.DPP.val * count;
      logDesc = `Solved ${count} DPP Sheet(s)`;
    } else if (type === 'question') {
      const dexMultiplier = 1 + (statResonances.pyqGoldBonusPercent / 100);
      baseExp = EXP_TABLE.QUESTION.exp * count;
      baseGold = (EXP_TABLE.QUESTION.gold * count) * dexMultiplier;
      statKey = EXP_TABLE.QUESTION.stat;
      statVal = EXP_TABLE.QUESTION.val * count;
      logDesc = `Solved ${count} Practice Question(s)`;
    } else if (type === 'pyq') {
      const dexMultiplier = 1 + (statResonances.pyqGoldBonusPercent / 100);
      baseExp = EXP_TABLE.PYQ.exp * count;
      baseGold = (EXP_TABLE.PYQ.gold * count) * dexMultiplier;
      statKey = EXP_TABLE.PYQ.stat;
      statVal = EXP_TABLE.PYQ.val * count;
      logDesc = `Solved ${count} GATE PYQ(s)`;
    } else if (type === 'revision') {
      baseExp = EXP_TABLE.REVISION.exp * count;
      baseGold = EXP_TABLE.REVISION.gold * count;
      statKey = EXP_TABLE.REVISION.stat;
      statVal = EXP_TABLE.REVISION.val * count;
      logDesc = `Completed ${count} Revision Session(s)`;
    }

    const totalExpGain = Math.round(baseExp * bonusMultiplier);
    const totalGoldGain = Math.round(baseGold);

    setUserData(prev => {
      let targetSubj = null;

      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id !== prev.activeCampaignId) return camp;

        const updatedSubjects = camp.subjects.map(subj => {
          if (subj.id !== subjectId) return subj;
          targetSubj = subj;

          if (type === 'lecture') {
            return { ...subj, completedLectures: (subj.completedLectures || 0) + count };
          } else if (type === 'dpp') {
            return { ...subj, completedDpps: (subj.completedDpps || 0) + count };
          } else if (type === 'question') {
            return { ...subj, completedQuestions: (subj.completedQuestions || 0) + count };
          } else if (type === 'pyq') {
            return { ...subj, completedPyqs: (subj.completedPyqs || 0) + count };
          } else if (type === 'revision') {
            return { ...subj, completedRevisions: (subj.completedRevisions || 0) + count };
          }
          return subj;
        });

        return { ...camp, subjects: updatedSubjects };
      });

      return {
        ...prev,
        profile: {
          ...prev.profile,
          totalExp: (prev.profile?.totalExp || 0) + totalExpGain,
          gold: (prev.profile?.gold || 0) + totalGoldGain,
          stats: {
            ...prev.profile?.stats,
            [statKey]: (prev.profile?.stats?.[statKey] || 20) + statVal
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
          ...(prev.activityLogs || [])
        ]
      };
    });
  };

  const deleteSubject = (subjectId) => {
    if (!window.confirm("Remove this subject from active curriculum?")) return;
    
    audio.playClick();
    triggerHapticFeedback('light');
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
    <div className="space-y-5">
      
      {/* Active Campaign Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Active Study Curriculum
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <select
              value={userData.activeCampaignId}
              onChange={(e) => {
                audio.playClick();
                triggerHapticFeedback('light');
                setUserData(prev => ({ ...prev, activeCampaignId: e.target.value }));
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
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
            onClick={() => {
              triggerHapticFeedback('light');
              onOpenAddSubject();
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Subject
          </button>
        </div>
      </div>

      {/* Subjects Grid */}
      {activeCampaign?.subjects?.length === 0 ? (
        <div className="rounded-2xl p-8 text-center border border-dashed border-slate-800 bg-slate-900/40">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No Subjects in Active Curriculum</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-3">
            Add curriculum subjects to begin logging lectures, DPPs, and practice questions.
          </p>
          <button
            onClick={onOpenAddSubject}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCampaign.subjects.map(subject => {
            const totalLectures = subject.totalLectures || 25;
            const totalDpps = subject.totalDpps || 20;
            const targetQuestions = subject.targetQuestions || 150;
            const targetPyqs = subject.targetPyqs || 100;

            const lectureProgress = Math.min(100, Math.round(((subject.completedLectures || 0) / totalLectures) * 100));
            const dppProgress = Math.min(100, Math.round(((subject.completedDpps || 0) / totalDpps) * 100));
            const questionProgress = Math.min(100, Math.round(((subject.completedQuestions || 0) / targetQuestions) * 100));
            const pyqProgress = Math.min(100, Math.round(((subject.completedPyqs || 0) / targetPyqs) * 100));

            const isOverdriveLectures = (subject.completedLectures || 0) > totalLectures;
            const isOverdriveDpps = (subject.completedDpps || 0) > totalDpps;
            const isOverdriveQuestions = (subject.completedQuestions || 0) > targetQuestions;
            const isOverdrivePyqs = (subject.completedPyqs || 0) > targetPyqs;

            return (
              <div 
                key={subject.id}
                className="rounded-2xl p-4 border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {subject.category || 'Core Subject'}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          audio.playClick();
                          triggerHapticFeedback('light');
                          setEditingSubject(subject);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white transition flex items-center gap-1"
                        title="Edit target goals"
                      >
                        <Sliders className="w-3 h-3 text-slate-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => deleteSubject(subject.id)}
                        className="text-slate-600 hover:text-rose-400 transition p-1"
                        title="Remove subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-0.5">{subject.name}</h3>
                  {subject.notes && (
                    <p className="text-xs text-slate-400 line-clamp-1 mb-3">{subject.notes}</p>
                  )}
                </div>

                {/* Progress Gauges */}
                <div className="space-y-2 my-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  
                  {/* 1. Lectures */}
                  <div 
                    onClick={() => setEditingSubject(subject)}
                    className="cursor-pointer group/bar"
                    title="Click to edit targets"
                  >
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-400 flex items-center gap-1 group-hover/bar:text-slate-200 transition">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        Lectures
                      </span>
                      <span className="text-slate-200 font-mono text-[10px] tabular-nums flex items-center gap-1">
                        {subject.completedLectures || 0} / {totalLectures}
                        {isOverdriveLectures && (
                          <span className="text-[8px] text-amber-400 font-bold px-1 rounded bg-amber-950/80 border border-amber-500/30">
                            OVERDRIVE
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOverdriveLectures ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${lectureProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. DPPs */}
                  <div 
                    onClick={() => setEditingSubject(subject)}
                    className="cursor-pointer group/bar"
                    title="Click to edit targets"
                  >
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-400 flex items-center gap-1 group-hover/bar:text-slate-200 transition">
                        <FileText className="w-3 h-3 text-amber-400" />
                        DPP Sheets
                      </span>
                      <span className="text-slate-200 font-mono text-[10px] tabular-nums flex items-center gap-1">
                        {subject.completedDpps || 0} / {totalDpps}
                        {isOverdriveDpps && (
                          <span className="text-[8px] text-amber-400 font-bold px-1 rounded bg-amber-950/80 border border-amber-500/30">
                            OVERDRIVE
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full rounded-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${dppProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Questions */}
                  <div 
                    onClick={() => setEditingSubject(subject)}
                    className="cursor-pointer group/bar"
                    title="Click to edit targets"
                  >
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-400 flex items-center gap-1 group-hover/bar:text-slate-200 transition">
                        <HelpCircle className="w-3 h-3 text-emerald-400" />
                        Practice Questions
                      </span>
                      <span className="text-slate-200 font-mono text-[10px] tabular-nums flex items-center gap-1">
                        {subject.completedQuestions || 0} / {targetQuestions}
                        {isOverdriveQuestions && (
                          <span className="text-[8px] text-amber-400 font-bold px-1 rounded bg-amber-950/80 border border-amber-500/30">
                            OVERDRIVE
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${questionProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. PYQs */}
                  <div 
                    onClick={() => setEditingSubject(subject)}
                    className="cursor-pointer group/bar"
                    title="Click to edit targets"
                  >
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-400 flex items-center gap-1 group-hover/bar:text-slate-200 transition">
                        <Zap className="w-3 h-3 text-blue-400" />
                        GATE PYQs
                      </span>
                      <span className="text-slate-200 font-mono text-[10px] tabular-nums flex items-center gap-1">
                        {subject.completedPyqs || 0} / {targetPyqs}
                        {isOverdrivePyqs && (
                          <span className="text-[8px] text-amber-400 font-bold px-1 rounded bg-amber-950/80 border border-amber-500/30">
                            OVERDRIVE
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full rounded-full bg-blue-400 transition-all duration-300"
                        style={{ width: `${pyqProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 5. Revisions */}
                  <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-purple-400" /> Revisions Completed:
                    </span>
                    <span className="font-mono font-semibold text-purple-300 tabular-nums">
                      {subject.completedRevisions || 0} Rounds
                    </span>
                  </div>
                </div>

                {/* 5 Quick Action Study Logging Buttons */}
                <div className="grid grid-cols-5 gap-1.5 mt-3">
                  <button
                    onClick={() => handleIncrement(subject.id, 'lecture', 1)}
                    className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-[10px] flex flex-col items-center justify-center transition active:scale-95"
                    title="+50 EXP | +2 WIS"
                  >
                    <span>+1 Lec</span>
                    <span className="text-[8px] font-mono text-cyan-400">+50 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'dpp', 1)}
                    className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-[10px] flex flex-col items-center justify-center transition active:scale-95"
                    title="+60 EXP | +3 DEX"
                  >
                    <span>+1 DPP</span>
                    <span className="text-[8px] font-mono text-amber-400">+60 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'question', 10)}
                    className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-[10px] flex flex-col items-center justify-center transition active:scale-95"
                    title="+100 EXP | +10 DEX"
                  >
                    <span>+10 Qs</span>
                    <span className="text-[8px] font-mono text-emerald-400">+100 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'pyq', 10)}
                    className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-[10px] flex flex-col items-center justify-center transition active:scale-95"
                    title="+100 EXP | +10 DEX"
                  >
                    <span>+10 PYQ</span>
                    <span className="text-[8px] font-mono text-blue-400">+100 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'revision', 1)}
                    className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-[10px] flex flex-col items-center justify-center transition active:scale-95"
                    title="+35 EXP | +2 INT"
                  >
                    <span>+1 Rev</span>
                    <span className="text-[8px] font-mono text-purple-400">+35 EXP</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Edit Subject Targets Modal */}
      <EditSubjectModal
        isOpen={Boolean(editingSubject)}
        onClose={() => setEditingSubject(null)}
        subject={editingSubject}
        setUserData={setUserData}
      />

    </div>
  );
}
