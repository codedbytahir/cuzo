/**
 * lib/userData.ts
 */
import { UserData } from '@/types/userData';

const STORAGE_KEY = 'cuzo_academy_data';

export const defaultUserData: UserData = {
  profile: {
    displayName: '',
    avatar: '♟️',
    ageRange: '9-11',
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    totalPlayTime: 0,
  },
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrawn: 0,
    winRate: 0,
    averageGameLength: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
    estimatedRating: 400,
  },
  tactics: {
    forks: 0,
    pins: 0,
    skewers: 0,
    discoveredAttacks: 0,
    doubleChecks: 0,
    removingDefender: 0,
    deflection: 0,
    backRankMate: 0,
    overallTactics: 0,
  },
  skills: {
    pawnPlay: 0,
    pieceDevelopment: 0,
    kingSafety: 0,
    endgameTechnique: 0,
    openingUnderstanding: 0,
    positionalPlay: 0,
    calculationDepth: 0,
    blunderRate: 0,
    overallSkill: 0,
  },
  weaknesses: {
    mostCommonMistakes: [],
    piecesStruggledWith: [],
    positionsLostFrom: [],
    timePressureErrors: 0,
  },
  levels: {},
  daily: {
    puzzlesCompletedToday: 0,
    dailyStreak: 0,
    longestStreak: 0,
    lastChallengeDate: new Date().toISOString(),
  },
  gameHistory: [],
};

export function loadUserData(): UserData | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data) as UserData;
    return parsed;
  } catch (e) {
    console.error("Failed to parse user data", e);
    return null;
  }
}

export function saveUserData(data: UserData) {
  if (typeof window === 'undefined') return;
  data.profile.lastActive = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateGameStats(playerWon: boolean, isDraw: boolean = false) {
  const data = loadUserData();
  if (!data) return;

  data.stats.gamesPlayed++;
  if (playerWon) {
    data.stats.gamesWon++;
    data.stats.currentWinStreak++;
    data.stats.longestWinStreak = Math.max(data.stats.longestWinStreak, data.stats.currentWinStreak);
    data.stats.estimatedRating += Math.min(50, 10 + Math.random() * 20); // Simple rating increase
  } else if (isDraw) {
    data.stats.gamesDrawn++;
    data.stats.currentWinStreak = 0;
  } else {
    data.stats.gamesLost++;
    data.stats.currentWinStreak = 0;
    data.stats.estimatedRating = Math.max(100, data.stats.estimatedRating - Math.min(30, 5 + Math.random() * 15));
  }

  if (data.stats.gamesPlayed > 0) {
    data.stats.winRate = (data.stats.gamesWon / data.stats.gamesPlayed) * 100;
  }

  saveUserData(data);
}

export function saveLevelProgress(levelId: number, stars: number, hintsUsed: number, blundersMade: number) {
  const data = loadUserData();
  if (!data) return;

  const existing = data.levels[levelId];
  data.levels[levelId] = {
    completed: true,
    stars: Math.max(stars, existing?.stars || 0),
    attempts: (existing?.attempts || 0) + 1,
    bestTime: existing?.bestTime || 0, // Need to track time
    hintsUsed: hintsUsed,
    blundersMade: blundersMade,
    lastPlayed: new Date().toISOString()
  };

  saveUserData(data);
}
