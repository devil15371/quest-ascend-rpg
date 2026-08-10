// Sect Guild Engine: Persistent Sect State & Real Qi Contributions

const SECT_STORAGE_KEY = 'QUEST_ASCEND_SECT_STATE_V1';

export const INITIAL_SECT_STATE = {
  activeSectId: 'iit_bombay',
  sects: [
    { id: 'iit_bombay', name: 'IIT Bombay Dao Sect', baseMembers: 142, baseQi: 45200, userContributionQi: 0, buff: '+10% EXP Boost' },
    { id: 'nit_trichy', name: 'NIT Trichy Cultivators', baseMembers: 98, baseQi: 31800, userContributionQi: 0, buff: '+10% EXP Boost' },
    { id: 'night_owls', name: '2 AM Night Owl Sect', baseMembers: 215, baseQi: 68900, userContributionQi: 0, buff: '+15% Night Report EXP' }
  ]
};

export function loadSectState() {
  try {
    const dataStr = localStorage.getItem(SECT_STORAGE_KEY);
    if (!dataStr) return INITIAL_SECT_STATE;
    return { ...INITIAL_SECT_STATE, ...JSON.parse(dataStr) };
  } catch (e) {
    return INITIAL_SECT_STATE;
  }
}

export function saveSectState(state) {
  try {
    localStorage.setItem(SECT_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

export function addSectQiContribution(expGained) {
  const current = loadSectState();
  const qiEarned = Math.round(expGained * 1.5);

  const updatedSects = current.sects.map(sect => {
    if (sect.id !== current.activeSectId) return sect;
    return {
      ...sect,
      userContributionQi: sect.userContributionQi + qiEarned
    };
  });

  const updated = { ...current, sects: updatedSects };
  saveSectState(updated);
  return updated;
}
