import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { model, contents, config, systemInstruction, tools } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[API Proxy]: Missing Gemini API Key. Using fallback.');

      let fallbackText = "I'm having a little trouble with my magic, but you're doing great! Keep it up! 🧙‍♂️";

      // Heuristic to detect if it's a move request
      const isMoveRequest = JSON.stringify(contents).toLowerCase().includes("what is your move");
      if (isMoveRequest) {
          fallbackText = ""; // Empty string will trigger the frontend's local move fallback
      }

      return NextResponse.json({
        error: 'Missing Gemini API Key on server.',
        fallback: true,
        text: fallbackText
      }, { status: 200 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const genModel = ai.models.generateContent({
      model: model || 'gemini-2.0-flash',
      contents,
      config: {
        ...config,
        systemInstruction: systemInstruction || config?.systemInstruction,
        tools: tools || config?.tools,
      }
    });

    const response = await genModel;

    // Explicitly extract fields because getters like response.text
    // are not serialized by NextResponse.json()
    const result = {
        text: "",
        functionCalls: response.functionCalls || [],
        data: response.data,
        executableCode: response.executableCode,
        codeExecutionResult: response.codeExecutionResult,
    };

    try {
        result.text = response.text || "";
    } catch (e) {
        // response.text can throw if no text part exists
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Proxy Error]:', error);

    // Generic error fallback
    return NextResponse.json({
      error: error.message || 'Internal Server Error',
      fallback: true,
      text: "Oops! My crystal ball is a bit foggy. Let's keep playing anyway! 🌟"
    }, { status: 200 });
  }
}
