/**
 * types/lessons.ts
 */

export interface LessonStep {
  id: string;
  instruction: string; // e.g. "Control the center with a pawn!"
  concept: string; // e.g. "Center control"
  setupFEN?: string; // Optional: FEN to apply when this step starts
  highlightSquare?: string; // Optional: Piece to highlight for instruction
  expectedMove?: { from: string, to: string }; // Optional: To draw arrow
  
  targetMoves: Array<{
    from: string;
    to: string[]; 
    explanation: string;
  }>;
  
  acceptableMoves: Array<{
    from: string;
    to: string[];
    feedback: string;
    redirectInstruction: string;
  }>;
  
  weakMoveResponse: {
    feedback: string;
    hint: string;
  };
  
  blunderResponse: {
    feedback: string;
    explanation: string;
    allowRetry: boolean;
  };
  
  nextStepId: string | null;
  pointsAwarded: number;
}

export interface LessonDef {
  id: string;
  worldId: number;
  title: string;
  focus: string;
  setupFEN: string;
  steps: Record<string, LessonStep>;
  firstStepId: string;
  expectedStepsLength: number;
  difficulty: "beginner" | "easy" | "medium" | "hard" | "boss";
  prerequisites: string[];
  isBossBattle?: boolean;
}
