import React from 'react';
import { motion } from 'motion/react';
import { Play, HelpCircle, Zap } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

type MainMenuProps = {
  onStart: () => void;
  onHowToPlay: () => void;
  onTactics?: () => void;
};

const FLOATING_PIECES = [
  { icon: '♟', isWhite: true, top: '10%', left: '15%', delay: 0.2, duration: 5.2, xDist: 5, rotDist: 8 },
  { icon: '♞', isWhite: false, top: '25%', left: '80%', delay: 1.1, duration: 6.0, xDist: -8, rotDist: -5 },
  { icon: '♝', isWhite: true, top: '50%', left: '10%', delay: 0.5, duration: 4.5, xDist: 6, rotDist: 10 },
  { icon: '♜', isWhite: false, top: '75%', left: '85%', delay: 2.1, duration: 5.8, xDist: -4, rotDist: 15 },
  { icon: '♛', isWhite: true, top: '85%', left: '25%', delay: 1.5, duration: 7.0, xDist: 7, rotDist: -12 },
  { icon: '♚', isWhite: false, top: '15%', left: '60%', delay: 0.8, duration: 4.8, xDist: -6, rotDist: 5 },
  { icon: '♟', isWhite: false, top: '40%', left: '40%', delay: 2.8, duration: 6.2, xDist: 4, rotDist: -8 },
  { icon: '♞', isWhite: true, top: '65%', left: '30%', delay: 1.7, duration: 5.5, xDist: -5, rotDist: 6 },
  { icon: '♝', isWhite: false, top: '80%', left: '60%', delay: 0.9, duration: 6.5, xDist: 9, rotDist: 12 },
  { icon: '♜', isWhite: true, top: '20%', left: '35%', delay: 2.5, duration: 4.2, xDist: -7, rotDist: -14 },
  { icon: '♛', isWhite: false, top: '55%', left: '75%', delay: 1.2, duration: 5.9, xDist: 8, rotDist: 9 },
  { icon: '♚', isWhite: true, top: '35%', left: '85%', delay: 0.4, duration: 6.7, xDist: -9, rotDist: -6 },
];

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onHowToPlay, onTactics }) => {
  const { playClick } = useSound();

  const handleStart = () => {
    playClick();
    onStart();
  };

  const handleHowToPlay = () => {
    playClick();
    onHowToPlay();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FFF8E7] to-[#FFE4C4] flex flex-col items-center justify-center overflow-hidden">
      {/* Background floating pieces */}
      {FLOATING_PIECES.map((piece, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, piece.xDist, 0],
            rotate: [0, piece.rotDist, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: piece.duration,
            delay: piece.delay
          }}
          className={`absolute text-6xl sm:text-8xl opacity-[0.15] pointer-events-none drop-shadow-sm ${piece.isWhite ? 'text-white' : 'text-gray-800'}`}
          style={{
            top: piece.top,
            left: piece.left
          }}
        >
          {piece.icon}
        </motion.div>
      ))}

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="z-10 flex flex-col items-center px-4 w-full"
      >
        <h1 className="text-8xl sm:text-9xl font-black text-[#8B5A2B] tracking-tighter drop-shadow-xl mb-2 text-center leading-none">
          CUZO
        </h1>
        <p className="text-2xl sm:text-3xl text-[#B58863] font-bold mb-16 text-center">Learn Chess the Fun Way!</p>

        <div className="flex flex-col gap-6 w-full max-w-sm">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-400 text-white py-5 px-8 rounded-full font-black text-3xl shadow-xl border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all"
          >
            <Play size={40} fill="currentColor" />
            START GAME
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTactics}
            className="flex items-center justify-center gap-3 w-full bg-orange-500 hover:bg-orange-400 text-white py-4 px-8 rounded-full font-black text-2xl shadow-xl border-b-8 border-orange-700 active:border-b-0 active:translate-y-2 transition-all"
          >
            <Zap size={32} />
            TACTICS
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/cuzo'}
            className="flex items-center justify-center gap-3 w-full bg-purple-500 hover:bg-purple-400 text-white py-4 px-8 rounded-full font-black text-2xl shadow-xl border-b-8 border-purple-700 active:border-b-0 active:translate-y-2 transition-all"
          >
            <span className="text-3xl">🤖</span>
            AI TUTOR
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHowToPlay}
            className="flex items-center justify-center gap-3 w-full bg-blue-500 hover:bg-blue-400 text-white py-4 px-8 rounded-full font-black text-2xl shadow-xl border-b-8 border-blue-700 active:border-b-0 active:translate-y-2 transition-all"
          >
            <HelpCircle size={32} />
            HOW TO PLAY
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
