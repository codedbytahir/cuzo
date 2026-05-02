/**
 * lib/lessonEngine.ts
 */
import { Chess, Move, Square } from 'chess.js';
import { LessonDef, LessonStep } from '@/types/lessons';

export type LessonEvaluation = 
  | { type: 'target'; explanation: string; nextStepId: string | null; points: number }
  | { type: 'acceptable'; feedback: string; redirect: string }
  | { type: 'weak'; feedback: string; hint: string }
  | { type: 'blunder'; feedback: string; explanation: string; allowRetry: boolean };

export function evaluateLessonMove(
  game: Chess,
  step: LessonStep,
  moveOpt: { from: string; to: string }
): LessonEvaluation {
  const from = moveOpt.from;
  const to = moveOpt.to;

  // Check target moves
  for (const t of step.targetMoves) {
    if (t.from === from && t.to.includes(to)) {
      return { type: 'target', explanation: t.explanation, nextStepId: step.nextStepId, points: step.pointsAwarded };
    }
  }

  // Check acceptable moves
  for (const a of step.acceptableMoves) {
    if (a.from === from && a.to.includes(to)) {
      return { type: 'acceptable', feedback: a.feedback, redirect: a.redirectInstruction };
    }
  }

  // Rough estimation of blunder vs weak
  // In a real system, you'd use Stockfish.js to compare evaluation scores.
  // For the MVP, if this isn't targeted or acceptable, let's treat it as a weak response.
  // If we detect the piece gets captured next turn, it's a blunder.
  return { type: 'weak', feedback: step.weakMoveResponse.feedback, hint: step.weakMoveResponse.hint };
}
