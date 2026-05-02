/**
 * components/GameAnalysis.tsx
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeGame, GameAnalysisReport, AnalyzedMove } from '@/lib/gameAnalyzer';
import { ChevronLeft, ChevronRight, Play, AlertTriangle, Star, CheckCircle, Zap } from 'lucide-react';
import { ChessBoard } from '@/components/ChessBoard';
import { GameEngine } from '@/lib/chessEngine';
import { useSound } from '@/hooks/useSound';

type GameAnalysisProps = {
  pgn: string;
  onBack: () => void;
};

export const GameAnalysis: React.FC<GameAnalysisProps> = ({ pgn, onBack }) => {
  const [report, setReport] = useState<GameAnalysisReport | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [engine] = useState(() => new GameEngine());
  const { playClick, playCheckmate } = useSound();

  useEffect(() => {
    const analysis = analyzeGame(pgn);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReport(analysis);
    if (analysis.moves.length > 0) {
      if (typeof engine.game.load === 'function') {
         engine.game.load(analysis.moves[0].fenBefore);
      }
    }
    // playCheckmate(); // optional sound for entering review
  }, [pgn, engine]);

  if (!report) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Analyzing game...</div>;
  }

  const currentMove = currentMoveIndex >= 0 ? report.moves[currentMoveIndex] : null;

  const handleNext = () => {
    if (currentMoveIndex < report.moves.length - 1) {
      playClick();
      const nextIdx = currentMoveIndex + 1;
      setCurrentMoveIndex(nextIdx);
      if (typeof engine.game.load === 'function') {
         engine.game.load(report.moves[nextIdx].fenAfter);
      }
    }
  };

  const handlePrev = () => {
    if (currentMoveIndex >= 0) {
      playClick();
      const prevIdx = currentMoveIndex - 1;
      setCurrentMoveIndex(prevIdx);
      if (prevIdx >= 0) {
        if (typeof engine.game.load === 'function') {
           engine.game.load(report.moves[prevIdx].fenAfter);
        }
      } else {
        if (typeof engine.game.load === 'function') {
           engine.game.load(report.moves[0].fenBefore); // start
        }
      }
    }
  };

  const jumpToMove = (index: number) => {
    playClick();
    setCurrentMoveIndex(index);
    if (typeof engine.game.load === 'function') {
       engine.game.load(report.moves[index].fenAfter);
    }
  };

  const getBadgeClass = (classification: string) => {
    switch (classification) {
      case 'great': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'good': return 'bg-green-100 text-green-700 border-green-300';
      case 'inaccuracy': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'mistake': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'blunder': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4 md:p-6 overflow-hidden flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white font-bold transition">
          <ChevronLeft /> Back
        </button>
        <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Game Analysis
        </h1>
        <div className="w-20"></div>
      </div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">
        
        {/* Left Column - Board & Controls */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="shadow-2xl rounded-lg overflow-hidden border-4 border-slate-700 bg-slate-800">
             <ChessBoard 
                board={engine.game.board()}
                inCheck={engine.isCheck()}
                kingSquare={null}
                lastMove={currentMove ? { from: currentMove.from, to: currentMove.to } : null}
                legalMoves={[]}
                onMove={() => {}}
                onSelectSquare={() => {}}
                selectedSquare={null}
             />
             {/* Invisible overlay to prevent clicking */}
             <div className="absolute inset-0 pointer-events-none" />
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 shadow-lg">
            <button 
              onClick={handlePrev} 
              disabled={currentMoveIndex < 0}
              className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-white disabled:opacity-50 transition"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="text-white font-bold text-lg">
               {currentMove ? `${currentMove.moveNumber}. ${currentMove.color === 'w' ? 'White' : 'Black'}: ${currentMove.san}` : "Start Position"}
            </div>

            <button 
              onClick={handleNext} 
              disabled={currentMoveIndex >= report.moves.length - 1}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:opacity-50 transition shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Right Column - Report & Timeline */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Summary Dashboard */}
          <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 shadow-lg mb-2">
            <h2 className="text-white font-black text-xl mb-4 flex items-center gap-2">
               <Star className="text-yellow-400" /> Match Report
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-900/50 p-3 rounded-2xl flex flex-col items-center border border-blue-500/30">
                <span className="text-blue-400 text-2xl font-black">{report.greatMoves}</span>
                <span className="text-slate-400 text-xs font-bold uppercase mt-1">Great</span>
              </div>
              <div className="bg-orange-900/50 p-3 rounded-2xl flex flex-col items-center border border-orange-500/30">
                <span className="text-orange-400 text-2xl font-black">{report.mistakes}</span>
                <span className="text-slate-400 text-xs font-bold uppercase mt-1">Mistakes</span>
              </div>
              <div className="bg-red-900/50 p-3 rounded-2xl flex flex-col items-center border border-red-500/30">
                <span className="text-red-400 text-2xl font-black">{report.blunders}</span>
                <span className="text-slate-400 text-xs font-bold uppercase mt-1">Blunders</span>
              </div>
            </div>

            {report.turningPoint && (
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 cursor-pointer hover:bg-slate-700 transition" onClick={() => jumpToMove(report.moves.indexOf(report.turningPoint!))}>
                 <h3 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-1"><AlertTriangle size={14}/> Turning Point</h3>
                 <p className="text-slate-300 text-sm">Move {report.turningPoint.moveNumber}: {report.turningPoint.san}</p>
                 <p className="text-slate-400 text-xs mt-1 italic">{report.turningPoint.comment}</p>
              </div>
            )}
          </div>

          {/* Move History / Timeline */}
          <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 flex-1 min-h-[300px]">
            <h2 className="text-white font-black text-xl mb-4 flex items-center gap-2">
               <Zap className="text-emerald-400" /> Timeline
            </h2>
            <div className="flex flex-col gap-2">
               {report.moves.map((move, idx) => (
                 <motion.button
                   key={idx}
                   whileHover={{ scale: 1.02, x: 5 }}
                   onClick={() => jumpToMove(idx)}
                   className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${currentMoveIndex === idx ? 'bg-slate-600 border-slate-400 shadow-md' : 'bg-slate-700/30 border-transparent hover:bg-slate-700/80'}`}
                 >
                   <div className="bg-slate-900 text-slate-400 text-xs font-bold rounded-lg px-2 py-1 min-w-[40px] text-center">
                     {move.moveNumber}{move.color === 'w' ? '.' : '...'}
                   </div>
                   <div className="font-bold text-white w-12">{move.san}</div>
                   <div className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getBadgeClass(move.classification)}`}>
                      {move.classification}
                   </div>
                   {currentMoveIndex === idx && (
                     <motion.div layoutId="activeMove" className="ml-auto">
                        <Play size={14} className="text-emerald-400" fill="currentColor" />
                     </motion.div>
                   )}
                 </motion.button>
               ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
