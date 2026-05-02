/**
 * components/TacticsTrainer.tsx
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChessBoard } from '@/components/ChessBoard';
import { GameEngine } from '@/lib/chessEngine';
import { TacticPuzzle, getNextPuzzle } from '@/lib/tacticsEngine';
import { ChevronLeft, Zap, Target } from 'lucide-react';
import { Square } from 'chess.js';

export const TacticsTrainer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [engine] = useState(() => new GameEngine());
  const [puzzle, setPuzzle] = useState<TacticPuzzle | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [feedback, setFeedback] = useState("Find the best move!");
  const [streak, setStreak] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<any[]>([]);
  const [sync, setSync] = useState(0);

  useEffect(() => {
    const nextP = getNextPuzzle(1000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPuzzle(nextP);
    if (typeof engine.game.load === 'function') {
       engine.game.load(nextP.fen);
       setSync(s => s + 1);
    }
  }, [engine]);

  const handleSelectSquare = (square: string | null) => {
    setSelectedSquare(square);
    if (square) {
      setLegalMoves(engine.game.moves({ square: square as Square, verbose: true }));
    } else {
      setLegalMoves([]);
    }
  };

  const handleMove = (from: string, to: string) => {
    if (!puzzle) return;
    const moveStr = `${from}${to}`;
    const expectedMove = puzzle.moves[moveIndex];

    if (moveStr === expectedMove) {
      engine.game.move({ from, to, promotion: 'q' });
      setSync(s => s + 1);
      setSelectedSquare(null);
      setLegalMoves([]);
      
      if (moveIndex + 1 >= puzzle.moves.length) {
        setFeedback("BRILLIANT! " + puzzle.explanation);
        setStreak(s => s + 1);
        setTimeout(() => {
          const nextP = getNextPuzzle(1000);
          setPuzzle(nextP);
          if (typeof engine.game.load === 'function') {
             engine.game.load(nextP.fen);
          }
          setMoveIndex(0);
          setFeedback("Find the best move!");
          setSync(s => s + 1);
        }, 3000);
      } else {
        setMoveIndex(moveIndex + 1);
        // Opponent's automatic response
        setTimeout(() => {
          const oppMove = puzzle.moves[moveIndex + 1];
          engine.makeMoveString(oppMove);
          setMoveIndex(moveIndex + 2);
          setSync(s => s + 1);
        }, 500);
      }
    } else {
      setFeedback("Not quite! Try again! 💪");
      setStreak(0);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2937] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#374151] rounded-3xl p-6 shadow-2xl border-4 border-gray-600 flex flex-col md:flex-row gap-8">
        
        {/* Left Side Info */}
        <div className="w-full md:w-1/3 flex flex-col justify-between">
           <div>
             <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white mb-8 font-bold transition">
               <ChevronLeft /> Back to Dashboard
             </button>
             <h1 className="text-3xl font-black text-white flex items-center gap-2 mb-2">
               <Zap className="text-yellow-400" /> Tactics
             </h1>
             <p className="text-gray-400 mb-6">Theme: <span className="text-white font-bold capitalize">{puzzle?.theme}</span></p>
             
             <div className="bg-gray-800 p-4 rounded-xl border border-gray-600 mb-6">
                <p className="text-gray-300 text-sm">Current Streak</p>
                <div className="text-3xl font-black text-white flex items-center gap-2">
                   {streak} <span className="text-orange-500">🔥</span>
                </div>
             </div>
           </div>

           <div className={`p-4 rounded-xl font-bold border-2 ${feedback.includes('BRILLIANT') ? 'bg-green-500/20 text-green-400 border-green-500/50' : feedback.includes('Not quite') ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
              {feedback}
           </div>
        </div>

        {/* Right Side Board */}
        <div className="w-full max-w-md shadow-2xl rounded-lg overflow-hidden relative">
          <ChessBoard 
             board={engine.game.board()} 
             onMove={(source, target) => handleMove(source as string, target as string)} 
             legalMoves={legalMoves} 
             onSelectSquare={(s) => handleSelectSquare(s as string)} 
             selectedSquare={selectedSquare as any} 
             lastMove={null} 
             inCheck={engine.isCheck()} 
             kingSquare={null} 
          />
        </div>

      </div>
    </div>
  );
};
