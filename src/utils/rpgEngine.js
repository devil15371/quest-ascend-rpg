// RPG Game Logic, EXP Formulas, Ranks, and Guild Master AI dialogue generator

export const RANK_TIERS = [
  { minLevel: 1, maxLevel: 4, name: "E-Rank Novice", badge: "🥉", color: "text-amber-600 border-amber-600/30 bg-amber-950/20" },
  { minLevel: 5, maxLevel: 9, name: "D-Rank Apprentice", badge: "🥈", color: "text-slate-300 border-slate-400/30 bg-slate-900/30" },
  { minLevel: 10, maxLevel: 14, name: "C-Rank Scholar", badge: "🥇", color: "text-yellow-400 border-yellow-500/30 bg-yellow-950/20" },
  { minLevel: 15, maxLevel: 24, name: "B-Rank Strategist", badge: "💎", color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20" },
  { minLevel: 25, maxLevel: 39, name: "A-Rank Master", badge: "🏆", color: "text-purple-400 border-purple-500/30 bg-purple-950/20" },
  { minLevel: 40, maxLevel: 999, name: "S-Rank Sovereign", badge: "👑", color: "text-amber-300 border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-purple-600/20 shadow-lg shadow-amber-500/10" }
];

export const EXP_TABLE = {
  LECTURE: { exp: 50, gold: 20, stat: 'int', val: 15 },
  REVISION: { exp: 35, gold: 15, stat: 'wis', val: 12 },
  QUESTION: { exp: 10, gold: 5, stat: 'dex', val: 3 },
  DAILY_QUEST: { exp: 80, gold: 35, stat: 'vit', val: 10 },
  EARLY_BIRD_BONUS: 0.25 // +25% bonus EXP
};

export const DEFAULT_SHOP_ITEMS = [
  {
    id: "shop_rest_day",
    name: "🛡️ Rest Day Pass",
    category: "Consumable",
    price: 200,
    icon: "ShieldAlert",
    description: "Freezes daily quest penalties & protects streak for 24 hours. Take a guilt-free rest!",
    type: "REST_PASS",
    stock: -1
  },
  {
    id: "shop_gaming_break",
    name: "🎮 1-Hour Gaming / Chill Ticket",
    category: "Real-Life Reward",
    price: 150,
    icon: "Gamepad2",
    description: "Earn 60 uninterrupted minutes of your favorite game or movie.",
    type: "REAL_REWARD",
    stock: -1
  },
  {
    id: "shop_snack_cheat",
    name: "🍕 Cheat Snack Pass",
    category: "Real-Life Reward",
    price: 250,
    icon: "Pizza",
    description: "Treat yourself to a delicious coffee or favorite snack guilt-free.",
    type: "REAL_REWARD",
    stock: -1
  },
  {
    id: "shop_title_shadow",
    name: "👑 Title: Shadow Monarch",
    category: "Cosmetic Title",
    price: 500,
    icon: "Sparkles",
    description: "Unlock the exclusive glowing title 'Shadow Monarch' on your profile card.",
    type: "COSMETIC_TITLE",
    titleName: "Shadow Monarch",
    stock: 1
  }
];

export function calculateLevel(totalExp) {
  // Level formula: Each level requires level * 120 EXP
  let level = 1;
  let expRemaining = totalExp;
  
  while (expRemaining >= level * 120) {
    expRemaining -= level * 120;
    level++;
  }
  
  const nextLevelNeeded = level * 120;
  const progressPercent = Math.min(100, Math.round((expRemaining / nextLevelNeeded) * 100));

  return {
    level,
    currentLevelExp: expRemaining,
    nextLevelNeeded,
    progressPercent
  };
}

export function getRankTier(level) {
  return RANK_TIERS.find(r => level >= r.minLevel && level <= r.maxLevel) || RANK_TIERS[0];
}

export function isEarlyBirdTime() {
  const now = new Date();
  const hours = now.getHours();
  // Before 8:00 AM qualifies as Early Bird!
  return hours < 8;
}

export function generateGuildMasterMessage({ name, level, streak, restDayActive, lastCompletedSubject, totalExp }) {
  const rank = getRankTier(level);
  
  if (restDayActive) {
    return {
      emotion: "relaxed",
      quote: `Rest is vital for true warriors, ${name}. Your rest day shield is active—recharge your mind for tomorrow's grind!`
    };
  }

  if (streak >= 7) {
    return {
      emotion: "hyped",
      quote: `🔥 UNSTOPPABLE! A ${streak}-day streak! You operate like an S-Rank hunter. Keep this momentum roaring!`
    };
  }

  if (isEarlyBirdTime()) {
    return {
      emotion: "inspired",
      quote: `🌅 Sunrise Warrior! Logging in early awards you a +25% EXP Early Bird Boost. Conquer the morning, conquer the day!`
    };
  }

  if (level >= 10) {
    return {
      emotion: "proud",
      quote: `You've achieved ${rank.name} status (${rank.badge})! Every lecture done brings you closer to GATE top rank.`
    };
  }

  const quotes = [
    `Welcome back, ${name}! Ready to turn lectures into EXP today?`,
    `Consistency is the secret weapon of champions. Let's finish today's targets!`,
    `Every practice question solved adds to your DEX stat. Keep pushing!`,
    `Need a rest? Earn Gold Coins from completing daily quests and buy a Rest Day Pass!`
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  return {
    emotion: "focused",
    quote: randomQuote
  };
}
