// LocalStorage Manager with Initial State and Daily Audit checks

import { PRESET_CAMPAIGNS } from './presets';
import { DEFAULT_SHOP_ITEMS } from './rpgEngine';

const STORAGE_KEY = 'QUEST_ASCEND_USER_DATA_V1';

export const INITIAL_USER_STATE = {
  profile: {
    name: "Hero Candidate",
    avatar: "🧙‍♂️",
    activeTitle: "Novice Scholar",
    unlockedTitles: ["Novice Scholar"],
    totalExp: 150,
    gold: 120,
    streak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    restDayActiveUntil: null, // ISO string date
    earlyBirdUnlockedToday: false,
    stats: {
      int: 45, // Intelligence (Lectures)
      wis: 30, // Wisdom (Revisions)
      dex: 25, // Dexterity (Questions)
      vit: 20  // Vitality (Early waking & discipline)
    }
  },
  activeCampaignId: "gate_cs",
  campaigns: [
    PRESET_CAMPAIGNS.gate_cs,
    PRESET_CAMPAIGNS.fullstack
  ],
  dailyQuests: [
    {
      id: "dq_1",
      title: "Complete 2 GATE Lectures",
      expReward: 80,
      goldReward: 35,
      completed: false,
      dateSet: new Date().toISOString().split('T')[0],
      isEarlyBird: true
    },
    {
      id: "dq_2",
      title: "Solve 20 GATE Practice Questions",
      expReward: 60,
      goldReward: 25,
      completed: false,
      dateSet: new Date().toISOString().split('T')[0],
      isEarlyBird: false
    },
    {
      id: "dq_3",
      title: "1 Revision Session (OS/Algo)",
      expReward: 50,
      goldReward: 20,
      completed: false,
      dateSet: new Date().toISOString().split('T')[0],
      isEarlyBird: false
    }
  ],
  shopItems: DEFAULT_SHOP_ITEMS,
  inventory: [
    { id: "inv_1", name: "🛡️ Rest Day Pass", count: 1, type: "REST_PASS" }
  ],
  activityLogs: [
    {
      id: "log_1",
      date: new Date().toISOString().split('T')[0],
      type: "LECTURE",
      description: "Completed OS Process Sync lecture",
      expGained: 50,
      timestamp: Date.now() - 3600000
    }
  ],
  guildMasterPersonality: "cyber_mentor" // 'cyber_mentor', 'strict_sensei', 'anime_hero'
};

export function loadUserData() {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) {
      saveUserData(INITIAL_USER_STATE);
      return INITIAL_USER_STATE;
    }
    const parsed = JSON.parse(dataStr);

    // Perform daily audit on load
    return performDailyAudit(parsed);
  } catch (err) {
    console.error("Failed to load user data from LocalStorage:", err);
    return INITIAL_USER_STATE;
  }
}

export function saveUserData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save user data to LocalStorage:", err);
  }
}

function performDailyAudit(state) {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = state.profile.lastActiveDate;

  // Check if date changed
  if (lastActive !== today) {
    const isRestDay = state.profile.restDayActiveUntil && new Date(state.profile.restDayActiveUntil) >= new Date();

    let updatedExp = state.profile.totalExp;
    let updatedStreak = state.profile.streak;
    const penaltyLogs = [];

    if (!isRestDay) {
      // Check uncompleted daily quests from previous day
      const uncompletedQuests = state.dailyQuests.filter(q => !q.completed && q.dateSet !== today);
      if (uncompletedQuests.length > 0) {
        const penaltyExp = uncompletedQuests.length * 25; // 25 EXP penalty per missed quest
        updatedExp = Math.max(0, updatedExp - penaltyExp);
        
        penaltyLogs.push({
          id: 'log_penalty_' + Date.now(),
          date: today,
          type: 'PENALTY',
          description: `Daily Audit: -${penaltyExp} EXP penalty for ${uncompletedQuests.length} uncompleted morning task(s)`,
          expGained: -penaltyExp,
          timestamp: Date.now()
        });
      }

      // Streak check
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastActive !== yesterday) {
        // Missed a day
        updatedStreak = 1;
      }
    }

    // Reset daily state for new day
    const updatedState = {
      ...state,
      profile: {
        ...state.profile,
        totalExp: updatedExp,
        streak: updatedStreak,
        lastActiveDate: today,
        earlyBirdUnlockedToday: false
      },
      // Keep completed history logs, but generate fresh daily quests template for new day
      dailyQuests: state.dailyQuests.map(q => ({
        ...q,
        completed: false,
        dateSet: today
      })),
      activityLogs: [...penaltyLogs, ...state.activityLogs]
    };

    saveUserData(updatedState);
    return updatedState;
  }

  return state;
}

export function exportDataAsJSON(data) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `QuestAscend_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
