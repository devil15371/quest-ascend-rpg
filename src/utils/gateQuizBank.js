// GATE Exam Knowledge Verification Quiz Bank

export const GATE_QUIZ_BANK = {
  "Operating Systems": [
    {
      id: "os_q1",
      topic: "Process Synchronization",
      question: "In Peterson's algorithm for two processes P0 and P1, which variable prevents mutual exclusion failure?",
      options: [
        "A) flag[i] alone",
        "B) turn variable alone",
        "C) Combination of flag[i] and turn variable",
        "D) Hardware Atomic TestAndSet instruction"
      ],
      correctIndex: 2,
      explanation: "Peterson's algorithm relies on both the flag array (indicating intent) and the turn variable (resolving tie-breaks) to satisfy mutual exclusion and progress."
    },
    {
      id: "os_q2",
      topic: "Memory Management",
      question: "Consider a virtual memory system with 32-bit logical addresses and 4 KB page size. How many entries are in a single-level page table?",
      options: [
        "A) 2^20 (1,048,576 entries)",
        "B) 2^12 (4,096 entries)",
        "C) 2^32 entries",
        "D) 2^16 entries"
      ],
      correctIndex: 0,
      explanation: "Page size = 4 KB = 2^12 bytes. Number of pages = 2^32 / 2^12 = 2^20 entries."
    },
    {
      id: "os_q3",
      topic: "Deadlocks",
      question: "Which of the following conditions is NOT required for a deadlock to occur?",
      options: [
        "A) Mutual Exclusion",
        "B) Hold and Wait",
        "C) Preemption allowed by kernel",
        "D) Circular Wait"
      ],
      correctIndex: 2,
      explanation: "No Preemption is a required Coffman deadlock condition. If preemption is allowed, deadlocks cannot persist."
    }
  ],

  "Engineering Mathematics": [
    {
      id: "math_q1",
      topic: "Linear Algebra",
      question: "If a 3x3 matrix A has eigenvalues 1, 2, and -3, what is the determinant of matrix A?",
      options: [
        "A) 0",
        "B) 6",
        "C) -6",
        "D) 12"
      ],
      correctIndex: 2,
      explanation: "The determinant of a matrix is equal to the product of its eigenvalues: Det(A) = 1 * 2 * (-3) = -6."
    },
    {
      id: "math_q2",
      topic: "Calculus",
      question: "What is the value of limit as x -> 0 for (sin(x) - x) / x^3?",
      options: [
        "A) 0",
        "B) -1/6",
        "C) 1/6",
        "D) 1"
      ],
      correctIndex: 1,
      explanation: "Applying L'Hopital's Rule thrice yields limit = -1/6."
    },
    {
      id: "math_q3",
      topic: "Probability",
      question: "If two events A and B are independent with P(A) = 0.4 and P(B) = 0.5, what is P(A U B)?",
      options: [
        "A) 0.9",
        "B) 0.7",
        "C) 0.2",
        "D) 0.5"
      ],
      correctIndex: 1,
      explanation: "P(A U B) = P(A) + P(B) - P(A ∩ B). Since independent, P(A ∩ B) = 0.4 * 0.5 = 0.2. So P(A U B) = 0.4 + 0.5 - 0.2 = 0.7."
    }
  ],

  "Algorithms & Data Structures": [
    {
      id: "algo_q1",
      topic: "Dynamic Programming",
      question: "What is the time complexity of solving 0/1 Knapsack with N items and Capacity W using Dynamic Programming?",
      options: [
        "A) O(N log N)",
        "B) O(2^N)",
        "C) O(N * W)",
        "D) O(N^2)"
      ],
      correctIndex: 2,
      explanation: "The standard DP table for 0/1 Knapsack is of size (N+1) x (W+1), running in pseudo-polynomial time O(N * W)."
    },
    {
      id: "algo_q2",
      topic: "Graph Algorithms",
      question: "Dijkstra's shortest path algorithm fails for graphs containing which feature?",
      options: [
        "A) Directed cycles",
        "B) Negative edge weights",
        "C) Disconnected components",
        "D) Self loops"
      ],
      correctIndex: 1,
      explanation: "Dijkstra's greedy strategy assumes non-negative edge weights and can produce incorrect results for negative edge weights."
    }
  ],

  "Database Management Systems": [
    {
      id: "dbms_q1",
      topic: "Transactions & Concurrency",
      question: "Which isolation level prevents Dirty Reads but allows Non-Repeatable Reads?",
      options: [
        "A) Read Uncommitted",
        "B) Read Committed",
        "C) Repeatable Read",
        "D) Serializable"
      ],
      correctIndex: 1,
      explanation: "Read Committed prevents dirty reads by requiring shared locks before reading, but non-repeatable reads can still happen."
    }
  ]
};

/**
 * Get 3 Quiz Questions for a given subject
 */
export function getGATEVerificationQuiz(subjectName) {
  const list = GATE_QUIZ_BANK[subjectName] || GATE_QUIZ_BANK["Operating Systems"];
  // Shuffle or return 3 questions
  return list.slice(0, 3);
}
