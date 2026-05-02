/**
 * types/opponent.ts
 * Types related to the AI Opponent functionality.
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface AIMoveRequest {
  fen: string;
  turn: 'w' | 'b';
  difficulty: DifficultyLevel;
}

export interface AIMoveResponse {
  move?: string;
  error?: string;
}
