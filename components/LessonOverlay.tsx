import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LessonStep } from '@/lib/curriculum';
import { CheckCircle2, AlertCircle, Eye, SkipForward } from 'lucide-react';

type LessonOverlayProps = {
  step: LessonStep;
  hintVisible: boolean;
  stepNumber: number;
  totalSteps: number;
  onShowMe?: () => void;
  onSkip?: () => void;
};

export const LessonOverlay: React.FC<LessonOverlayProps> = ({ step, hintVisible, stepNumber, totalSteps, onShowMe, onSkip }) => {
  return (
    <div className="w-full max-w-lg mb-6 relative">
      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-200 rounded-full mb-4 overflow-hidden border-2 border-white shadow-sm">
         <motion.div 
            className={`h-full ${step.isChallenge ? 'bg-[#FFD700]' : 'bg-blue-500'}`}
            initial={{ width: `${((stepNumber - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
         />
      </div>

      {/* Main Instruction */}
      <motion.div 
        key={step.instruction}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full p-4 rounded-3xl shadow-lg border-b-6 flex flex-col gap-2 ${
          step.isChallenge 
            ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 border-yellow-600 text-yellow-900' 
            : 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-800 text-white'
        }`}
      >
        <div className="flex-1 mt-1">
          <div className="font-black text-sm opacity-80 uppercase tracking-wider mb-1 flex justify-between">
             <span>{step.isChallenge ? 'Final Challenge!' : `Lesson`}</span>
             <span>Move {stepNumber} of {totalSteps}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold leading-tight">
             {step.instruction}
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2 justify-end mt-2">
            <button 
               onClick={onShowMe}
               className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition"
            >
               <Eye size={18} /> Show Me
            </button>
            <button 
               onClick={onSkip}
               className="bg-black/20 hover:bg-black/30 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition"
            >
               <SkipForward size={18} /> Skip
            </button>
        </div>
      </motion.div>

      {/* Hint Alert (pops up on wrong move) */}
      <AnimatePresence>
        {hintVisible && (
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{ y: 10, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-full left-0 right-0 z-30 mt-2"
          >
            <div className="bg-red-500 text-white p-4 rounded-2xl shadow-xl border-b-4 border-red-700 font-bold flex items-center gap-3">
              <AlertCircle size={32} />
              <p className="text-lg">{step.hint || 'Try another move!'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
