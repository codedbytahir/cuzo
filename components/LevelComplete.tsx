import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

type LevelCompleteProps = {
  stars: number;
  onNext: () => void;
  onMenu: () => void;
  onReview?: () => void;
  hasPgn?: boolean;
  isLastLevel: boolean;
  aiSummary?: {
    goodMoves: number;
    mistakes: number;
    bestMove: string;
    improvement: string;
    skill: string;
  };
};

export const LevelComplete: React.FC<LevelCompleteProps> = ({ stars, onNext, onMenu, onReview, hasPgn, isLastLevel, aiSummary }) => {
  const { playCheckmate } = useSound();

  useEffect(() => {
    playCheckmate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div 
      initial={{ backgroundColor: 'rgba(0,0,0,0)', opacity: 0 }}
      animate={{ backgroundColor: 'rgba(0,0,0,0.8)', opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ y: 50, scale: 0.8, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-8 border-yellow-400 text-center relative my-8"
      >
        <motion.h1 
           animate={{ rotate: [-2, 2, -2] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 mb-6 drop-shadow-sm"
        >
          {aiSummary ? "CHECKMATE!" : "LEVEL COMPLETE!"}
        </motion.h1>

        {/* Stars */}
        <div className="flex justify-center gap-4 mb-6">
          {[1, 2, 3].map((starIdx) => (
            <motion.div
              key={starIdx}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: starIdx * 0.2 + 0.5, type: 'spring', bounce: 0.7 }}
            >
              <Star 
                size={60} 
                fill={starIdx <= stars ? "#FFD700" : "#E2E8F0"} 
                color={starIdx <= stars ? "#D97706" : "#CBD5E1"} 
                strokeWidth={2}
                className={starIdx <= stars ? 'drop-shadow-lg' : ''}
              />
            </motion.div>
          ))}
        </div>

        <p className="text-xl sm:text-2xl font-bold text-gray-700 mb-6">
           {stars === 3 ? "Amazing! You're a chess superstar! 🌟" : "Great job! Keep practicing!"}
        </p>

        {aiSummary && (
          <div className="bg-blue-50 border-4 border-blue-200 rounded-2xl p-4 text-left mb-6 shadow-inner text-sm sm:text-base">
            <h3 className="font-black text-blue-800 mb-2">🤖 Robot&apos;s Post-Game Analysis</h3>
            <p className="text-gray-700 mb-1"><strong>Great game!</strong> You made <strong>{aiSummary.goodMoves}</strong> good moves and <strong>{aiSummary.mistakes}</strong> mistakes.</p>
            <p className="text-gray-700 mb-1"><strong>Strongest moment:</strong> Finding the move <strong>{aiSummary.bestMove}</strong></p>
            <p className="text-gray-700 mb-1"><strong>To work on:</strong> {aiSummary.improvement}</p>
            <div className="mt-3 bg-blue-100 p-2 rounded-lg text-center font-bold text-blue-900 border-2 border-blue-300">
              Estimated skill: <span className="text-orange-600">{aiSummary.skill}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {hasPgn && onReview && (
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={onReview}
               className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black text-xl py-4 rounded-2xl shadow-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
             >
               🔍 Review Game
             </motion.button>
          )}
          {!isLastLevel && (
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={onNext}
               className="w-full bg-green-500 text-white font-black text-2xl py-4 rounded-full shadow-lg border-b-6 border-green-700 active:border-b-0 active:translate-y-2 transition-all"
             >
               NEXT LEVEL
             </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenu}
            className={`w-full ${isLastLevel ? 'bg-blue-500 border-blue-700 text-white text-2xl py-4 border-b-6' : 'bg-gray-200 border-gray-400 text-gray-600 text-xl py-3 border-b-4'} font-black rounded-full shadow-md active:border-b-0 active:translate-y-1 transition-all`}
          >
            BACK TO MAP
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
