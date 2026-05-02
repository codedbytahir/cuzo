/**
 * lib/gameAnalyzer.ts
 *
 * Provides a simple post-game analysis using a basic heuristic evaluation function.
 */
import { Chess } from 'chess.js';

export interface AnalyzedMove {
  moveNumber: number;
  color: 'w' | 'b';
  san: string;
  from: string;
  to: string;
  fenBefore: string;
  fenAfter: string;
  evaluation: number;
  evalDiff: number;
  classification: 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  comment: string;
}

export interface GameAnalysisReport {
  moves: AnalyzedMove[];
  bestMoment?: AnalyzedMove;
  turningPoint?: AnalyzedMove;
  blunders: number;
  mistakes: number;
  greatMoves: number;
}

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function evaluatePosition(fen: string): number {
  const chess = new Chess(fen);
  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.type] || 0;
        // Simple center control bonus
        const centerBonus = (r >= 3 && r <= 4 && c >= 3 && c <= 4) ? 0.2 : 0;
        const total = val + centerBonus;
        score += piece.color === 'w' ? total : -total;
      }
    }
  }
  return score;
}

export function analyzeGame(pgn: string): GameAnalysisReport {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const history = chess.history({ verbose: true });
  
  const replay = new Chess();
  
  const analyzedMoves: AnalyzedMove[] = [];
  let prevEval = evaluatePosition(replay.fen());

  let blunders = 0;
  let mistakes = 0;
  let greatMoves = 0;

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const fenBefore = replay.fen();
    replay.move(move.san);
    const fenAfter = replay.fen();
    
    const currentEval = evaluatePosition(fenAfter);
    
    // Eval diff from the perspective of the player who just moved
    const isWhite = move.color === 'w';
    const evalDiff = isWhite ? (currentEval - prevEval) : (prevEval - currentEval);
    
    let classification: AnalyzedMove['classification'] = 'good';
    let comment = "A solid move.";

    if (evalDiff <= -3) {
      classification = 'blunder';
      comment = "Oops! This loses significant material or advantage.";
      blunders++;
    } else if (evalDiff <= -1) {
      classification = 'mistake';
      comment = "This move weakens your position.";
      mistakes++;
    } else if (evalDiff <= -0.5) {
      classification = 'inaccuracy';
      comment = "You could have played a slightly better move.";
    } else if (evalDiff >= 1) {
      classification = 'great';
      comment = "Excellent! You gained an advantage here!";
      greatMoves++;
    }

    // Capture bonus logic check
    if (move.flags.includes('c')) {
      if (classification === 'good') {
         comment = "Good capture!";
      }
    }

    analyzedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      color: move.color,
      san: move.san,
      from: move.from,
      to: move.to,
      fenBefore,
      fenAfter,
      evaluation: currentEval,
      evalDiff,
      classification,
      comment
    });

    prevEval = currentEval;
  }

  // Find turning point (largest eval swing against a player)
  let turningPoint: AnalyzedMove | undefined;
  let maxSwing = 0;
  for (const am of analyzedMoves) {
    if (am.classification === 'blunder' && am.evalDiff < maxSwing) {
      maxSwing = am.evalDiff;
      turningPoint = am;
    }
  }

  // Find best moment
  let bestMoment: AnalyzedMove | undefined;
  let maxGain = 0;
  for (const am of analyzedMoves) {
    if (am.classification === 'great' && am.evalDiff > maxGain) {
      maxGain = am.evalDiff;
      bestMoment = am;
    }
  }

  return {
    moves: analyzedMoves,
    blunders,
    mistakes,
    greatMoves,
    bestMoment,
    turningPoint
  };
}
