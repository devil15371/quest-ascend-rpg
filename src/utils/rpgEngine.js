// RPG Engine: Non-Linear Cultivation Realm EXP Formula, Stat Scaling, and Guild Master AI Quotes

/**
 * Cultivation Realm Definitions
 */
export const CULTIVATION_REALMS = [
  { minLevel: 1,  maxLevel: 10,  name: "Mortal Realm",           badge: "🥉", color: "text-slate-400", border: "border-slate-700" },
  { minLevel: 11, maxLevel: 25,  name: "Qi Condensation",        badge: "⚡", color: "text-cyan-400",  border: "border-cyan-500" },
  { minLevel: 26, maxLevel: 45,  name: "Foundation Establishment",badge: "🛡️", color: "text-blue-400",  border: "border-blue-500" },
  { minLevel: 46, maxLevel: 70,  name: "Core Formation",         badge: "🔮", color: "text-purple-400",border: "border-purple-500" },
  { minLevel: 71, maxLevel: 100, name: "Nascent Soul",           badge: "🌌", color: "text-pink-400",  border: "border-pink-500" },
  { minLevel: 101,maxLevel: 999, name: "Sovereign Immortal",     badge: "👑", color: "text-amber-400", border: "border-amber-500" }
];

/**
 * Default Reward Shop Items
 */
export const DEFAULT_SHOP_ITEMS = [
  {
    id: "item_rest_pass",
    title: "Rest Day Pass (Shield)",
    description: "Waives EXP penalty for 1 day if you take a rest from GATE study.",
    cost: 150,
    icon: "🛡️",
    type: "PASS"
  },
  {
    id: "item_movie_night",
    title: "Anime / Movie Guild Pass",
    description: "Enjoy 2 hours of anime guilt-free after hitting study target.",
    cost: 100,
    icon: "🎬",
    type: "REWARD"
  },
  {
    id: "item_cheat_meal",
    title: "S-Rank Cheat Feast",
    description: "Treat yourself to a favorite meal or snack.",
    cost: 120,
    icon: "🍕",
    type: "REWARD"
  }
];

export const EXP_TABLE = {
  LECTURE: 40,
  QUESTION: 3,
  REVISION: 30,
  DAILY_QUEST: 80,
  EARLY_BIRD_BONUS: 1.25
};

export function isEarlyBirdTime() {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 9;
}

/**
 * Exponential EXP required for Level L:
 * EXP(L) = floor(100 * L^1.65)
 */
export function getExpForLevel(level) {
  if (!level || level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.65));
}

/**
 * Calculate Level, Current Realm, and EXP Progress %
 */
export function calculateLevel(totalExp = 0) {
  const validExp = Math.max(0, Number(totalExp) || 0);
  let level = 1;

  while (validExp >= getExpForLevel(level + 1)) {
    level++;
  }

  const currentLevelExp = getExpForLevel(level);
  const nextLevelExp = getExpForLevel(level + 1);
  const expInLevel = validExp - currentLevelExp;
  const expNeeded = Math.max(1, nextLevelExp - currentLevelExp);
  const progressPercent = Math.min(100, Math.max(0, Math.floor((expInLevel / expNeeded) * 100)));

  const realm = getCultivationRealm(level);

  return {
    level,
    currentLevelExp,
    nextLevelExp,
    expInLevel,
    expNeeded,
    progressPercent,
    realm
  };
}

/**
 * Get Cultivation Realm for a given Level
 */
export function getCultivationRealm(level = 1) {
  const validLevel = Math.max(1, Number(level) || 1);
  return CULTIVATION_REALMS.find(r => validLevel >= r.minLevel && validLevel <= r.maxLevel) || CULTIVATION_REALMS[CULTIVATION_REALMS.length - 1];
}

/**
 * Legacy Rank Tier Compatibility Helper
 */
export function getRankTier(level = 1) {
  const realm = getCultivationRealm(level);
  return {
    name: realm.name,
    badge: realm.badge,
    color: realm.color,
    border: realm.border
  };
}

/**
 * Dynamic Guild Master Quotes
 */
export const GUILD_MASTER_QUOTES = [
  "Welcome back, Hunter. A new day of GATE preparation awaits.",
  "Consistency is the forge of legends. Complete your morning quests!",
  "Synaptic connections weaken without daily retrieval. Review your topics!",
  "A true Sovereign does not fear difficult PYQs. Ascend your realm!",
  "Rest days are earned through discipline. Keep pushing forward."
];

export function generateGuildMasterMessage(userData) {
  const totalExp = (userData && userData.totalExp) || (userData && userData.profile && userData.profile.totalExp) || 0;
  const name = (userData && userData.name) || (userData && userData.profile && userData.profile.name) || 'Hunter';
  const levelInfo = calculateLevel(totalExp);

  return {
    quote: `Greetings, ${name}! You are currently at Level ${levelInfo.level} (${levelInfo.realm.name}). Keep striving for Realm Breakthrough!`,
    level: levelInfo.level,
    realm: levelInfo.realm.name
  };
}
