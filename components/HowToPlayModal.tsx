import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

type HowToPlayModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TUTORIAL_PAGES = [
  {
    title: "Welcome to CUZO! 🌟",
    content: "Chess is a fun game of strategy! You control the white pieces, and your goal is to trap the opponent's King (Checkmate!) while protecting your own.",
    icon: "🏰"
  },
  {
    title: "How to Move 👆",
    content: "1. Click on a piece you want to move.\n2. Look for the glowing dots – these show where the piece can safely move.\n3. Click on a dot to move there!",
    icon: "✨"
  },
  {
    title: "The Pieces 🐴",
    content: "♟️ Pawns move forward.\n♜ Rooks move straight.\n♝ Bishops move diagonally.\n♞ Knights jump in an 'L' shape.\n♛ Queens can move any direction.\n♚ Kings move one step in any direction.",
    icon: "👑"
  },
  {
    title: "Need Help? 🧙‍♂️",
    content: "If you get stuck, click the 'Help?' button or wait for your friend Chessy to give you a hint. Remember, it's okay to make mistakes – that's how we learn!",
    icon: "💡"
  }
];

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [page, setPage] = useState(0);
  const { playClick } = useSound();

  if (!isOpen) return null;

  const next = () => {
    playClick();
    if (page < TUTORIAL_PAGES.length - 1) setPage(page + 1);
  };
  
  const prev = () => {
    playClick();
    if (page > 0) setPage(page - 1);
  };

  const close = () => {
    playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full flex flex-col items-center border-8 border-blue-400"
      >
        <button 
          onClick={close}
          className="absolute top-4 right-4 bg-gray-200 hover:bg-red-400 hover:text-white transition-colors p-2 rounded-full font-bold text-gray-500"
        >
          <X size={24} />
        </button>

        <div className="text-6xl mb-4 drop-shadow-md">
          {TUTORIAL_PAGES[page].icon}
        </div>
        
        <h2 className="text-3xl font-black text-blue-600 mb-4 text-center">
          {TUTORIAL_PAGES[page].title}
        </h2>
        
        <div className="text-xl text-gray-700 font-medium whitespace-pre-line text-center min-h-[140px] flex items-center justify-center">
          {TUTORIAL_PAGES[page].content}
        </div>

        <div className="flex items-center justify-between w-full mt-8">
          <button 
            onClick={prev}
            disabled={page === 0}
            className={`p-3 rounded-full ${page === 0 ? 'opacity-0 pointer-events-none' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`}
          >
            <ChevronLeft size={32} />
          </button>
          
          <div className="flex gap-2">
            {TUTORIAL_PAGES.map((_, i) => (
              <div key={i} className={`h-3 rounded-full transition-all ${i === page ? 'w-8 bg-blue-500' : 'w-3 bg-blue-200'}`} />
            ))}
          </div>

          <button 
            onClick={next}
            disabled={page === TUTORIAL_PAGES.length - 1}
            className={`p-3 rounded-full ${page === TUTORIAL_PAGES.length - 1 ? 'opacity-0 pointer-events-none' : 'bg-blue-500 hover:bg-blue-400 text-white shadow-md'}`}
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {page === TUTORIAL_PAGES.length - 1 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={close}
            className="mt-6 w-full py-4 bg-green-500 hover:bg-green-400 text-white text-2xl font-black rounded-full shadow-lg border-b-6 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            GOT IT! 👍
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};
