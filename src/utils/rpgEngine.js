// RPG Engine: Non-Linear Cultivation Realm EXP Formula, Stat Resonance Perks, Cultivation Windows, and Guild Master AI Quotes

import { safeNum } from './safeMath';

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
 * Default Reward Shop Items with unified properties and late-game cosmetic gold sinks
 */
export const DEFAULT_SHOP_ITEMS = [
  {
    id: "item_rest_pass",
    title: "Rest Day Pass (Shield)",
    name: "Rest Day Pass (Shield)",
    description: "Waives EXP penalty for 1 day if you take a rest from GATE study.",
    cost: 150,
    price: 150,
    icon: "🛡️",
    category: "Shield Pass",
    type: "REST_PASS"
  },
  {
    id: "item_movie_night",
    title: "Anime / Movie Guild Pass",
    name: "Anime / Movie Guild Pass",
    description: "Enjoy 2 hours of anime guilt-free after hitting study target.",
    cost: 100,
    price: 100,
    icon: "🎬",
    category: "Real Reward",
    type: "REWARD"
  },
  {
    id: "item_cheat_meal",
    title: "S-Rank Cheat Feast",
    name: "S-Rank Cheat Feast",
    description: "Treat yourself to a favorite meal or snack.",
    cost: 120,
    price: 120,
    icon: "🍕",
    category: "Real Reward",
    type: "REWARD"
  },
  {
    id: "aura_cosmic_qi",
    title: "Cosmic Qi Hologram Aura",
    name: "Cosmic Qi Hologram Aura",
    description: "Equips a glowing cyan & purple ethereal Qi particle aura around your avatar.",
    cost: 500,
    price: 500,
    icon: "🌌",
    category: "Aura Cosmetic",
    type: "COSMETIC"
  },
  {
    id: "title_dao_master",
    title: "Title: Cyber Dao Master",
    name: "Title: Cyber Dao Master",
    description: "Unlocks the gilded title badge displayed on your character profile.",
    cost: 800,
    price: 800,
    icon: "⚡",
    category: "Title Cosmetic",
    type: "COSMETIC"
  },
  {
    id: "skin_semaphore_blade",
    title: "Skin: Golden Semaphore Blade",
    name: "Skin: Golden Semaphore Blade",
    description: "Forges a golden radiant blade in the 3D synaptic matrix visualizer.",
    cost: 1200,
    price: 1200,
    icon: "⚔️",
    category: "Artifact Skin",
    type: "COSMETIC"
  },
  {
    id: "aura_celestial_halo",
    title: "Aura: Celestial Sovereign Halo",
    name: "Aura: Celestial Sovereign Halo",
    description: "The ultimate prestige cosmetic. Crowns your avatar with a rotating celestial halo.",
    cost: 2500,
    price: 2500,
    icon: "👑",
    category: "Aura Cosmetic",
    type: "COSMETIC"
  }
];

/**
 * Standardized Unified EXP Table
 */
export const EXP_TABLE = {
  LECTURE: { exp: 50, gold: 20, stat: 'wis', val: 2 },
  QUESTION: { exp: 10, gold: 1, stat: 'dex', val: 1 }, // 10 PYQs = 100 EXP, 10 Gold, 10 DEX
  REVISION: { exp: 35, gold: 15, stat: 'int', val: 2 },
  DAILY_QUEST: { exp: 80, gold: 40 },
  TRIBULATION: { exp: 250, gold: 100 },
  PURGE_SESSION: { exp: 150, gold: 50, stat: 'vit', val: 5 },
  FEYNMAN: { exp: 120, gold: 40, stat: 'wis', val: 5 },
  CULTIVATION_TIME_BONUS: 0.25
};

/**
 * Check Cultivation Bonus Time Window (Early Bird vs Night Owl)
 */
export function isCultivationBonusTime(cultivationWindow = 'EARLY_BIRD') {
  const hour = new Date().getHours();
  if (cultivationWindow === 'NIGHT_OWL') {
    return hour >= 23 || hour < 2; // 11:00 PM to 2:00 AM
  }
  // Default: EARLY_BIRD
  return hour >= 5 && hour < 9; // 5:00 AM to 9:00 AM
}

export function isEarlyBirdTime(cultivationWindow = 'EARLY_BIRD') {
  return isCultivationBonusTime(cultivationWindow);
}

/**
 * Calculate Gameplay Stat Resonance Perks from Hero Stats
 */
export function calculateStatResonances(stats = {}) {
  const intVal = safeNum(stats.int, 20);
  const wisVal = safeNum(stats.wis, 20);
  const dexVal = safeNum(stats.dex, 20);
  const vitVal = safeNum(stats.vit, 20);

  return {
    // INT slows Ebbinghaus forgetting curve decay speed by up to 25%
    memoryDecayResistancePercent: Math.min(25, Math.floor(intVal / 40)),
    // WIS grants +1% bonus Lecture EXP per 40 WIS (up to +20%)
    lectureExpBonusPercent: Math.min(20, Math.floor(wisVal / 40)),
    // DEX grants +1% bonus Gold from PYQ practice per 40 DEX (up to +25%)
    pyqGoldBonusPercent: Math.min(25, Math.floor(dexVal / 40)),
    // VIT grants +1% bonus Focus stamina EXP in Purge sessions per 40 VIT (up to +25%)
    purgeExpBonusPercent: Math.min(25, Math.floor(vitVal / 40))
  };
}

/**
 * Check if Night Report is unlocked (Only accessible between 2:00 AM and 6:00 AM)
 */
export function isNightReportUnlocked(devOverride = false) {
  if (devOverride) return true;
  const hour = new Date().getHours();
  return hour >= 2 && hour < 6;
}

/**
 * Exponential EXP required for Level L:
 * EXP(L) = floor(100 * (L - 1)^1.65)
 */
export function getExpForLevel(level) {
  if (!level || level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.65));
}

/**
 * Calculate Level, Current Realm, and EXP Progress %
 */
export function calculateLevel(totalExp = 0) {
  const validExp = safeNum(totalExp, 0);
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
    realm: realm || CULTIVATION_REALMS[0]
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
  const totalExp = safeNum((userData && userData.totalExp) || (userData && userData.profile && userData.profile.totalExp), 0);
  const name = (userData && userData.name) || (userData && userData.profile && userData.profile.name) || 'Hunter';
  const levelInfo = calculateLevel(totalExp);

  return {
    quote: `Greetings, ${name}! You are currently at Level ${levelInfo.level} (${levelInfo.realm.name}). Keep striving for Realm Breakthrough!`,
    level: levelInfo.level,
    realm: levelInfo.realm.name
  };
}
