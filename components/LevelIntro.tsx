import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { LevelDefinition } from '@/lib/curriculum';
import { useSound } from '@/hooks/useSound';

type LevelIntroProps = {
  level: LevelDefinition;
  onComplete: () => void;
};

const FUN_FACTS = [
  "Did you know? The word 'checkmate' comes from Persian meaning 'the king is helpless'!",
  "Did you know? The longest chess game ever lasted 269 moves!",
  "Did you know? The number of possible chess games is far greater than the number of atoms in the universe!",
  "Fun Fact: Chess was invented in India over 1,500 years ago, where it was called Chaturanga.",
  "Did you know? The folding chessboard was invented by a priest so it would look like two books on a shelf!",
  "Fun Fact: The Queen gained her amazing far-reaching super powers in the 15th century!"
];

export const LevelIntro: React.FC<LevelIntroProps> = ({ level, onComplete }) => {
  const { playQueen } = useSound();
  const [funFact] = React.useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);

  useEffect(() => {
    // Play fanfare when intro spawns
    playQueen();
    
    // Auto advance after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div 
      initial={{ backgroundColor: '#000000', opacity: 0 }}
      animate={{ backgroundColor: '#2E8B57', opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
        className="bg-white p-8 sm:p-12 rounded-[50px] shadow-2xl max-w-2xl w-full border-8 border-[#228B22] relative overflow-hidden flex flex-col items-center"
      >
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.05] pointer-events-none text-[200px] leading-none flex items-center justify-center">
            {level.icon}
        </div>
        
        <h2 className="text-[#228B22] font-black text-3xl mb-4 uppercase tracking-widest relative z-10">
          Level {level.id}
        </h2>
        <h1 className="text-gray-800 text-4xl sm:text-7xl font-black mb-6 leading-tight drop-shadow-sm relative z-10">
          {level.title}
        </h1>
        <p className="text-2xl text-gray-600 font-bold border-t-4 border-gray-200 pt-6 relative z-10 w-full">
          {level.introText}
        </p>

        <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ delay: 2, type: 'spring' }}
           className="mt-6 text-8xl relative z-10"
        >
            {level.icon}
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 3 }}
           className="mt-8 bg-blue-50 text-blue-800 p-4 rounded-3xl border-2 border-blue-200 relative z-10 w-full"
        >
           <p className="font-bold text-lg">🧠 {funFact}</p>
        </motion.div>
      </motion.div>
      
      <button 
        onClick={onComplete}
        className="absolute bottom-10 bg-white/40 text-black font-black hover:bg-white hover:text-green-800 py-4 px-10 rounded-full transition-all text-xl shadow-lg border-b-4 border-black/20 active:border-b-0 active:translate-y-1"
      >
        SKIP AND PLAY! 🚀
      </button>
    </motion.div>
  );
};
