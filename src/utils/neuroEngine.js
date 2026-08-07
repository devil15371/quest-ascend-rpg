// Neuroscience Neural Engine: Ebbinghaus Forgetting Curve, Hebbian LTP, and Obsidian Sub-Node Generator

/**
 * Anatomical Brain Lobe Regions for 3D Graph Node Placement
 */
export const BRAIN_REGIONS = [
  { name: "Prefrontal Cortex (Logic & Math)", basePos: { x: 0, y: 45, z: 110 }, color: "#06b6d4" },
  { name: "Parietal Lobe (CS Core & Systems)", basePos: { x: 0, y: 110, z: 20 }, color: "#a855f7" },
  { name: "Temporal Lobe Left (Memory & Revision)", basePos: { x: -110, y: -15, z: 20 }, color: "#ec4899" },
  { name: "Temporal Lobe Right (Memory & Revision)", basePos: { x: 110, y: -15, z: 20 }, color: "#ec4899" },
  { name: "Occipital Lobe (Pattern & PYQs)", basePos: { x: 0, y: -35, z: -110 }, color: "#eab308" },
  { name: "Cerebellum (Speed & Execution)", basePos: { x: 0, y: -90, z: -70 }, color: "#10b981" }
];

/**
 * Calculate Memory Retention R(t) using Ebbinghaus Forgetting Curve formula:
 * R(t) = e^(-t / S)
 */
export function calculateSubjectNeuroState(subject, activityLogs = []) {
  const subjectLogs = activityLogs.filter(log => log.description.includes(subject.name));
  const lastTimestamp = subjectLogs.length > 0 ? subjectLogs[0].timestamp : Date.now() - (86400000 * 2.5);

  const elapsedDays = Math.max(0.1, (Date.now() - lastTimestamp) / (1000 * 60 * 60 * 24));

  const revisions = subject.completedRevisions || 0;
  const questions = subject.completedQuestions || 0;
  const lectures = subject.completedLectures || 0;

  // Stability S (days)
  let stabilityDays = 1.5 + (lectures * 0.5);
  stabilityDays *= Math.pow(2.2, revisions);
  stabilityDays += (questions * 0.08);

  const retention = Math.max(0.05, Math.exp(-elapsedDays / stabilityDays));
  const retentionPercent = Math.min(100, Math.round(retention * 100));

  let status = 'MYELINATED';
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

  const halfLifeDays = Math.round(stabilityDays * Math.log(2) * 10) / 10;

  // Generate Obsidian Sub-Topic Graph Nodes
  const subNodes = [
    { name: `${subject.name} (Core Concepts)`, size: 14 + (lectures * 0.4), type: 'HUB' },
    { name: `Revisions (${revisions} rounds)`, size: 8 + (revisions * 1.5), type: 'REVISION' },
    { name: `Practice Questions (${questions} solved)`, size: 8 + (questions * 0.05), type: 'QUESTION' },
    { name: `Notes & Practice Bank`, size: 7, type: 'CONCEPT' }
  ];

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    elapsedDays: Math.round(elapsedDays * 10) / 10,
    stabilityDays: Math.round(stabilityDays * 10) / 10,
    halfLifeDays,
    retentionPercent,
    status,
    statusColor,
    synapsesCount: (lectures * 12) + (questions * 4) + (revisions * 25),
    subNodes
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
    totalSynapses: totalSynapses + 450,
    pruningRiskCount,
    averageHalfLife: Math.round((totalHalfLife / subjects.length) * 10) / 10,
    subjectStates
  };
}
