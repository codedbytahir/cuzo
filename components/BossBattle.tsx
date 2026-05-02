/**
 * components/BossBattle.tsx
 */
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Zap, ShieldAlert } from 'lucide-react';
import { ChessBoard } from '@/components/ChessBoard';
import { GameEngine } from '@/lib/chessEngine';

type BossBattleProps = {
  bossName: string;
  engine: GameEngine;
  onMove: (from: string, to: string) => void;
  message?: string;
};

export const BossBattle: React.FC<BossBattleProps> = ({ bossName, engine, onMove, message }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-red-900 flex flex-col items-center justify-center p-4">
      
      {/* Epic Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
          Boss Battle
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-300 mt-2">Vs. {bossName}</h2>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 items-center w-full max-w-5xl">
        
        {/* Boss Portrait & Health */}
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full md:w-1/3 flex flex-col justify-center items-center gap-4 bg-gray-800/80 p-6 rounded-3xl border-4 border-red-500/50 shadow-[0_0_30px_rgba(255,0,0,0.3)]"
        >
          <div className="text-8xl drop-shadow-2xl">👹</div>
          <div className="w-full bg-gray-900 rounded-full h-6 border-2 border-gray-700 p-1">
             <div className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full w-full"></div>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Boss Health</p>
          
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-950 text-red-200 p-4 rounded-xl border border-red-800 font-bold text-center mt-4 w-full"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Board */}
        <div className="w-full max-w-md shadow-[0_0_50px_rgba(255,0,0,0.3)] rounded-lg overflow-hidden relative">
             <ChessBoard 
                board={engine.game.board()} 
                onMove={(from, to) => onMove(from, to)} 
                legalMoves={[]} 
                onSelectSquare={() => {}} 
                selectedSquare={null} 
                lastMove={null} 
                inCheck={engine.isCheck()} 
                kingSquare={null} 
             />
             <div className="absolute inset-0 bg-transparent" />
        </div>
      </div>
    </div>
  );
};
