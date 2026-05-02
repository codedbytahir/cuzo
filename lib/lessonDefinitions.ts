/**
 * lib/lessonDefinitions.ts
 * Stores all definitions for lessons and boss battles.
 */
import { LessonDef } from '@/types/lessons';

export const LESSON_DEFINITIONS: LessonDef[] = [
  {
    id: 'l1',
    worldId: 1,
    title: 'Pawn Power!',
    focus: 'Pawn movement forward and capture',
    setupFEN: '8/8/8/8/8/8/PPPPPPPP/8 w - - 0 1',
    firstStepId: 'step1',
    expectedStepsLength: 5,
    difficulty: 'beginner',
    prerequisites: [],
    steps: {
      'step1': {
        id: 'step1',
        instruction: 'Pawns move FORWARD! Click any pawn and move it 1 or 2 squares!',
        concept: 'Pawn move',
        targetMoves: [
          { from: 'e2', to: ['e3', 'e4'], explanation: "Great job!" },
        ],
        highlightSquare: 'e2',
        expectedMove: { from: 'e2', to: 'e4' },
        acceptableMoves: [
          { from: 'a2', to: ['a3', 'a4'], feedback: "Good! But for this practice, let's move the e-pawn.", redirectInstruction: "Move the highlighted pawn!" },
          { from: 'b2', to: ['b3', 'b4'], feedback: "Good! But for this practice, let's move the e-pawn.", redirectInstruction: "Move the highlighted pawn!" },
          { from: 'c2', to: ['c3', 'c4'], feedback: "Good! But for this practice, let's move the e-pawn.", redirectInstruction: "Move the highlighted pawn!" },
          { from: 'd2', to: ['d3', 'd4'], feedback: "Good! But for this practice, let's move the e-pawn.", redirectInstruction: "Move the highlighted pawn!" },
          { from: 'f2', to: ['f3', 'f4'], feedback: "Good! But for this practice, let's move the e-pawn.", redirectInstruction: "Move the highlighted pawn!" },
          { from: 'g2', to: ['g3', 'g4'], feedback: "Good! But for this practice, let's move the e-pawn.", redirectInstruction: "Move the highlighted pawn!" },
          { from: 'h2', to: ['h3', 'h4'], feedback: "Good! But for this practice, let's move the e-pawn.", redirectInstruction: "Move the highlighted pawn!" },
        ],
        weakMoveResponse: { feedback: '', hint: 'Click the e2 pawn and move it to e4.' },
        blunderResponse: { feedback: '', explanation: '', allowRetry: true },
        nextStepId: 'step2',
        pointsAwarded: 10
      },
      'step2': {
        id: 'step2',
        setupFEN: '8/8/8/4p3/3P4/8/PPP2PPP/8 w - - 0 2',
        highlightSquare: 'd4',
        expectedMove: { from: 'd4', to: 'e5' },
        instruction: 'Great! Pawns capture DIAGONALLY! Capture the black pawn on e5.',
        concept: 'Pawn capture',
        targetMoves: [
          { from: 'd4', to: ['e5'], explanation: "Nice capture!" },
        ],
        acceptableMoves: [
          { from: 'd4', to: ['d5'], feedback: "That's a forward move, but the pawn on e5 is unprotected!", redirectInstruction: "Capture diagonally on e5." }
        ],
        weakMoveResponse: { feedback: "That's not a capture.", hint: "Move the pawn on d4 diagonally to e5 to capture!" },
        blunderResponse: { feedback: "", explanation: "", allowRetry: true },
        nextStepId: null,
        pointsAwarded: 10
      }
    }
  },
  {
    id: 'b1',
    worldId: 1,
    title: 'The Pawn Golem',
    focus: 'Pawns',
    setupFEN: '8/8/8/8/8/8/P1P1P1P1/8 w - - 0 1',
    firstStepId: 'step1',
    expectedStepsLength: 3,
    difficulty: 'boss',
    isBossBattle: true,
    prerequisites: ['Pawn movement'],
    steps: {
      'step1': {
        id: 'step1',
        instruction: "I am the Pawn Golem! Let's see if you can promote a pawn against me!",
        concept: 'Pawn promotion race',
        targetMoves: [],
        acceptableMoves: [],
        weakMoveResponse: { feedback: "", hint: "" },
        blunderResponse: { feedback: "", explanation: "", allowRetry: true },
        nextStepId: null,
        pointsAwarded: 50
      }
    }
  }
];

export function getLesson(id: string): LessonDef | undefined {
  return LESSON_DEFINITIONS.find(l => l.id === id);
}
