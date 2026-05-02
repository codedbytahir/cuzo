import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LEVELS } from '@/lib/curriculum';
import { Lock, Star, ChevronLeft } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

export type LevelSelectProps = {
  worldId: number;
  onLevelSelect: (levelId: number) => void;
  onBack: () => void;
  completedLevels: Record<number, number>; // levelId -> stars
};

export const LevelSelect: React.FC<LevelSelectProps> = ({ worldId, onLevelSelect, onBack, completedLevels }) => {
  const { playClick } = useSound();

  const handleSelect = (id: number, isLocked: boolean) => {
    if (!isLocked) {
      playClick();
      onLevelSelect(id);
    }
  };

  const worldLevels = LEVELS.filter(l => l.worldId === worldId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] p-6 relative overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center mb-8 bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-sm border-2 border-white sticky top-4 z-20">
          <button 
            onClick={() => { playClick(); onBack(); }}
            className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-700 transition"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-blue-900 drop-shadow-sm">Select Level</h1>
          </div>
          <div className="w-14"></div> {/* spacer for centering */}
        </div>

        {/* Levels Path */}
        <div className="relative flex flex-col items-center justify-center gap-10 mt-12">
          {worldLevels.map((level, index) => {
            const isCompleted = level.id in completedLevels;
            const stars = completedLevels[level.id] || 0;
            // Unlocked if it's level 1, or if the PREVIOUS level is completed
            const isUnlocked = level.id === 1 || Object.keys(completedLevels).includes(String(level.id - 1));
            const isCurrent = isUnlocked && !isCompleted;
            const isLocked = !isUnlocked;

            // Alternate path left and right
            const offset = index % 2 === 0 ? '-translate-x-12 sm:-translate-x-32' : 'translate-x-12 sm:translate-x-32';

            return (
              <motion.div 
                key={level.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className={`relative z-10 ${offset}`}
              >
                {/* Level Node Base */}
                <motion.button
                  whileHover={!isLocked ? { scale: 1.1 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  onClick={() => handleSelect(level.id, isLocked)}
                  animate={isCurrent ? { y: [0, -10, 0] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 1.5 } : {}}
                  className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center border-b-8 shadow-xl transition-all relative ${
                    isLocked 
                      ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed' 
                      : isCompleted
                        ? 'bg-green-400 border-green-600 text-white'
                        : 'bg-yellow-400 border-yellow-600 text-yellow-900 border-4 border-white border-b-8'
                  }`}
                >
                  <span className="text-4xl sm:text-5xl drop-shadow-md mb-1">{isLocked ? <Lock size={40} className="text-gray-500" /> : level.icon}</span>
                  <span className="font-extrabold text-xl">{level.id}</span>
                  
                  {/* Stars Container */}
                  {isCompleted && (
                     <div className="absolute -bottom-6 flex gap-1 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white">
                       {[...Array(3)].map((_, i) => (
                         <Star 
                           key={i} 
                           size={20} 
                           fill={i < stars ? "#FFD700" : "transparent"} 
                           color={i < stars ? "#FFD700" : "#A0AEC0"} 
                         />
                       ))}
                     </div>
                  )}
                </motion.button>
                
                {/* Level Title Bubble (appears on hover or always for current) */}
                <div className={`absolute top-1/2 -translate-y-1/2 ${index % 2 === 0 ? 'left-[120%] sm:left-[130%]' : 'right-[120%] sm:right-[130%] text-right'} w-48 pointer-events-none`}>
                   <h3 className={`font-black text-xl sm:text-2xl ${isLocked ? 'text-gray-400' : 'text-blue-900'} leading-tight bg-white/70 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm border-2 border-white inline-block`}>
                     {level.title}
                   </h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
