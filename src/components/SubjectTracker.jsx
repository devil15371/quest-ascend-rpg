import React, { useState } from 'react';
import { BookOpen, Plus, CheckCircle2, RotateCcw, HelpCircle, Sparkles, FolderPlus, Trash2, Cpu, Sliders, Zap, FileText } from 'lucide-react';
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
    if (!window.confirm("Remove this subject from campaign?")) return;
    
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
    <div className="space-y-6">
      
      {/* Active Campaign Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cyber-panel p-4 rounded-2xl border border-cyan-500/30 bg-slate-950/80 cyber-hud-brackets">
        <div>
          <span className="text-[10px] font-orbitron font-extrabold uppercase tracking-widest text-cyan-400">
            ACTIVE PREPARATION ARC
          </span>
          <div className="flex items-center gap-3 mt-1">
            <select
              value={userData.activeCampaignId}
              onChange={(e) => {
                audio.playClick();
                triggerHapticFeedback('light');
                setUserData(prev => ({ ...prev, activeCampaignId: e.target.value }));
              }}
              className="bg-slate-900 border border-cyan-500/50 rounded-xl px-3 py-2 text-base font-orbitron font-black text-white focus:outline-none focus:border-cyan-400 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              {userData.campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs font-rajdhani text-slate-400 mt-1">{activeCampaign?.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHapticFeedback('light');
              onOpenAddSubject();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 font-orbitron font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition active:scale-95 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Subject Module
          </button>
        </div>
      </div>

      {/* Subjects Grid */}
      {activeCampaign?.subjects?.length === 0 ? (
        <div className="cyber-panel rounded-2xl p-10 text-center border border-dashed border-cyan-500/40">
          <BookOpen className="w-12 h-12 text-cyan-500/60 mx-auto mb-3" />
          <h3 className="text-lg font-orbitron font-bold text-slate-200">No Subjects In Active Campaign</h3>
          <p className="text-xs font-rajdhani text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Add subjects (e.g. OS, Engineering Math, Data Structures) to begin tracking lectures, DPPs, practice questions, and PYQs.
          </p>
          <button
            onClick={onOpenAddSubject}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="cyber-panel-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between cyber-hud-brackets bg-slate-950/80 group hover:border-cyan-500/60 transition-all duration-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-[9px] font-orbitron font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                      {subject.category || 'Core Subject'}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          audio.playClick();
                          triggerHapticFeedback('light');
                          setEditingSubject(subject);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/60 text-[10px] font-orbitron font-bold text-slate-300 hover:text-cyan-300 transition flex items-center gap-1"
                        title="Customize Target Numbers for this subject"
                      >
                        <Sliders className="w-3 h-3 text-cyan-400" />
                        <span>Edit Targets</span>
                      </button>

                      <button
                        onClick={() => deleteSubject(subject.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Remove subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-orbitron font-bold text-white mb-1">{subject.name}</h3>
                  {subject.notes && (
                    <p className="text-xs font-rajdhani text-slate-400 line-clamp-2 mb-3">{subject.notes}</p>
                  )}
                </div>

                {/* 5-Metric Progress Gauges (Lectures, DPPs, Practice Questions, PYQs, Revisions) */}
                <div className="space-y-2.5 my-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  
                  {/* 1. Lectures Gauge */}
                  <div 
                    onClick={() => setEditingSubject(subject)}
                    className="cursor-pointer group/bar"
                    title="Click to customize lecture target"
                  >
                    <div className="flex justify-between text-[11px] font-semibold mb-1 font-orbitron">
                      <span className="text-slate-300 flex items-center gap-1 group-hover/bar:text-cyan-300 transition">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        Lectures Done
                      </span>
                      <span className="text-cyan-300 font-mono flex items-center gap-1">
                        {subject.completedLectures || 0} / {totalLectures}
                        {isOverdriveLectures && (
                          <span className="text-[8px] text-amber-400 font-extrabold px-1 rounded bg-amber-950/80 border border-amber-500/40">
                            ⚡ OVERDRIVE
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                          isOverdriveLectures 
                            ? 'bg-gradient-to-r from-cyan-400 via-amber-400 to-pink-500 shadow-amber-500/50' 
                            : 'bg-gradient-to-r from-cyan-400 to-blue-600 shadow-cyan-500/50'
                        }`}
                        style={{ width: `${lectureProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. DPPs Gauge */}
                  <div 
                    onClick={() => setEditingSubject(subject)}
                    className="cursor-pointer group/bar"
                    title="Click to customize DPP target"
                  >
                    <div className="flex justify-between text-[11px] font-semibold mb-1 font-orbitron">
                      <span className="text-slate-300 flex items-center gap-1 group-hover/bar:text-amber-300 transition">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        DPP Sheets Done
                      </span>
                      <span className="text-amber-300 font-mono flex items-center gap-1">
                        {subject.completedDpps || 0} / {totalDpps}
                        {isOverdriveDpps && (
                          <span className="text-[8px] text-amber-400 font-extrabold px-1 rounded bg-amber-950/80 border border-amber-500/40">
                            ⚡ OVERDRIVE
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                          isOverdriveDpps 
                            ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-500 shadow-amber-500/50' 
                            : 'bg-gradient-to-r from-amber-400 to-orange-600 shadow-amber-500/50'
                        }`}
                        style={{ width: `${dppProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Practice Questions Gauge */}
                  <div 
                    onClick={() => setEditingSubject(subject)}
                    className="cursor-pointer group/bar"
                    title="Click to customize question target"
                  >
                    <div className="flex justify-between text-[11px] font-semibold mb-1 font-orbitron">
                      <span className="text-slate-300 flex items-center gap-1 group-hover/bar:text-emerald-300 transition">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Questions Done
                      </span>
                      <span className="text-emerald-300 font-mono flex items-center gap-1">
                        {subject.completedQuestions || 0} / {targetQuestions}
                        {isOverdriveQuestions && (
                          <span className="text-[8px] text-amber-400 font-extrabold px-1 rounded bg-amber-950/80 border border-amber-500/40">
                            ⚡ OVERDRIVE
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                          isOverdriveQuestions 
                            ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-pink-500 shadow-amber-500/50' 
                            : 'bg-gradient-to-r from-emerald-400 to-teal-600 shadow-emerald-500/50'
                        }`}
                        style={{ width: `${questionProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. GATE PYQs Gauge */}
                  <div 
                    onClick={() => setEditingSubject(subject)}
                    className="cursor-pointer group/bar"
                    title="Click to customize PYQ target"
                  >
                    <div className="flex justify-between text-[11px] font-semibold mb-1 font-orbitron">
                      <span className="text-slate-300 flex items-center gap-1 group-hover/bar:text-blue-300 transition">
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                        PYQs Solved
                      </span>
                      <span className="text-blue-300 font-mono flex items-center gap-1">
                        {subject.completedPyqs || 0} / {targetPyqs}
                        {isOverdrivePyqs && (
                          <span className="text-[8px] text-amber-400 font-extrabold px-1 rounded bg-amber-950/80 border border-amber-500/40">
                            ⚡ OVERDRIVE
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                          isOverdrivePyqs 
                            ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-500 shadow-blue-500/50' 
                            : 'bg-gradient-to-r from-blue-400 to-indigo-600 shadow-blue-500/50'
                        }`}
                        style={{ width: `${pyqProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 5. Revisions Completed */}
                  <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-800">
                    <span className="text-slate-400 font-rajdhani flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-purple-400" /> Revisions Completed:
                    </span>
                    <span className="font-orbitron font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40">
                      {subject.completedRevisions || 0} Rounds
                    </span>
                  </div>
                </div>

                {/* 5 Quick Action Study Logging Buttons */}
                <div className="grid grid-cols-5 gap-1.5 mt-3">
                  <button
                    onClick={() => handleIncrement(subject.id, 'lecture', 1)}
                    className="px-1.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 font-orbitron font-bold text-[10px] flex flex-col items-center justify-center transition active:scale-95 shadow-sm shadow-cyan-500/20"
                    title="+50 EXP | +2 WIS"
                  >
                    <span>+1 Lec</span>
                    <span className="text-[8px] text-cyan-400 font-mono">+50 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'dpp', 1)}
                    className="px-1.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 font-orbitron font-bold text-[10px] flex flex-col items-center justify-center transition active:scale-95 shadow-sm shadow-amber-500/20"
                    title="+60 EXP | +3 DEX"
                  >
                    <span>+1 DPP</span>
                    <span className="text-[8px] text-amber-400 font-mono">+60 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'question', 10)}
                    className="px-1.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-orbitron font-bold text-[10px] flex flex-col items-center justify-center transition active:scale-95 shadow-sm shadow-emerald-500/20"
                    title="+100 EXP | +10 DEX"
                  >
                    <span>+10 Qs</span>
                    <span className="text-[8px] text-emerald-400 font-mono">+100 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'pyq', 10)}
                    className="px-1.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 text-blue-200 font-orbitron font-bold text-[10px] flex flex-col items-center justify-center transition active:scale-95 shadow-sm shadow-blue-500/20"
                    title="+100 EXP | +10 DEX"
                  >
                    <span>+10 PYQ</span>
                    <span className="text-[8px] text-blue-400 font-mono">+100 EXP</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(subject.id, 'revision', 1)}
                    className="px-1.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-orbitron font-bold text-[10px] flex flex-col items-center justify-center transition active:scale-95 shadow-sm shadow-purple-500/20"
                    title="+35 EXP | +2 INT"
                  >
                    <span>+1 Rev</span>
                    <span className="text-[8px] text-purple-400 font-mono">+35 EXP</span>
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
