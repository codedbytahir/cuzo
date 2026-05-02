/**
 * lib/aiOpponent.ts
 *
 * Client-side interface to request AI moves from the backend API.
 * Includes fallback logic to select random moves if the AI fails or
 * depending on the difficulty level mistake rate.
 */
import { Chess, Move } from 'chess.js';
import { CONSTANTS } from '@/config/constants';
import { DifficultyLevel } from '@/types/opponent';

const SYSTEM_INSTRUCTION = `You are playing chess against a child (age 6-14).
You should play at a beatable but fun level.
Analyze the provided FEN board state.
Return ONLY your selected move in long algebraic notation (e.g. 'e2e4' or 'g1f3').
Do not return any extra text.`;

/**
 * Gets a move for the AI opponent using the backend API.
 * Contains fallback logic for random moves to simulate imperfect play (easy/medium modes)
 * or if the API call fails to prevent crashing.
 * 
 * @param fen The current board state in FEN notation.
 * @param difficulty The chosen difficulty level.
 * @returns A string representing the algebraic movement (e.g., 'e2e4') or null if no moves
 */
export async function getAIMove(fen: string, difficulty: DifficultyLevel): Promise<string | null> {
  const game = new Chess(fen);
  
  // We use verbose true so we can get `from` + `to` representation easily, e.g. e2e4
  const verboseMoves = game.moves({ verbose: true });
  if (verboseMoves.length === 0) return null;

  // Enforce difficulty logic: random moves instead of API
  const mistakeChance = difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.2 : 0;
  if (Math.random() < mistakeChance) {
    console.log(`[AI Opponent] Making a random mistake move (Difficulty: ${difficulty})`);
    return getFallbackMove(game);
  }

  try {
    console.log(`[AI Opponent] Requesting Gemini move for FEN: ${fen}`);
    
    let moveText: string | undefined = undefined;
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONSTANTS.MODELS.GEMINI_FLASH,
        contents: [{ role: 'user', parts: [{ text: `Current FEN: ${fen}\nIt is your turn to play as ${game.turn() === 'w' ? 'White' : 'Black'}. What is your move?` }] }],
        systemInstruction: SYSTEM_INSTRUCTION,
        config: {
          temperature: difficulty === 'hard' ? 0.2 : 0.7,
        },
      }),
    });

    if (!res.ok) throw new Error('API request failed');
    const response = await res.json();

    try {
      moveText = response.text?.trim();
    } catch(e) {}

    // The model might return some punctuation or extra spaces
    // e.g., "e2e4", "Move: e2e4", "e2e4."
    // Let's do a basic regex to extract LAN move (like a2a4, g1f3, e7e8q)
    const moveMatch = moveText?.match(/\b([a-h][1-8][a-h][1-8][qrbn]?)\b/i);
    
    if (moveMatch && moveMatch[1]) {
      const dataMove = moveMatch[1].toLowerCase();
      // Validate the move
      try {
        const testGame = new Chess(fen);
        const result = testGame.move(dataMove);
        if (result) {
          // It's a valid move
          return dataMove;
        }
      } catch (err) {
        console.warn(`[AI Opponent] Gemini provided invalid move: ${dataMove}. Falling back.`);
      }
    } else {
        console.warn(`[AI Opponent] Gemini response didn't contain a move:`, moveText);
    }
  } catch (err: any) {
    console.error('[AI Opponent] Error fetching move from Gemini:', err);
  }

  // Fallback to heuristic if API failed or returned invalid move
  // We can trigger a UI toast/event if needed
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cuzo-ai-fallback'));
  }
  
  return getFallbackMove(game);
}

/**
 * Executes fallback rules with improved heuristics to avoid "bad moves":
 * 1. Defend attacked pieces / Avoid moving into attack
 * 2. Capture opponent pieces (highest value first)
 * 3. Castle
 * 4. Develop pieces
 * 5. Safe random move
 */
function getFallbackMove(game: Chess): string {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return '';

  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

  // Helper to check if a square is attacked by the opponent
  const isSafe = (square: string) => {
    // We need to switch turn to check if opponent attacks this square
    const temp = new Chess(game.fen());
    // chess.js doesn't have a direct 'isAttacked' for current turn,
    // but it has 'isAttacked(square, color)'
    const opponentColor = game.turn() === 'w' ? 'b' : 'w';
    return !temp.isAttacked(square as any, opponentColor);
  };

  // 1. Captures (highest value first)
  const captures = moves.filter(m => m.captured);
  if (captures.length > 0) {
    captures.sort((a, b) => {
      const valA = pieceValues[a.captured!] || 0;
      const valB = pieceValues[b.captured!] || 0;
      // If same value, prefer the one that ends on a safe square
      if (valA === valB) {
          return (isSafe(b.to) ? 1 : 0) - (isSafe(a.to) ? 1 : 0);
      }
      return valB - valA;
    });

    // Take the best capture if it's reasonably safe or if we take something more valuable than what we lose
    const bestCapture = captures[0];
    const attackerPiece = game.get(bestCapture.from as any);
    const attackerVal = attackerPiece ? pieceValues[attackerPiece.type] || 0 : 0;
    const capturedVal = pieceValues[bestCapture.captured!] || 0;

    if (isSafe(bestCapture.to) || capturedVal >= attackerVal) {
        return bestCapture.from + bestCapture.to + (bestCapture.promotion || '');
    }
  }

  // 2. Castle
  const castling = moves.filter(m => m.flags.includes('k') || m.flags.includes('q'));
  if (castling.length > 0) return castling[0].from + castling[0].to;

  // 3. Safe development/moves
  const safeMoves = moves.filter(m => isSafe(m.to));
  if (safeMoves.length > 0) {
      // Prefer center control or forward moves
      safeMoves.sort((a, b) => {
          const distA = Math.abs(3.5 - 'abcdefgh'.indexOf(a.to[0])) + Math.abs(3.5 - (parseInt(a.to[1]) - 1));
          const distB = Math.abs(3.5 - 'abcdefgh'.indexOf(b.to[0])) + Math.abs(3.5 - (parseInt(b.to[1]) - 1));
          return distA - distB;
      });
      return safeMoves[0].from + safeMoves[0].to + (safeMoves[0].promotion || '');
  }

  // 4. Last resort: any legal move
  const move = moves[Math.floor(Math.random() * moves.length)];
  return move.from + move.to + (move.promotion || '');
}
