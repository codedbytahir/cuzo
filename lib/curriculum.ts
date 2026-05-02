export type Point = { from: string; to: string };

export type LessonStep = {
  fen: string;
  instruction: string;
  expectedMove: Point;
  hint: string;
  highlightSquare?: string | null;
  isChallenge?: boolean;
};

export type LevelDefinition = {
  id: number;
  worldId: number;
  title: string;
  introText: string;
  icon: string;
  steps: LessonStep[];
};

export type WorldDefinition = {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  levelsCount: number;
};

export const WORLDS: WorldDefinition[] = [
  { id: 1, title: "The Pawn Kingdom", description: "Pawn movement, chains, passed pawns", icon: "🏰", color: "bg-blue-400", levelsCount: 5 },
  { id: 2, title: "The Knight's Quest", description: "Knight movement, outposts, forks", icon: "🐴", color: "bg-green-400", levelsCount: 5 },
  { id: 3, title: "The Bishop's Path", description: "Bishop movement, diagonals, batteries", icon: "⛪", color: "bg-yellow-400", levelsCount: 5 },
  { id: 4, title: "The Rook's Reign", description: "Open files, 7th rank, rook endgames", icon: "🧱", color: "bg-red-400", levelsCount: 5 },
  { id: 5, title: "The Royal Court", description: "Queen power, king safety, active king", icon: "👑", color: "bg-purple-400", levelsCount: 5 },
  { id: 6, title: "Tactics Arena", description: "Pins, skewers, discovered attacks", icon: "⚔️", color: "bg-orange-400", levelsCount: 5 },
  { id: 7, title: "Opening Adventures", description: "Principles, Italian, Sicilian, traps", icon: "📖", color: "bg-teal-400", levelsCount: 5 },
  { id: 8, title: "Endgame Laboratory", description: "K+Q vs K, opposition, pawn races", icon: "🔬", color: "bg-indigo-400", levelsCount: 5 },
  { id: 9, title: "Strategy Summit", description: "Weak squares, pawn breaks, prophylaxis", icon: "🏔️", color: "bg-cyan-400", levelsCount: 5 },
  { id: 10, title: "Grandmaster Academy", description: "Calculation, time management, analysis", icon: "🎓", color: "bg-rose-400", levelsCount: 5 },
];

export const INITIAL_LEVELS: Omit<LevelDefinition, 'worldId'>[] = [
  {
    id: 1,
    title: "Meet the Pawns",
    introText: "Pawns are your loyal foot soldiers!",
    icon: "♟",
    steps: [
      {
        fen: "k7/8/8/8/8/8/4P3/7K w - - 0 1",
        instruction: "Move your pawn forward one square!",
        expectedMove: { from: "e2", to: "e3" },
        hint: "Not quite! Remember, pawns move straight forward. Try e3.",
        highlightSquare: "e2"
      },
      {
        fen: "k7/8/8/8/8/8/4P3/7K w - - 0 1",
        instruction: "On their first move, pawns can jump TWO squares! Try it.",
        expectedMove: { from: "e2", to: "e4" },
        hint: "Move the pawn all the way to e4!",
        highlightSquare: "e2"
      },
      {
        fen: "k7/8/8/8/3p4/4P3/8/7K w - - 0 1",
        instruction: "Pawns capture diagonally! Capture the black pawn.",
        expectedMove: { from: "e3", to: "d4" },
        hint: "Pawns capture one square diagonally. Capture on d4!",
        highlightSquare: "e3"
      },
      {
        fen: "k7/8/8/8/4p3/3P4/8/7K w - - 0 1",
        instruction: "CHALLENGE: Capture the black pawn safely!",
        expectedMove: { from: "d3", to: "e4" },
        hint: "Look for a diagonal capture!",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 2,
    title: "Rookies on the Move",
    introText: "Rooks move straight as a laser!",
    icon: "♜",
    steps: [
      {
        fen: "k7/8/8/8/8/8/8/R6K w - - 0 1",
        instruction: "Rooks move straight up, down, left, or right. Move the Rook to a8!",
        expectedMove: { from: "a1", to: "a8" },
        hint: "Move the rook straight up the board to a8.",
        highlightSquare: "a1"
      },
      {
        fen: "k7/8/8/8/8/8/4p3/R6K w - - 0 1",
        instruction: "Capture the pawn. Remember, straight lines only!",
        expectedMove: { from: "a1", to: "e1" },
        hint: "Slide the rook to the right to capture the piece on e1.",
        highlightSquare: "a1"
      },
      {
        fen: "k7/1r6/8/8/8/8/8/1R5K w - - 0 1",
        instruction: "CHALLENGE: Capture the enemy Rook!",
        expectedMove: { from: "b1", to: "b7" },
        hint: "Slide up to b7!",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 3,
    title: "Bishop's Diagonal Dance",
    introText: "Bishops slide on diagonals. Stay on your color!",
    icon: "♝",
    steps: [
      {
        fen: "k7/8/8/8/8/8/8/2B4K w - - 0 1",
        instruction: "Move the Bishop along its diagonal to h6!",
        expectedMove: { from: "c1", to: "h6" },
        hint: "Slide diagonally all the way to the top right edge (h6).",
        highlightSquare: "c1"
      },
      {
        fen: "k7/8/8/8/5p2/8/8/2B4K w - - 0 1",
        instruction: "Capture the pawn using a diagonal move!",
        expectedMove: { from: "c1", to: "f4" },
        hint: "Slide to f4 to capture the pawn.",
        highlightSquare: "c1"
      },
      {
        fen: "k7/1n6/8/8/8/8/8/K6B w - - 0 1",
        instruction: "CHALLENGE: Capture the knight!",
        expectedMove: { from: "h1", to: "b7" },
        hint: "Find the long diagonal to b7.",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 4,
    title: "Knight's Crazy Jumps",
    introText: "Knights move in an L-shape and can jump over others!",
    icon: "♞",
    steps: [
      {
        fen: "k7/8/8/8/8/8/8/1N5K w - - 0 1",
        instruction: "Knights move 2 steps one way, 1 step another (L-shape). Move to c3!",
        expectedMove: { from: "b1", to: "c3" },
        hint: "Jump to c3! Two up, one right.",
        highlightSquare: "b1"
      },
      {
        fen: "k7/8/8/8/8/2p5/1P1P4/1N5K w - - 0 1",
        instruction: "Knights can jump OVER pieces! Jump over your pawns and capture.",
        expectedMove: { from: "b1", to: "c3" },
        hint: "The knight ignores the pawns. Jump to c3!",
        highlightSquare: "b1"
      },
      {
        fen: "k7/8/8/8/4P3/8/5N2/7K w - - 0 1",
        instruction: "CHALLENGE: Move the Knight to d3!",
        expectedMove: { from: "f2", to: "d3" },
        hint: "Two left, one up, landing on d3.",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 5,
    title: "Royal Power",
    introText: "The Queen does it all. The King is your life!",
    icon: "♛",
    steps: [
      {
        fen: "k7/8/8/8/8/8/8/3Q3K w - - 0 1",
        instruction: "The Queen can move like a Rook OR a Bishop! Move to d8.",
        expectedMove: { from: "d1", to: "d8" },
        hint: "Move straight up to d8.",
        highlightSquare: "d1"
      },
      {
        fen: "k7/8/8/8/8/8/8/4K3 w - - 0 1",
        instruction: "The King moves just one square in any direction. Move to e2.",
        expectedMove: { from: "e1", to: "e2" },
        hint: "Step forward one square to e2.",
        highlightSquare: "e1"
      },
      {
        fen: "k7/8/8/8/p7/8/8/3Q3K w - - 0 1",
        instruction: "CHALLENGE: Queen capture! Capture the pawn on a4.",
        expectedMove: { from: "d1", to: "a4" },
        hint: "Move diagonally to a4.",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 6,
    title: "Setting the Stage",
    introText: "A real chess game starts like this!",
    icon: "♟",
    steps: [
      {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        instruction: "In a real game, you control the whole army! Move the pawn in front of your King to e4.",
        expectedMove: { from: "e2", to: "e4" },
        hint: "The e-pawn is a great first move. Move from e2 to e4.",
        highlightSquare: "e2"
      },
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        instruction: "CHALLENGE: Bring your King's Knight out to f3!",
        expectedMove: { from: "g1", to: "f3" },
        hint: "Develop your knight from g1 to f3.",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 7,
    title: "Capture the Flag",
    introText: "Take their pieces before they take yours!",
    icon: "⚔️",
    steps: [
      {
        fen: "k7/8/8/4n3/8/8/8/4R2K w - - 0 1",
        instruction: "Your Rook is attacking their Knight. Capture it!",
        expectedMove: { from: "e1", to: "e5" },
        hint: "Slide straight up to e5 and take the knight.",
        highlightSquare: "e1"
      },
      {
        fen: "k7/8/8/8/3p1q2/4P3/8/7K w - - 0 1",
        instruction: "CHALLENGE: Two enemy pieces are near. Which one can your pawn capture safely?",
        expectedMove: { from: "e3", to: "d4" },
        hint: "Pawns capture diagonally. Take the pawn on d4!",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 8,
    title: "Watch Out! Check!",
    introText: "If your King is attacked, it's CHECK! Run away or block!",
    icon: "⚠️",
    steps: [
      {
        fen: "k7/8/8/4q3/8/8/8/4K3 w - - 0 1",
        instruction: "Oh no! The Queen attacks your King! This is CHECK. Move to d1 to escape.",
        expectedMove: { from: "e1", to: "d1" },
        hint: "You must save your King. Move left to d1.",
        highlightSquare: "e1"
      },
      {
        fen: "k7/8/8/7q/8/8/3P4/4K3 w - - 0 1",
        instruction: "CHALLENGE: Your King is in check again! But you can't run. Block the check with your pawn!",
        expectedMove: { from: "d2", to: "d3" },
        hint: "Move the pawn up to block the Queen's path.",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 9,
    title: "Checkmate Victory!",
    introText: "If the King is in Check and CANNOT escape, it's CHECKMATE! You win!",
    icon: "🏆",
    steps: [
      {
        fen: "8/pk6/8/2Q5/8/8/8/7K w - - 0 1",
        instruction: "Trap the black King! Move the Queen to c7 for Checkmate!",
        expectedMove: { from: "c5", to: "c7" },
        hint: "Move straight up to c7.",
        highlightSquare: "c5"
      },
      {
        fen: "k7/8/2K5/8/8/8/8/1R6 w - - 0 1",
        instruction: "CHALLENGE: Find the Checkmate on the back rank!",
        expectedMove: { from: "b1", to: "b8" },
        hint: "Move the Rook all the way up to b8.",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  },
  {
    id: 10,
    title: "Special Moves Master",
    introText: "You're almost a master! Learn Castling and Promotion.",
    icon: "🌟",
    steps: [
      {
        fen: "k7/8/8/8/8/8/8/4K2R w K - 0 1",
        instruction: "Castling protects your King! Move your King exactly TWO squares to the right (g1) to Castle.",
        expectedMove: { from: "e1", to: "g1" },
        hint: "Move the King to g1 to perform kingside castling.",
        highlightSquare: "e1"
      },
      {
        fen: "k7/4P3/8/8/8/8/8/7K w - - 0 1",
        instruction: "When a pawn reaches the other side, it becomes a Queen! Move to e8.",
        expectedMove: { from: "e7", to: "e8" }, // chess.js will handle the promotion correctly since we set q
        hint: "Move the pawn to the end of the board!",
        highlightSquare: "e7"
      },
      {
        fen: "k7/8/8/3Pp3/8/8/8/7K w - e6 0 1", // This specific fen allows en passant to e6
        instruction: "CHALLENGE: En Passant! A special pawn capture. Capture diagonally to e6 to take the e5 pawn!",
        expectedMove: { from: "d5", to: "e6" },
        hint: "Move your pawn diagonally to e6. Black's pawn on e5 will magically disappear!",
        highlightSquare: null,
        isChallenge: true
      }
    ]
  }
];

export const LEVELS: LevelDefinition[] = [];

// Process predefined levels
INITIAL_LEVELS.forEach(level => {
  LEVELS.push({
    ...level,
    worldId: Math.ceil(level.id / 5) // IDs 1-5 -> World 1, 6-10 -> World 2
  });
});

// Generate placeholders for the remaining worlds 3-10
for (let w = 3; w <= 10; w++) {
  const world = WORLDS.find(x => x.id === w);
  for (let l = 1; l <= 5; l++) {
    const isBoss = l === 5;
    LEVELS.push({
      id: LEVELS.length + 1,
      worldId: w,
      title: isBoss ? `Boss Battle: ${world?.title}` : `${world?.title} - Lesson ${l}`,
      introText: isBoss ? "Test what you've learned against the boss!" : "Keep learning and practicing your moves.",
      icon: isBoss ? "🏰" : world?.icon || "⭐",
      steps: [
        {
          fen: "k7/8/8/8/8/8/4P3/7K w - - 0 1", // Extremely simple standard placeholder
          instruction: "This level is coming soon! For now, move the pawn.",
          expectedMove: { from: "e2", to: "e3" },
          hint: "Try moving the pawn.",
          highlightSquare: "e2"
        }
      ]
    });
  }
}
