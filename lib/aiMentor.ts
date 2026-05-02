/**
 * lib/aiMentor.ts
 *
 * Client-side interface to request AI mentor insights.
 * Includes client-side caching for common position requests to save API calls.
 */
import { MentorRequest, MentorMessageType, MentorContext } from '@/types/mentor';
import { GoogleGenAI } from '@google/genai';
import { CONSTANTS } from '@/config/constants';

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

const SYSTEM_INSTRUCTION = `You are "Chessy", a magical wizard chess mentor for kids (age 6-14).
Be extremely encouraging, enthusiastic, and keep explanations brief (1-3 sentences max).
Use emojis generously!
You are helping the player based on the current FEN board state.
If the player asks a question, answer it simply and clearly.`;

// Simple LRU cache for identical FEN + type requests
const cache = new Map<string, string>();
const maxCacheSize = 20;

export async function askMentor(
  type: MentorMessageType,
  context: MentorContext,
  customQuestion?: string
): Promise<string> {
  const cacheKey = `${type}-${context.fen}-${context.playerColor}-${customQuestion || ''}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    // Fallback if offline
    if (!navigator.onLine) {
      return getOfflineResponse(type);
    }

    const ai = getAI();

    let userPrompt = `Current board FEN: ${context.fen}\nThe player is playing as ${context.playerColor === 'w' ? 'White' : 'Black'}. Player skill level: ${context.playerSkillLevel || 'Unknown'}.`;

    if (customQuestion) {
      userPrompt += `\n\nThe player has asked: "${customQuestion}"\nPlease answer their question in a helpful and encouraging way.`;
    } else {
      switch (type) {
        case 'mistake':
          userPrompt += `\nThe player just made a mistake. Help them understand why it might not have been the best move, without giving away the exact perfect move immediately.`;
          break;
        case 'great_move':
          userPrompt += `\nThe player just made a great move! Praise them specifically for what that move accomplished (e.g., controlling the center, developing a piece).`;
          break;
        case 'threat':
          userPrompt += `\nThe opponent just made a threatening move. Warn the player about what piece is in danger!`;
          break;
        case 'hint':
          userPrompt += `\nThe player asked for a hint. Give them a strategic clue about what they should focus on next (e.g., 'Look for unprotected pieces' or 'Can you develop your knight?').`;
          break;
        case 'teach':
          userPrompt += `\nThe player is in a new situation. Briefly teach them a core concept relevant to the current position (like castling or piece value).`;
          break;
        case 'analyze':
          userPrompt += `\nThe game is over. Give a 2-sentence encouraging summary of their play based on the final board state.`;
          break;
      }
    }

    const response = await ai.models.generateContent({
      model: CONSTANTS.MODELS.GEMINI_FLASH,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    let message = "Keep going! You're doing great!";
    try {
       message = response.text || message;
    } catch(e) {}
    
    // Cache it
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(cacheKey, message);
    
    return message;
  } catch (error) {
    console.error("[AI Mentor] Failed to fetch insight:", error);
    return getOfflineResponse(type);
  }
}

function getOfflineResponse(type: MentorMessageType): string {
  switch (type) {
    case 'hint': return "Hmm, my connection is a bit fuzzy! Just look for unprotected pieces! 🤓";
    case 'threat': return "Watch your king! I can't quite see the board right now. 🛡️";
    case 'tactic': return "Look for pieces that are lined up! There might be a sneaky tactic somewhere... 👀";
    case 'teach': return "Development and center control! Always a good idea. 🏰";
    case 'analyze': return "I can't analyze right now, but I'm sure you had a good idea in mind! 🤔";
    default: return "You're doing awesome! Keep it up! 🌟";
  }
}
