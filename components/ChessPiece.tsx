/**
 * components/ChessPiece.tsx
 * 
 * Renders an individual chess piece on the board.
 * Uses motion for bouncy animations when moved.
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useSound } from '@/hooks/useSound';

type PieceProps = {
  type: string;
  color: 'w' | 'b';
  isSelected?: boolean;
  justMoved?: boolean;
  isAIThinking?: boolean;
};

const PIECE_UNICODE: Record<string, string> = {
  'p': '♟',
  'n': '♞',
  'b': '♝',
  'r': '♜',
  'q': '♛',
  'k': '♚',
};

export const ChessPiece: React.FC<PieceProps> = ({ type, color, isSelected, justMoved, isAIThinking }) => {
  const symbol = PIECE_UNICODE[type.toLowerCase()];
  const { playPawn, playRook, playKnight, playBishop, playQueen, playKing } = useSound();

  // Play piece specific sound when this piece has just moved
  useEffect(() => {
    if (justMoved) {
      switch (type.toLowerCase()) {
        case 'p': playPawn(); break;
        case 'r': playRook(); break;
        case 'n': playKnight(); break;
        case 'b': playBishop(); break;
        case 'q': playQueen(); break;
        case 'k': playKing(); break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justMoved, type]);

  return (
    <motion.div
      layout
      className={`relative flex items-center justify-center w-full h-full text-5xl sm:text-6xl cursor-pointer select-none drop-shadow-md z-10`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={
        isAIThinking 
          ? { rotate: [-5, 5, -5], y: [-2, 2, -2] }
          : { scale: isSelected ? 1.15 : 1, opacity: 1, rotate: 0, y: 0 }
      }
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 15,
        ...(isAIThinking ? { repeat: Infinity, duration: 1.5 } : {})
      }}
      style={{
        color: color === 'w' ? '#FFFFFF' : '#2A2A2A',
        textShadow: color === 'w' ? '0 2px 4px rgba(0,0,0,0.4), 0 0 2px rgba(0,0,0,0.8)' : '0 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      {symbol}
    </motion.div>
  );
};
