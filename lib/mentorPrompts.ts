import { GameEngine } from './chessEngine';
import { Move } from 'chess.js';

export function getHint(engine: GameEngine): string {
    if (engine.isCheck()) {
       return "Uh oh! Your king is in danger! Can you find a safe move? 🏰";
    }
    const moves = engine.game.moves({ verbose: true }) as Move[];
    if (moves.length === 0) return "No moves left!";
    
    // Check for captures
    const captures = moves.filter(m => m.flags.includes('c') || m.flags.includes('e'));
    if (captures.length > 0) {
        const move = captures[Math.floor(Math.random() * captures.length)];
        return `I spy a capture! Try moving your ${getPieceName(move.piece)} to ${move.to} to capture their piece! ⭐`;
    }

    // Check for checks
    const checks = moves.filter(m => m.san.includes('+'));
    if (checks.length > 0) {
        const move = checks[Math.floor(Math.random() * checks.length)];
        return `Want to be sneaky? Move your ${getPieceName(move.piece)} to ${move.to} to put them in CHECK! 🎯`;
    }

    // Random safe move
    const move = moves[Math.floor(Math.random() * moves.length)];
    return `How about moving your ${getPieceName(move.piece)} to ${move.to}? It's a solid move! 🛡️`;
}

export function getPieceName(symbol: string): string {
    const names: Record<string, string> = {
        'p': 'pawn', 'n': 'knight', 'b': 'bishop', 'r': 'rook', 'q': 'queen', 'k': 'king'
    };
    return names[symbol.toLowerCase()] || 'piece';
}

export function getMistakeMessage(): string {
     const msgs = [
         "Hmm, that move isn't quite right! Try again! 💪",
         "Oops! That piece can't move there. You can do it! 🌟",
         "Not quite! Remember how your pieces move! 🧠"
     ];
     return msgs[Math.floor(Math.random() * msgs.length)];
}

export function getPraiseMessage(): string {
    const msgs = [
        "Wow! That's a smart move! 🌟",
        "Great job! You're playing like a grandmaster! 👑",
        "Nice capture! That's one less piece to worry about! ⭐"
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
}

export function getStuckMessage(): string {
    return "Try looking at your pieces — one of them can make a tricky move! Need a hint? 🧙";
}

export function getExplainMessage(): string {
    return "Every move is part of a plan! Try to control the center, develop your pieces, and keep your King safe! 🏰";
}
