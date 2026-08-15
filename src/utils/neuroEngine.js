// Neuroscience Neural Engine: Ebbinghaus Forgetting Curve & Multi-Tier Subject/Topic Hierarchy

import { safeNum } from './safeMath';

/**
 * Anatomical Brain Lobe Regions for 3D Graph Node Placement
 */
export const BRAIN_REGIONS = [
  { name: "Prefrontal Cortex (Logic & Math)", basePos: { x: 0, y: 45, z: 120 } },
  { name: "Parietal Lobe (CS Core & Systems)", basePos: { x: 0, y: 110, z: 20 } },
  { name: "Temporal Lobe Left (Memory & Revision)", basePos: { x: -115, y: -15, z: 20 } },
  { name: "Temporal Lobe Right (Memory & Revision)", basePos: { x: 115, y: -15, z: 20 } },
  { name: "Occipital Lobe (Pattern & PYQs)", basePos: { x: 0, y: -35, z: -115 } },
  { name: "Cerebellum (Speed & Execution)", basePos: { x: 0, y: -90, z: -70 } }
];

/**
 * Syllabus Preset Topic Breakdown per Subject Category
 */
export const SUBJECT_SYLLABUS_TREES = {
  "Operating Systems": [
    {
      topicName: "Process Synchronization",
      subTopics: ["Peterson's Algorithm", "Semaphores & Mutex", "Monitors", "Classic Readers-Writers"]
    },
    {
      topicName: "CPU Scheduling",
      subTopics: ["FCFS & SJF Scheduling", "Round Robin (RR)", "Multi-Level Queue", "Context Switch Overhead"]
    },
    {
      topicName: "Memory Management",
      subTopics: ["Paging & Segmentation", "Virtual Memory & Demand Paging", "LRU & FIFO Page Replacement", "TLB Miss Rate & Inverted Page Table"]
    },
    {
      topicName: "Deadlocks & Storage",
      subTopics: ["Banker's Avoidance Algorithm", "Resource Allocation Graph", "RAID Storage Systems", "Disk Scheduling (SCAN / C-LOOK)"]
    }
  ],
  "Engineering Mathematics": [
    {
      topicName: "Linear Algebra",
      subTopics: ["Eigenvalues & Eigenvectors", "System of Linear Equations", "Matrix Rank & Determinants", "LU Decomposition"]
    },
    {
      topicName: "Calculus",
      subTopics: ["Limits & Continuity", "Mean Value Theorems", "Definite & Double Integrals", "Vector Calculus & Gradient"]
    },
    {
      topicName: "Probability & Stats",
      subTopics: ["Bayes' Theorem", "Poisson & Normal Distribution", "Random Variables & Expectation", "Combinatorics"]
    }
  ],
  "Algorithms & Data Structures": [
    {
      topicName: "Dynamic Programming",
      subTopics: ["0/1 Knapsack Problem", "Longest Common Subsequence", "Matrix Chain Multiplication", "Bellman-Ford Shortest Path"]
    },
    {
      topicName: "Graph Algorithms",
      subTopics: ["Dijkstra's Algorithm", "Kruskal & Prim's MST", "BFS & DFS Traversal", "Topological Sorting"]
    },
    {
      topicName: "Sorting & Searching",
      subTopics: ["QuickSort & MergeSort Analysis", "HeapSort & Priority Queues", "Binary Search Trees", "AVL & Red-Black Trees"]
    }
  ],
  "Database Management Systems": [
    {
      topicName: "Relational Algebra & SQL",
      subTopics: ["Tuple Relational Calculus", "Nested Subqueries", "Joins (Inner, Outer, Natural)", "Group By & Having"]
    },
    {
      topicName: "Normalization & Functional Dependencies",
      subTopics: ["1NF, 2NF, 3NF, BCNF", "Lossless Join Decomposition", "Dependency Preserving", "Canonical Cover"]
    },
    {
      topicName: "Transactions & Concurrency",
      subTopics: ["ACID Properties", "Conflict & View Serializability", "Two-Phase Locking (2PL)", "Timestamp Ordering Protocol"]
    }
  ],
  "Theory of Computation": [
    {
      topicName: "Finite Automata",
      subTopics: ["DFA & NFA Minimization", "Regular Expressions", "Pumping Lemma for Regular", "Myhill-Nerode Theorem"]
    },
    {
      topicName: "Context-Free Grammars",
      subTopics: ["Pushdown Automata (PDA)", "Chomsky Normal Form", "Ambiguity in CFG", "Pumping Lemma for CFL"]
    },
    {
      topicName: "Turing Machines & Decidability",
      subTopics: ["Halting Problem", "Rice's Theorem", "Undecidability Proofs", "Post Correspondence Problem (PCP)"]
    }
  ],
  "Computer Networks": [
    {
      topicName: "Data Link Layer",
      subTopics: ["Sliding Window Protocols (Go-Back-N, SR)", "CRC & Framing", "CSMA/CD & Ethernet", "Efficiency Calculations"]
    },
    {
      topicName: "Network Layer & Routing",
      subTopics: ["IPv4 & IPv6 Subnetting / CIDR", "Dijkstra OSPF Routing", "Distance Vector (Bellman-Ford)", "NAT & Fragmentation"]
    },
    {
      topicName: "Transport Layer",
      subTopics: ["TCP Congestion Control & AIMD", "TCP 3-Way Handshake", "Flow Control & Window Size", "UDP Checksum"]
    }
  ]
};

export const DEFAULT_TOPIC_TREE = [
  {
    topicName: "Core Concepts & Fundamentals",
    subTopics: ["Definitions & Axioms", "Standard Paradigms", "Edge Cases & Exceptions", "Solved Standard Examples"]
  },
  {
    topicName: "Advanced Analytical Principles",
    subTopics: ["Time & Space Complexity", "Optimization Theorems", "Mathematical Proofs", "GATE PYQ Traps"]
  }
];

/**
 * Calculate Memory Retention R(t) using Ebbinghaus Forgetting Curve formula:
 * R(t) = e^(-t / S)
 * INT stat boosts memory stability S by up to +25%
 */
export function calculateSubjectNeuroState(subject, activityLogs = [], heroStats = {}) {
  const subjectLogs = activityLogs.filter(log => log.description.includes(subject.name));
  const lastTimestamp = subjectLogs.length > 0 ? subjectLogs[0].timestamp : Date.now() - (86400000 * 2.5);

  const elapsedDays = Math.max(0.1, (Date.now() - lastTimestamp) / (1000 * 60 * 60 * 24));

  const revisions = subject.completedRevisions || 0;
  const questions = subject.completedQuestions || 0;
  const lectures = subject.completedLectures || 0;

  // Hero INT provides cognitive resilience against forgetting: up to +25% stability
  const intStat = safeNum(heroStats.int, 20);
  const intStabilityMultiplier = 1 + Math.min(0.25, Math.max(0, (intStat - 20) / 160));

  // Stability S (days)
  let stabilityDays = (1.5 + (lectures * 0.5)) * intStabilityMultiplier;
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

  // Build Multi-Tier Syllabus Tree Structure
  const syllabusTree = SUBJECT_SYLLABUS_TREES[subject.name] || DEFAULT_TOPIC_TREE;

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
    syllabusTree
  };
}

/**
 * Calculate Global Brain Metrics across all subjects in campaign
 */
export function calculateGlobalBrainMetrics(subjects = [], activityLogs = [], heroStats = {}) {
  if (subjects.length === 0) {
    return {
      averageRetention: 100,
      totalSynapses: 150,
      pruningRiskCount: 0,
      averageHalfLife: 3.5,
      subjectStates: []
    };
  }

  const subjectStates = subjects.map(s => calculateSubjectNeuroState(s, activityLogs, heroStats));
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
