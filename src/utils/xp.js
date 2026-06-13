

export function calculateStreak(history) {
  if (!history || history.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  
  const uniqueDates = [...new Set(history.map(h => h.date))]
    .map(d => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt; })
    .sort((a, b) => b - a);

  let streak = 0;
  let checkDate = new Date(today);

  for (const date of uniqueDates) {
    const diffDays = Math.round((checkDate - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      checkDate = new Date(date);
    } else {
      break;
    }
  }

  return streak;
}

export function hasWorkedOutToday(history) {
  const today = new Date().toISOString().slice(0, 10);
  return (history || []).some(h => h.date === today);
}

export const LEVELS = [
  { index: 0, name: 'Starter',  icon: 'seedling', color: '#94a3b8', minXP: 0,    maxXP: 50   },
  { index: 1, name: 'Rookie',   icon: 'zap',      color: '#64748b', minXP: 50,   maxXP: 150  },
  { index: 2, name: 'Athlete',  icon: 'flame',    color: '#3b82f6', minXP: 150,  maxXP: 500  },
  { index: 3, name: 'Warrior',  icon: 'sword',    color: '#8b5cf6', minXP: 500,  maxXP: 1000 },
  { index: 4, name: 'Champion', icon: 'trophy',   color: '#f59e0b', minXP: 1000, maxXP: 2000 },
  { index: 5, name: 'Legend',   icon: 'trophy',   color: '#3b82f6', minXP: 2000, maxXP: Infinity },
];

export const XP_PER_SESSION = 50;
export const XP_PER_QUEST   = 25;
export const STREAK_BONUS_XP = { 3: 30, 7: 100, 14: 200, 30: 500 };

const QUEST_XP_MAP = {
  complete_session: 25,
  hit_50_reps:      15,
  burn_150_kcal:    20,
  try_quick:        15,
  no_skip:          10,
  drink_water:      15,
  sleep_well:       15,
  stretch_5m:       15,
  add_exercise:     10,
  shuffle_one:      10,
};

export function calculateTotalXP(history, completedQuestLog) {
  const sessionXP = (history?.length || 0) * XP_PER_SESSION;
  const questXP = (completedQuestLog || []).reduce((sum, entry) => {
    return sum + (QUEST_XP_MAP[entry.questId] ?? XP_PER_QUEST);
  }, 0);
  const streak    = calculateStreak(history);
  const bonusXP   = Object.entries(STREAK_BONUS_XP)
    .filter(([threshold]) => streak >= Number(threshold))
    .reduce((sum, [, bonus]) => sum + bonus, 0);
  return sessionXP + questXP + bonusXP;
}

export function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getLevelProgress(xp) {
  const lvl = getLevel(xp);
  if (lvl.maxXP === Infinity) return { level: lvl, pct: 100, current: xp - lvl.minXP, needed: 0 };
  const current = xp - lvl.minXP;
  const needed  = lvl.maxXP - lvl.minXP;
  const pct     = Math.min(100, Math.round((current / needed) * 100));
  return { level: lvl, pct, current, needed };
}

export const ALL_BADGES = [
  {
    id: 'first_spark',
    name: 'First Spark',
    desc: 'Complete your very first workout session',
    icon: 'flame',
    rarity: 'common',
    check: (history, streak) => history.length >= 1,
  },
  {
    id: 'three_streak',
    name: 'On a Roll',
    desc: 'Maintain a 3-day workout streak',
    icon: 'activity',
    rarity: 'common',
    check: (history, streak) => streak >= 3,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    desc: 'Maintain a 7-day streak',
    icon: 'calendar',
    rarity: 'rare',
    check: (history, streak) => streak >= 7,
  },
  {
    id: 'ten_sessions',
    name: 'Consistent',
    desc: 'Complete 10 total workout sessions',
    icon: 'dumbbell',
    rarity: 'common',
    check: (history, streak) => history.length >= 10,
  },
  {
    id: 'twenty_five_sessions',
    name: 'Dedicated',
    desc: 'Complete 25 total workout sessions',
    icon: 'target',
    rarity: 'rare',
    check: (history, streak) => history.length >= 25,
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    desc: 'Maintain a legendary 30-day streak',
    icon: 'shield',
    rarity: 'legendary',
    check: (history, streak) => streak >= 30,
  },
  {
    id: 'inferno',
    name: 'Inferno',
    desc: 'Hit a 14-day streak',
    icon: 'thermometer',
    rarity: 'rare',
    check: (history, streak) => streak >= 14,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    desc: 'Complete 50 total workout sessions',
    icon: 'star',
    rarity: 'legendary',
    check: (history, streak) => history.length >= 50,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    desc: 'Complete 5 morning sessions (before noon)',
    icon: 'sunrise',
    rarity: 'rare',
    check: (history, streak) => {
      const mornings = history.filter(h => {
        if (!h.completedAt) return false;
        const hour = new Date(h.completedAt).getHours();
        return hour < 12;
      });
      return mornings.length >= 5;
    },
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    desc: 'Complete 10 daily quests',
    icon: 'zap',
    rarity: 'rare',
    check: (history, streak, completedQuestLog) => (completedQuestLog?.length || 0) >= 10,
  },
  {
    id: 'legend_status',
    name: 'Legend',
    desc: 'Reach the Legend rank',
    icon: 'crown',
    rarity: 'legendary',
    check: (history, streak, completedQuestLog) => {
      const xp = calculateTotalXP(history, completedQuestLog);
      return xp >= 1400;
    },
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    desc: 'Return to training after a 7+ day break',
    icon: 'refresh-cw',
    rarity: 'common',
    check: (history, streak) => {
      if (history.length < 2) return false;
      const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      for (let i = 0; i < sorted.length - 1; i++) {
        const diff = (new Date(sorted[i].date) - new Date(sorted[i + 1].date)) / (1000 * 60 * 60 * 24);
        if (diff >= 7) return true;
      }
      return false;
    },
  },
];

export function getUnlockedBadges(history, streak, completedQuestLog) {
  return ALL_BADGES.filter(badge => {
    try { return badge.check(history || [], streak, completedQuestLog || []); }
    catch { return false; }
  }).map(b => b.id);
}

const QUEST_POOL = [
  
  { id: 'complete_session', title: 'Complete today\'s session', desc: 'Finish your full workout plan for today', xp: 25, icon: 'dumbbell', autoComplete: true },
  
  { id: 'hit_50_reps',    title: 'Hit 50 total reps',       desc: 'Rack up 50 reps across all exercises today',  xp: 15, icon: 'activity', autoComplete: false },
  { id: 'burn_150_kcal',  title: 'Burn 150+ kcal',          desc: 'Torch at least 150 calories in your session', xp: 20, icon: 'flame', autoComplete: false },
  

  { id: 'try_quick',      title: 'Lightning round',          desc: 'Knock out a Quick session today',             xp: 15, icon: 'zap', autoComplete: false },
  
  { id: 'no_skip',        title: 'No rest for the driven',   desc: 'Show up and complete at least one set',        xp: 10, icon: 'check-circle', autoComplete: true },
  
  { id: 'drink_water',    title: 'Hydration Station',        desc: 'Drink at least 2 liters of water today',      xp: 15, icon: 'droplet', autoComplete: false },
  { id: 'sleep_well',     title: 'Rest & Recover',           desc: 'Get 8+ hours of sleep tonight',               xp: 15, icon: 'moon', autoComplete: false },
  { id: 'stretch_5m',     title: 'Stay Limber',              desc: 'Do 5 minutes of freestyle stretching',        xp: 15, icon: 'activity', autoComplete: false },
  
  { id: 'add_exercise',   title: 'Customise your plan',      desc: 'Add a new exercise to today\'s session',      xp: 10, icon: 'plus-circle', autoComplete: false },
  { id: 'shuffle_one',    title: 'Swap an Exercise',         desc: 'Swap at least one exercise in today\'s session', xp: 10, icon: 'shuffle', autoComplete: false },
];

function seededRandom(seed, n) {
  return Math.floor(Math.abs(Math.sin(seed + n) * 1000000)) % 1000000;
}

export function getDailyQuests(dateStr) {
  const seed = (dateStr || new Date().toISOString().slice(0, 10))
    .replace(/-/g, '')
    .split('')
    .reduce((a, c, i) => a * 31 + c.charCodeAt(0) + i, 7);

  
  const q1 = QUEST_POOL[0];

  
  const pool2 = QUEST_POOL.filter(q => ['hit_50_reps', 'burn_150_kcal', 'try_quick', 'add_exercise', 'shuffle_one'].includes(q.id));
  const q2 = pool2[seededRandom(seed, 1) % pool2.length];

  
  const pool3 = QUEST_POOL.filter(q =>
    ['no_skip', 'drink_water', 'sleep_well', 'stretch_5m'].includes(q.id) &&
    q.id !== q1.id && q.id !== q2?.id
  );
  const q3 = pool3[seededRandom(seed, 2) % pool3.length];

  return [q1, q2, q3].filter(Boolean);
}

export function isQuestDoneToday(questId, completedQuestLog, history, streak) {
  const today = new Date().toISOString().slice(0, 10);

  
  const quest = QUEST_POOL.find(q => q.id === questId);
  if (quest?.streakRequired) return streak >= quest.streakRequired;

  
  if (['complete_session', 'no_skip'].includes(questId)) {
    return (history || []).some(h => h.date === today);
  }

  
  return (completedQuestLog || []).some(e => e.date === today && e.questId === questId);
}

export function getTodayCompletedQuestIds(completedQuestLog, history, streak) {
  const today = new Date().toISOString().slice(0, 10);
  const quests = getDailyQuests(today);
  return quests
    .filter(q => isQuestDoneToday(q.id, completedQuestLog, history, streak))
    .map(q => q.id);
}

export const RARITY_STYLES = {
  common:    { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)',   border: 'rgba(59, 130, 246, 0.25)', label: 'Common'    },
  rare:      { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)',   border: 'rgba(139, 92, 246, 0.25)', label: 'Rare'      },
  legendary: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)',  border: 'rgba(245, 158, 11, 0.3)',  label: 'Legendary' },
};
