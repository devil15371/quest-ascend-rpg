// Preset Campaign Templates for 1-Click Setup

export const PRESET_CAMPAIGNS = {
  gate_cs: {
    id: "gate_cs",
    name: "GATE Computer Science 2027 Arc",
    description: "Complete preparation campaign for GATE CS & IT including Math, Core CS, and PYQs.",
    subjects: [
      {
        id: "subj_math",
        name: "Engineering Mathematics & Aptitude",
        category: "Mathematics",
        color: "from-blue-600 to-indigo-600",
        icon: "Calculator",
        totalLectures: 25,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 200,
        notes: "Linear Algebra, Calculus, Probability, Discrete Math"
      },
      {
        id: "subj_ds_algo",
        name: "Data Structures & Algorithms",
        category: "Core CS",
        color: "from-emerald-500 to-teal-700",
        icon: "Code",
        totalLectures: 35,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 300,
        notes: "Trees, Graphs, Dynamic Programming, Sorting, Hash tables"
      },
      {
        id: "subj_os",
        name: "Operating Systems",
        category: "Systems",
        color: "from-violet-600 to-purple-800",
        icon: "Cpu",
        totalLectures: 24,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 180,
        notes: "Process Synchronization, Deadlocks, Memory Management, File Systems"
      },
      {
        id: "subj_dbms",
        name: "Database Management Systems",
        category: "Systems",
        color: "from-amber-500 to-orange-600",
        icon: "Database",
        totalLectures: 20,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 150,
        notes: "ER Diagrams, Relational Algebra, SQL, Normalization, Transactions"
      },
      {
        id: "subj_cn",
        name: "Computer Networks",
        category: "Systems",
        color: "from-cyan-500 to-blue-700",
        icon: "Network",
        totalLectures: 22,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 160,
        notes: "OSI Layers, IP Addressing, TCP/UDP, Flow Control, Routing"
      },
      {
        id: "subj_toc_compiler",
        name: "Theory of Computation & Compilers",
        category: "Theoretical CS",
        color: "from-rose-500 to-red-700",
        icon: "Binary",
        totalLectures: 28,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 200,
        notes: "DFA/NFA, Context-Free Grammars, Turing Machines, Parsing, Syntax Trees"
      },
      {
        id: "subj_coa",
        name: "Computer Organization & Architecture",
        category: "Hardware",
        color: "from-fuchsia-600 to-pink-800",
        icon: "HardDrive",
        totalLectures: 20,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 150,
        notes: "Pipelining, Cache Memory, Machine Instructions, ALU, Addressing Modes"
      }
    ]
  },
  fullstack: {
    id: "fullstack",
    name: "Full-Stack Software Engineer Arc",
    description: "Master Modern Web Development, System Design, and Frontend/Backend mastery.",
    subjects: [
      {
        id: "fs_frontend",
        name: "React, Next.js & Modern UI",
        category: "Frontend",
        color: "from-cyan-500 to-blue-600",
        icon: "Layout",
        totalLectures: 30,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 100,
        notes: "Hooks, State Management, SSR, Styling, Performance"
      },
      {
        id: "fs_backend",
        name: "Node.js, Express & Microservices",
        category: "Backend",
        color: "from-emerald-600 to-green-800",
        icon: "Server",
        totalLectures: 25,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 80,
        notes: "REST APIs, GraphQL, Authentication, Caching, Event Loops"
      },
      {
        id: "fs_sysdesign",
        name: "System Design & Distributed Systems",
        category: "Architecture",
        color: "from-purple-600 to-indigo-800",
        icon: "Layers",
        totalLectures: 20,
        completedLectures: 0,
        completedRevisions: 0,
        completedQuestions: 0,
        targetQuestions: 60,
        notes: "Load Balancing, Sharding, Message Queues, CAP Theorem"
      }
    ]
  },
  custom: {
    id: "custom",
    name: "Custom Hero Arc",
    description: "Build your own personalized set of subjects and goals from scratch.",
    subjects: []
  }
};
