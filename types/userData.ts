/**
 * types/userData.ts
 */

export interface UserProfile {
  displayName: string;
  avatar: string;
  ageRange: "6-8" | "9-11" | "12-14";
  joinedAt: string;
  lastActive: string;
  totalPlayTime: number; // minutes
}

export interface ChessStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  winRate: number;
  averageGameLength: number;
  longestWinStreak: number;
  currentWinStreak: number;
  estimatedRating: number; // starts at 400
}

export interface TacticalMastery {
  forks: number;
  pins: number;
  skewers: number;
  discoveredAttacks: number;
  doubleChecks: number;
  removingDefender: number;
  deflection: number;
  backRankMate: number;
  overallTactics: number;
}

export interface SkillProgression {
  pawnPlay: number;
  pieceDevelopment: number;
  kingSafety: number;
  endgameTechnique: number;
  openingUnderstanding: number;
  positionalPlay: number;
  calculationDepth: number;
  blunderRate: number;
  overallSkill: number;
}

export interface WeaknessTracking {
  mostCommonMistakes: Array<{
    type: string;
    count: number;
    lastSeen: string;
  }>;
  piecesStruggledWith: string[];
  positionsLostFrom: Array<{
    type: string;
    count: number;
  }>;
  timePressureErrors: number;
}

export interface LevelProgress {
  completed: boolean;
  stars: number;
  attempts: number;
  bestTime: number; // seconds
  hintsUsed: number;
  blundersMade: number;
  lastPlayed: string;
}

export interface DailyChallenges {
  puzzlesCompletedToday: number;
  dailyStreak: number;
  longestStreak: number;
  lastChallengeDate: string;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  moves: number;
  ratingChange: number;
  keyMoment: string;
  lessonsLearned: string[];
}

export interface UserData {
  profile: UserProfile;
  stats: ChessStats;
  tactics: TacticalMastery;
  skills: SkillProgression;
  weaknesses: WeaknessTracking;
  levels: Record<number, LevelProgress>;
  daily: DailyChallenges;
  gameHistory: GameHistoryEntry[];
}
