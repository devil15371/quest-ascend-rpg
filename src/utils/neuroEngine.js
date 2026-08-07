// Neuroscience Neural Engine: Ebbinghaus Forgetting Curve, Hebbian LTP, and Synaptic Pruning

/**
 * Anatomical Brain Lobe Positions (x, y, z) for 3D Neural Mapping
 */
export const BRAIN_LOBE_POSITIONS = {
  PrefrontalCortex: { x: 0, y: 30, z: 120, lobe: "Prefrontal Cortex (Logic & Math)", color: "#06b6d4" },
  ParietalLobe:     { x: 0, y: 110, z: 10,  lobe: "Parietal Lobe (Spatial & CS Core)", color: "#a855f7" },
  TemporalLobeLeft: { x: -110, y: -20, z: 10, lobe: "Temporal Lobe (Memory & Revision)", color: "#ec4899" },
  TemporalLobeRight:{ x: 110, y: -20, z: 10,  lobe: "Temporal Lobe (Memory & Revision)", color: "#ec4899" },
  OccipitalLobe:    { x: 0, y: -30, z: -120, lobe: "Occipital Lobe (Pattern Recognition)", color: "#eab308" }
};

/**
 * Calculate Memory Retention R(t) using Ebbinghaus Forgetting Curve formula:
 * R(t) = e^(-t / S)
 * where t is elapsed days since last study/revision, and S is memory stability in days.
 */
export function calculateSubjectNeuroState(subject, activityLogs = []) {
  // Find last activity timestamp for this subject
  const subjectLogs = activityLogs.filter(log => log.description.includes(subject.name));
  const lastTimestamp = subjectLogs.length > 0 ? subjectLogs[0].timestamp : Date.now() - (86400000 * 3); // Default 3 days ago if new

  const elapsedDays = Math.max(0.1, (Date.now() - lastTimestamp) / (1000 * 60 * 60 * 24));

  // Base stability S (in days): Starts at 1.5 days for a single lecture
  const revisions = subject.completedRevisions || 0;
  const questions = subject.completedQuestions || 0;
  const lectures = subject.completedLectures || 0;

  // Long-Term Potentiation (LTP) & Myelination formula:
  // Each revision multiplies stability by 2.2x. Practice questions add log stability.
  let stabilityDays = 1.5 + (lectures * 0.5);
  stabilityDays *= Math.pow(2.2, revisions);
  stabilityDays += (questions * 0.08);

  // Retention R(t) = e^(-t / S)
  const retention = Math.max(0.05, Math.exp(-elapsedDays / stabilityDays));
  const retentionPercent = Math.min(100, Math.round(retention * 100));

  // Determine Synaptic Health Status
  let status = 'MYELINATED'; // > 75%
  let statusColor = '#06b6d4'; // Cyan

  if (retentionPercent <= 35) {
    status = 'PRUNING_RISK';
    statusColor = '#ef4444'; // Red
  } else if (retentionPercent <= 70) {
    status = 'DECAYING';
    statusColor = '#eab308'; // Amber
  } else if (retentionPercent > 75) {
    status = 'MYELINATED';
    statusColor = '#10b981'; // Green/Cyan
  }

  // Calculate Myelination Half-Life in Days
  const halfLifeDays = Math.round(stabilityDays * Math.log(2) * 10) / 10;

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    elapsedDays: Math.round(elapsedDays * 10) / 10,
    stabilityDays: Math.round(stabilityDays * 10) / 10,
    halfLifeDays,
    retentionPercent,
    status,
    statusColor,
    synapsesCount: (lectures * 12) + (questions * 4) + (revisions * 25)
  };
}

/**
 * Calculate Global Brain Metrics across all subjects in campaign
 */
export function calculateGlobalBrainMetrics(subjects = [], activityLogs = []) {
  if (subjects.length === 0) {
    return {
      averageRetention: 100,
      totalSynapses: 150,
      pruningRiskCount: 0,
      averageHalfLife: 3.5,
      subjectStates: []
    };
  }

  const subjectStates = subjects.map(s => calculateSubjectNeuroState(s, activityLogs));
  const totalRetention = subjectStates.reduce((acc, curr) => acc + curr.retentionPercent, 0);
  const totalSynapses = subjectStates.reduce((acc, curr) => acc + curr.synapsesCount, 0);
  const totalHalfLife = subjectStates.reduce((acc, curr) => acc + curr.halfLifeDays, 0);
  const pruningRiskCount = subjectStates.filter(s => s.status === 'PRUNING_RISK').length;

  return {
    averageRetention: Math.round(totalRetention / subjects.length),
    totalSynapses: totalSynapses + 300, // Base resting synapses
    pruningRiskCount,
    averageHalfLife: Math.round((totalHalfLife / subjects.length) * 10) / 10,
    subjectStates
  };
}
