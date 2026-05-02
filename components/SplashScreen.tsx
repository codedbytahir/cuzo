import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useSound } from '@/hooks/useSound';

type SplashScreenProps = {
  onComplete: () => void;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { playClick } = useSound();

  const handleComplete = () => {
    playClick();
    onComplete();
  };

  // Auto-advance after 14 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(); // Don't play click sound on auto-advance
    }, 14000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ backgroundColor: '#000000' }}
      animate={{ backgroundColor: '#FFE4C4' }}
      transition={{ duration: 2 }}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <button 
        onClick={handleComplete}
        className="absolute top-4 right-4 z-50 bg-white/40 hover:bg-white text-gray-800 font-bold py-2 px-6 rounded-full shadow-sm transition-all"
      >
        SKIP
      </button>

      {/* Main Title animates in at 11.5s */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 11.5, type: 'spring', bounce: 0.6 }}
        className="absolute top-[15%] sm:top-[20%] text-center z-20"
      >
        <h1 className="text-[100px] sm:text-[120px] font-black text-[#8B5A2B] tracking-tighter drop-shadow-lg leading-none">
          CUZO
        </h1>
        <p className="text-xl sm:text-3xl text-[#5C3A21] font-bold mt-2 bg-white/50 px-6 py-2 rounded-full inline-block backdrop-blur-sm">
          Learn Chess the Fun Way!
        </p>
      </motion.div>

      {/* Pieces Container Group Bounce */}
      <motion.div
        animate={{ y: [0, -40, 0] }}
        transition={{ delay: 11, duration: 0.5, ease: 'easeInOut' }}
        className="flex items-end justify-center gap-1 sm:gap-6 z-10 h-40 absolute bottom-[40%]"
      >
        {/* Pawn: bounces from bottom with wiggle */}
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1, rotate: [0, -15, 15, -15, 15, 0] }}
          transition={{ 
            y: { delay: 2, duration: 1, type: 'spring', bounce: 0.6 },
            opacity: { delay: 2, duration: 0.5 },
            rotate: { delay: 2.5, duration: 1 }
          }}
          className="text-6xl sm:text-8xl drop-shadow-xl text-gray-800"
        >
          ♟
        </motion.div>

        {/* Knight: gallops from left, almost bumps, dance */}
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -30, 0, -30, 0] }}
          transition={{ 
            x: { delay: 4, duration: 1.5, type: 'spring', bounce: 0.4 },
            opacity: { delay: 4, duration: 0.5 },
            y: { delay: 4.5, duration: 1.5 }
          }}
          className="text-6xl sm:text-8xl text-white"
          style={{ textShadow: '0 4px 8px rgba(0,0,0,0.6)' }}
        >
          ♞
        </motion.div>

        {/* Bishop: swooshes diagonally from top right */}
        <motion.div
           initial={{ x: 300, y: -300, opacity: 0 }}
           animate={{ x: 0, y: 0, opacity: 1 }}
           transition={{ delay: 6, duration: 1, type: 'spring' }}
           className="text-6xl sm:text-8xl drop-shadow-xl text-gray-800"
        >
          ♝
        </motion.div>

        {/* Rook: stomps heavily from right */}
        <motion.div
           initial={{ x: 300, scale: 2, opacity: 0 }}
           animate={{ x: 0, scale: 1, opacity: 1 }}
           transition={{ delay: 8, duration: 0.5, type: 'spring', bounce: 0.8 }}
           className="text-6xl sm:text-8xl text-white"
           style={{ textShadow: '0 4px 8px rgba(0,0,0,0.6)' }}
        >
          ♜
        </motion.div>

        {/* Queen: flies in with sparkle */}
        <motion.div
           initial={{ y: -300, scale: 0.2, opacity: 0 }}
           animate={{ y: 0, scale: 1, opacity: 1, rotate: [0, 360] }}
           transition={{ delay: 9, duration: 1.5, type: 'spring' }}
           className="text-6xl sm:text-8xl drop-shadow-xl text-gray-800"
        >
          ♛
        </motion.div>

        {/* King: walks slowly from right */}
        <motion.div
           initial={{ x: 200, opacity: 0 }}
           animate={{ x: 0, opacity: 1, rotate: [0, 5, 0, -5, 0, 5, 0] }}
           transition={{ delay: 10, duration: 2 }}
           className="text-6xl sm:text-8xl text-white"
           style={{ textShadow: '0 4px 8px rgba(0,0,0,0.6)' }}
        >
          ♚
        </motion.div>
      </motion.div>

      {/* PLAY Button at 12s */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 12, type: 'spring', bounce: 0.6 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleComplete}
        className="absolute bottom-[10%] sm:bottom-[15%] bg-green-500 text-white font-black text-3xl sm:text-4xl px-12 py-4 rounded-full shadow-2xl border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all z-30"
      >
        PLAY!
      </motion.button>
    </motion.div>
  );
};
