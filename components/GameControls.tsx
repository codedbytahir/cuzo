/**
 * components/GameControls.tsx
 * 
 * Provides UI buttons for resetting the game and undoing moves.
 */

import React from 'react';
import { RotateCcw, Undo2, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useSound } from '@/hooks/useSound';

type GameControlsProps = {
  onUndo: () => void;
  onReset: () => void;
  disableUndo: boolean;
  toggleMentor?: () => void;
};

export const GameControls: React.FC<GameControlsProps> = ({ onUndo, onReset, disableUndo, toggleMentor }) => {
  const { isMuted, isMusicPlaying, toggleMute, toggleMusic, playClick } = useSound();

  const handleUndo = () => {
    playClick();
    onUndo();
  };

  const handleReset = () => {
    playClick();
    onReset();
  };

  const handleMuteToggle = () => {
    playClick();
    toggleMute();
  };

  const handleHelp = () => {
     playClick();
     if (toggleMentor) toggleMentor();
  };

  return (
    <div className="flex gap-2 sm:gap-4 items-center justify-center mt-2 sm:mt-6 z-20 relative flex-wrap px-2 sm:px-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMuteToggle}
        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-lg border-b-4 bg-purple-500 border-purple-700 hover:bg-purple-400 active:border-b-0 active:translate-y-1 transition-all"
        title="Toggle Sound"
        aria-label={isMuted ? "Unmute sound" : "Mute sound"}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMusic}
        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-lg border-b-4 ${isMusicPlaying ? 'bg-pink-500 border-pink-700 hover:bg-pink-400' : 'bg-gray-400 border-gray-600 hover:bg-gray-300'} active:border-b-0 active:translate-y-1 transition-all`}
        title="Toggle Background Music"
        aria-label={isMusicPlaying ? "Stop music" : "Play music"}
      >
        <span className="text-xl sm:text-2xl">🎵</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUndo}
        disabled={disableUndo}
        aria-label="Undo last move"
        className={`flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white font-bold text-lg sm:text-xl shadow-lg border-b-4 ${
          disableUndo 
            ? 'bg-gray-400 border-gray-500 cursor-not-allowed opacity-70' 
            : 'bg-blue-500 border-blue-700 hover:bg-blue-400 active:border-b-0 active:translate-y-1 transition-all'
        }`}
      >
        <Undo2 size={20} className="sm:w-6 sm:h-6" />
        Undo
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        aria-label="Reset game board"
        className="flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white font-bold text-lg sm:text-xl shadow-lg border-b-4 bg-orange-500 border-orange-700 hover:bg-orange-400 active:border-b-0 active:translate-y-1 transition-all"
      >
        <RotateCcw size={20} className="sm:w-6 sm:h-6" />
        Reset
      </motion.button>

      {toggleMentor && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHelp}
          aria-label="Ask Mentor for Help"
          className="flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white font-bold text-lg sm:text-xl shadow-lg border-b-4 bg-teal-500 border-teal-700 hover:bg-teal-400 active:border-b-0 active:translate-y-1 transition-all"
        >
          <HelpCircle size={20} className="sm:w-6 sm:h-6" />
          Help?
        </motion.button>
      )}
    </div>
  );
};

