/**
 * lib/chessEngine.ts
 * 
 * Wrapper for the chess.js library to manage game state.
 * Provides simplified functions for checking game over conditions,
 * generating random AI moves, and mapping the board.
 */

import { Chess, Move, Square } from 'chess.js';

export class GameEngine {
  public game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  /**
   * Gets the entire board state as a 2D array.
   */
  getBoard() {
    return this.game.board();
  }

  /**
   * Retrieves all legal moves for a given square.
   * @param square The square (e.g., 'e2')
   */
  getLegalMoves(square: Square): Move[] {
    return this.game.moves({ square, verbose: true }) as Move[];
  }

  /**
   * Attempts to move a piece from source to target.
   * Automatically promotes to queen if a pawn reaches the last rank.
   * @param source The starting square
   * @param target The target square
   * @returns true if successful, false otherwise
   */
  move(source: string, target: string): boolean {
    try {
      const result = this.game.move({
        from: source,
        to: target,
        promotion: 'q', // Always promote to queen for simplicity
      });
      return result !== null;
    } catch {
      return false;
    }
  }

  /**
   * Reverts the last move made.
   */
  undo() {
    this.game.undo();
  }

  /**
   * Returns true if the game is over (checkmate, stalemate, draw, etc.)
   */
  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  /**
   * Returns true if the current player is in check.
   */
  isCheck(): boolean {
    return this.game.inCheck();
  }

  /**
   * Evaluates if the current player is in checkmate.
   */
  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  /**
   * Evaluates if the game is drawn.
   */
  isDraw(): boolean {
    return this.game.isDraw();
  }

  /**
   * Applies an algebraic move string (e.g. 'e2e4' or 'Nf3').
   * @param moveStr The move to apply
   * @returns The verbose Move object if valid, null otherwise
   */
  makeMoveString(moveStr: string): Move | null {
    try {
      const move = this.game.move(moveStr);
      return move;
    } catch {
      return null;
    }
  }

  /**
   * Makes a random legal move for the current player (AI).
   * @param specificMove If provided, makes this move instead of random (for AI sound sync)
   * @returns The move made or null if no moves available
   */
  makeRandomMove(specificMove?: Move): Move | null {
    if (specificMove) {
      this.game.move(specificMove);
      return specificMove;
    }
    const moves = this.game.moves({ verbose: true }) as Move[];
    if (moves.length === 0) return null;
    const randomIdx = Math.floor(Math.random() * moves.length);
    const move = moves[randomIdx];
    this.game.move(move);
    return move;
  }

  /**
   * Resets the game to the starting position.
   */
  reset() {
    this.game.reset();
  }

  /**
   * Returns 'w' for white, 'b' for black turn.
   */
  turn() {
    return this.game.turn();
  }

  /**
   * Export the FEN strictly required for React state sync
   */
  fen() {
    return this.game.fen();
  }
}
