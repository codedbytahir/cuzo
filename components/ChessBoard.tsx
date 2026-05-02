/**
 * components/ChessBoard.tsx
 * 
 * Renders the 8x8 chess grid and pieces.
 * Handles square clicks, highlighting valid moves, and triggering moves.
 */

import React from 'react';
import { Square, Move } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { motion } from 'motion/react';

type ChessBoardProps = {
  board: ({ square: Square; type: string; color: 'w' | 'b' } | null)[][];
  onMove: (source: Square, target: Square) => void;
  legalMoves: Move[];
  onSelectSquare: (square: Square | null) => void;
  selectedSquare: Square | null;
  lastMove: { from: string, to: string } | null;
  inCheck: boolean;
  kingSquare: Square | null; // For highlighting the king in check
  lessonHighlightSquare?: string | null;
  lessonTargetSquare?: string | null;
  isAIThinking?: boolean;
};

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
  board, 
  onMove, 
  legalMoves, 
  onSelectSquare, 
  selectedSquare,
  lastMove,
  inCheck,
  kingSquare,
  lessonHighlightSquare,
  lessonTargetSquare,
  isAIThinking
}) => {
  // Columns a-h, Rows 8-1
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const handleSquareClick = (square: Square) => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
       navigator.vibrate(20);
    }

    if (selectedSquare) {
      if (selectedSquare === square) {
        onSelectSquare(null); // deselect
      } else {
        onMove(selectedSquare, square);
      }
      return;
    }

    onSelectSquare(square);
  };

  return (
    <div className="relative w-full max-w-lg aspect-square border-8 border-[#8B5A2B] rounded-xl overflow-hidden shadow-2xl bg-[#F0D9B5]">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank, r) => 
          files.map((file, f) => {
            const squareStr = `${file}${rank}` as Square;
            const piece = board[r][f];
            const isDark = (r + f) % 2 === 1;
            
            // Interaction States
            const isSelected = selectedSquare === squareStr;
            const isLegalMove = legalMoves.some(m => m.to === squareStr);
            const isLastMove = lastMove?.from === squareStr || lastMove?.to === squareStr;
            const isKingInCheck = inCheck && squareStr === kingSquare;
            const isLessonHighlight = lessonHighlightSquare === squareStr;
            const isLessonTarget = lessonTargetSquare === squareStr;

            return (
              <div 
                key={squareStr}
                onClick={() => handleSquareClick(squareStr)}
                className={`relative flex items-center justify-center
                  ${isDark ? 'bg-[#B58863]' : 'bg-[#F0D9B5]'}
                `}
              >
                {/* Last move highlight soft yellow */}
                {isLastMove && (
                  <div className="absolute inset-0 bg-yellow-300 opacity-40 z-0"></div>
                )}
                
                {/* Check alert: pulsing red */}
                {isKingInCheck && (
                  <motion.div 
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 bg-red-600 z-0"
                  />
                )}

                {/* Lesson Prompt highlight */}
                {!isSelected && isLessonHighlight && (
                  <motion.div 
                    animate={{ backgroundColor: ['rgba(59,130,246,0)', 'rgba(59,130,246,0.4)', 'rgba(59,130,246,0)'] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 z-0 border-4 border-blue-500 rounded-sm"
                  />
                )}

                {/* Selected glow */}
                {isSelected && piece && (
                  <div className="absolute inset-0 border-4 border-green-500 bg-green-500/20 z-10 rounded-sm"></div>
                )}

                {/* Legal move dot */}
                {isLegalMove && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className={`rounded-full bg-green-500/60 ${piece ? 'w-full h-full border-4 border-green-500 bg-transparent' : 'w-1/3 h-1/3'}`}></div>
                  </div>
                )}

                {/* The Piece */}
                {piece && (
                  <ChessPiece 
                    type={piece.type} 
                    color={piece.color} 
                    isSelected={isSelected}
                    justMoved={lastMove?.to === squareStr}
                    isAIThinking={isAIThinking && piece.color === 'b'}
                  />
                )}
                
                {/* Board Coordinates (Kids friendly) */}
                {f === 0 && (
                  <div className="absolute top-1 left-1 font-bold text-xs opacity-60 z-0 pointer-events-none" style={{ color: isDark ? '#F0D9B5' : '#B58863'}}>
                    {rank}
                  </div>
                )}
                {r === 7 && (
                  <div className="absolute bottom-1 right-1 font-bold text-xs opacity-60 z-0 pointer-events-none" style={{ color: isDark ? '#F0D9B5' : '#B58863'}}>
                    {file}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
