/**
 * lib/aiOpponent.ts
 *
 * Client-side interface to request AI moves from the backend API.
 * Includes fallback logic to select random moves if the AI fails or
 * depending on the difficulty level mistake rate.
 */
import { Chess } from 'chess.js';
import { GoogleGenAI } from '@google/genai';
import { CONSTANTS } from '@/config/constants';
import { DifficultyLevel } from '@/types/opponent';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
    }
    aiInstance = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
  }
  return aiInstance;
}

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
    
    const ai = getAI();
    let moveText: string | undefined = undefined;
    
    // Add 3s timeout or something to prevent game freezing forever
    const responsePromise = ai.models.generateContent({
      model: CONSTANTS.MODELS.GEMINI_FLASH,
      contents: `Current FEN: ${fen}\nIt is your turn to play as ${game.turn() === 'w' ? 'White' : 'Black'}. What is your move?`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: difficulty === 'hard' ? 0.2 : 0.7,
      },
    });

    const timeoutPromise = new Promise<{text: undefined}>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 3000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;
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
 * Executes fallback rules:
 * 1. Defend attacked pieces
 * 2. Capture opponent pieces
 * 3. Develop pieces (knights before bishops)
 * 4. Castle
 * 5. Random
 */
function getFallbackMove(game: Chess): string {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return ''; // No legal moves

  // 1. Capture opponent piece
  const captures = moves.filter(m => m.flags.includes('c') || m.flags.includes('e'));
  if (captures.length > 0) {
    // Sort captures by piece value
    const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    captures.sort((a, b) => {
      const aTarget = game.get(a.to);
      const bTarget = game.get(b.to);
      const aVal = aTarget ? pieceValues[aTarget.type] || 0 : 0;
      const bVal = bTarget ? pieceValues[bTarget.type] || 0 : 0;
      return bVal - aVal;
    });
    return captures[0].from + captures[0].to + (captures[0].promotion ? captures[0].promotion : '');
  }

  // 2. Castle
  const castlingMoves = moves.filter(m => m.flags.includes('k') || m.flags.includes('q'));
  if (castlingMoves.length > 0) {
    return castlingMoves[0].from + castlingMoves[0].to;
  }

  // 3. Develop pieces (N before B)
  const knights = moves.filter(m => game.get(m.from)?.type === 'n' && (m.from.includes('1') || m.from.includes('8')));
  if (knights.length > 0) return knights[0].from + knights[0].to;
  
  const bishops = moves.filter(m => game.get(m.from)?.type === 'b' && (m.from.includes('1') || m.from.includes('8')));
  if (bishops.length > 0) return bishops[0].from + bishops[0].to;

  // 4. Random move
  const move = moves[Math.floor(Math.random() * moves.length)];
  return move.from + move.to + (move.promotion ? move.promotion : '');
}
