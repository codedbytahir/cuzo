import { GoogleGenAI, Type } from '@google/genai';

async function test() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API key");
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const updateChessboardTool = {
    name: "update_chessboard",
    description: "Updates the visual chessboard for the student to see.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        fen: {
          type: Type.STRING,
          description: "The fen string representing the chess board state."
        },
        highlights: {
           type: Type.ARRAY,
           items: { type: Type.STRING },
           description: "An array of square names to highlight. e.g. ['e4', 'f3']"
        },
        animation: {
           type: Type.STRING,
           description: "Optional animation to trigger on the frontend. Values: 'sparkles', 'shake'"
        }
      },
      required: ["fen"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: "Hi! Set the board to e4.",
      config: {
        systemInstruction: "You are Cuzo. Use update_chessboard.",
        tools: [{ functionDeclarations: [updateChessboardTool] }],
      }
    });

    console.log("Called!");
    console.log(response.functionCalls);
    console.log(response.text);
  } catch (e) {
    console.error("ERROR", e);
  }
}

test();
