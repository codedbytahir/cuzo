/**
 * lib/tacticsEngine.ts
 */
export interface TacticPuzzle {
  id: string;
  fen: string;
  moves: string[]; // sequence of moves to solve, UCI e.g. "e2e4", "e7e5"
  theme: "fork" | "pin" | "skewer" | "discoveredAttack" | "doubleCheck" | "removingDefender" | "deflection" | "backRankMate" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export const PUZZLE_DATABASE: TacticPuzzle[] = [
  {
    id: 'p1',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5',
    moves: ['f3e5', 'c6e5', 'd2d4'],
    theme: 'mixed',
    difficulty: 'easy',
    explanation: 'A classic center trick!'
  },
  {
    id: 'p2',
    fen: '4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1',
    moves: ['e2e8'],
    theme: 'backRankMate',
    difficulty: 'easy',
    explanation: 'Checkmate on the back rank.'
  },
  {
    id: 'p3',
    fen: '3r2k1/p4ppp/1p2p3/2b5/8/1P2P3/PB3PPP/R5K1 w - - 0 1',
    moves: ['a1c1'],
    theme: 'deflection',
    difficulty: 'medium',
    explanation: 'Deflecting the rook to prepare another move, or keeping control.'
  },
  {
    id: 'p4',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
    moves: ['f3e5', 'c6e5', 'd2d4'],
    theme: 'removingDefender',
    difficulty: 'easy',
    explanation: 'Removing the defender to gain control of the center!'
  }
];

export function getNextPuzzle(rating: number): TacticPuzzle {
  // Logic to fetch a puzzle around the user's rating or focused on weaknesses.
  // We'll return a random one for now.
  const idx = Math.floor(Math.random() * PUZZLE_DATABASE.length);
  return PUZZLE_DATABASE[idx];
}
