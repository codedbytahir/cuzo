import React from 'react';
import { motion } from 'motion/react';
import { WORLDS, LEVELS } from '@/lib/curriculum';
import { Lock, Crown, ChevronLeft } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

type WorldMapProps = {
  onWorldSelect: (worldId: number) => void;
  onBack: () => void;
  completedLevels: Record<number, number>; // levelId -> stars
};

export const WorldMap: React.FC<WorldMapProps> = ({ onWorldSelect, onBack, completedLevels }) => {
  const { playClick } = useSound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] to-[#FFE4C4] p-4 sm:p-6 relative overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto pb-20 w-full">
        {/* Header */}
        <div className="flex items-center mb-8 bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-sm border-2 border-white sticky top-4 z-20 w-full">
          <button 
            onClick={() => { playClick(); onBack(); }}
            className="p-3 bg-orange-100 hover:bg-orange-200 rounded-full text-orange-700 transition"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl sm:text-5xl font-black text-orange-900 drop-shadow-sm">World Map</h1>
          </div>
          <div className="w-14"></div> {/* spacer for centering */}
        </div>

        {/* Worlds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 w-full">
          {WORLDS.map((world, index) => {
            const worldLevels = LEVELS.filter(l => l.worldId === world.id);
            const firstLevelOfWorld = worldLevels[0]?.id;
            const completedCount = worldLevels.filter(l => l.id in completedLevels).length;
            const isCompleted = completedCount === worldLevels.length;

            // World is unlocked if it's the first world, or if the first level of this world is unlocked
            let isUnlocked = world.id === 1;
            if (world.id > 1 && firstLevelOfWorld) {
               // Unlocked if previous level (last level of previous world) is completed
               isUnlocked = Object.keys(completedLevels).includes(String(firstLevelOfWorld - 1));
            }
            
            const isCurrent = isUnlocked && !isCompleted && completedCount > 0;
            const isNext = isUnlocked && completedCount === 0;

            const isLocked = !isUnlocked;

            return (
              <motion.div 
                key={world.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                className="w-full"
              >
                <motion.button
                  whileHover={!isLocked ? { scale: 1.05 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (!isLocked) {
                      playClick();
                      onWorldSelect(world.id);
                    }
                  }}
                  animate={(isCurrent || isNext) ? { y: [0, -5, 0] } : {}}
                  transition={(isCurrent || isNext) ? { repeat: Infinity, duration: 2 } : {}}
                  className={`w-full flex items-center p-4 sm:p-6 rounded-3xl shadow-xl transition-all relative text-left border-b-8 border-4 border-white ${
                    isLocked 
                      ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                      : isCompleted
                        ? 'bg-green-100 border-green-600'
                        : `${world.color.replace('bg-', 'bg-opacity-20 bg-')} border-${world.color.replace('bg-', 'border-')}`
                  } ${isUnlocked && !isCompleted ? world.color : ''}`}
                >
                  {/* Icon Area */}
                  <div className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-inner ${isLocked ? 'bg-gray-200' : 'bg-white/50'}`}>
                    {isLocked ? <Lock size={40} className="text-gray-400" /> : isCompleted ? <Crown size={48} className="text-yellow-500" /> : world.icon}
                  </div>
                  
                  {/* Text Content */}
                  <div className="ml-4 sm:ml-6 flex-1 text-white">
                    <h3 className={`font-black text-xl sm:text-2xl ${isLocked ? 'text-gray-600' : 'text-white'} leading-tight drop-shadow-md`}>
                      {world.title}
                    </h3>
                    <p className={`font-bold text-sm sm:text-md mt-1 ${isLocked ? 'text-gray-500' : 'text-white/90'}`}>
                      {world.description}
                    </p>
                    {/* Progress Bar */}
                    <div className="mt-3 bg-black/20 rounded-full h-3 sm:h-4 w-full overflow-hidden border border-black/10">
                      <div 
                        className={`h-full ${isLocked ? 'bg-gray-400' : 'bg-white'} rounded-full`}
                        style={{ width: `${(completedCount / world.levelsCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
