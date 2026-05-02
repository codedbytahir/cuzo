import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb, BookOpen, AlertTriangle, Target, Search } from 'lucide-react';
import { GameEngine } from '@/lib/chessEngine';
import { askMentor } from '@/lib/aiMentor';
import { MentorMessageType, MentorContext } from '@/types/mentor';
import { getConceptsLearned } from '@/lib/mentorKnowledge';
import { useSound } from '@/hooks/useSound';

type AIMentorProps = {
  isOpen: boolean;
  onClose: () => void;
  engine: GameEngine;
  worldId?: number;
  worldName?: string;
  levelName?: string;
  playerSkillLevel?: number;
  customMessage?: string | null;
  onClearCustomMessage?: () => void;
  lastMove?: { from: string; to: string } | null;
};

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(prev => text.slice(0, prev.length + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
      }
    }, 30); // Typing speed
    
    return () => {
      clearInterval(intervalId);
      setDisplayedText('');
    };
  }, [text]);

  return <span>{displayedText}</span>;
};

export const AIMentor: React.FC<AIMentorProps> = ({ 
  isOpen, 
  onClose, 
  engine, 
  worldId = 1,
  worldName = 'The Pawn Kingdom',
  levelName = 'Free Play',
  playerSkillLevel = 1,
  customMessage, 
  onClearCustomMessage,
  lastMove
}) => {
  const [message, setMessage] = useState("Hi! I'm Chessy! I'm here to help you learn and play! 🧙‍♂️");
  const [isThinking, setIsThinking] = useState(false);
  const { playClick } = useSound();

  useEffect(() => {
    if (customMessage && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage(customMessage);
    }
  }, [customMessage, isOpen]);

  const handleAction = useCallback(async (type: MentorMessageType, customQ?: string) => {
    playClick();
    if (onClearCustomMessage) onClearCustomMessage();
    
    setIsThinking(true);
    setMessage("Let me think about that... 🤔");
    
    const context: MentorContext = {
      fen: engine.fen(),
      playerColor: 'w', // Assuming player is always white currently
      lastMove,
      worldId,
      worldName,
      levelName,
      playerSkillLevel,
      conceptsLearned: getConceptsLearned(worldId),
      commonMistakes: [] // To be implemented with user profile
    };

    const reply = await askMentor(type, context, customQ);
    setMessage(reply);
    setIsThinking(false);
  }, [engine, lastMove, worldId, worldName, levelName, playerSkillLevel, playClick, onClearCustomMessage]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="fixed bottom-0 left-0 right-0 sm:bottom-8 sm:left-auto sm:right-8 sm:w-80 md:w-96 z-50 rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl bg-gradient-to-b from-purple-100 to-purple-200 sm:border-4 border-purple-400 overflow-hidden flex flex-col max-h-[70vh] sm:max-h-none"
      >
        {/* Header */}
        <div className="bg-purple-500 text-white p-3 flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isThinking ? { y: [-2, 2, -2], rotate: [-10, 10, -10] } : { y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: isThinking ? 0.5 : 2 }}
              className="text-3xl drop-shadow-md"
            >
              🧙‍♂️
            </motion.div>
            <span className="font-extrabold text-xl tracking-wide">Chessy</span>
          </div>
          <button 
            onClick={() => { playClick(); onClose(); if (onClearCustomMessage) onClearCustomMessage(); }}
            className="p-1 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Bubble */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-purple-900 font-bold text-sm sm:text-base leading-snug border-2 border-purple-100 min-h-[80px]">
            {isThinking ? (
              <span className="flex items-center gap-1">
                Let me think about that
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.4 }}>.</motion.span>
                🤔
              </span>
            ) : (
              <TypewriterText text={message} />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-purple-50 p-2 sm:p-3 flex flex-col gap-2 border-t-2 border-purple-200">
          <button
            disabled={isThinking}
            onClick={() => handleAction('hint')}
            className="w-full flex items-center justify-start gap-3 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 py-2 px-3 rounded-xl font-bold text-sm shadow-sm border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lightbulb size={18} /> What&apos;s the best move?
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isThinking}
              onClick={() => handleAction('threat')}
              className="flex items-center justify-center gap-2 bg-red-400 hover:bg-red-300 text-red-900 py-2 px-2 rounded-xl font-bold text-xs shadow-sm border-b-4 border-red-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle size={16} /> Threats?
            </button>
            <button
              disabled={isThinking}
              onClick={() => handleAction('tactic')}
              className="flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-300 text-orange-900 py-2 px-2 rounded-xl font-bold text-xs shadow-sm border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Target size={16} /> Tactics!
            </button>
            <button
              disabled={isThinking}
              onClick={() => handleAction('teach')}
              className="flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-300 text-blue-900 py-2 px-2 rounded-xl font-bold text-xs shadow-sm border-b-4 border-blue-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BookOpen size={16} /> Teach me
            </button>
            <button
              disabled={isThinking || !lastMove}
              onClick={() => handleAction('analyze')}
              className={`flex items-center justify-center gap-2 py-2 px-2 rounded-xl font-bold text-xs shadow-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                !lastMove 
                  ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-70' 
                  : 'bg-green-400 hover:bg-green-300 text-green-900 border-green-600'
              }`}
            >
              <Search size={16} /> My last move?
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

