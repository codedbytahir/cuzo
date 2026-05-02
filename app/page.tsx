"use client";

/**
 * app/page.tsx
 * 
 * Main game screen.
 * Handles the game state, AI turns, and orchestrates the child components.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '@/lib/chessEngine';
import { ChessBoard } from '@/components/ChessBoard';
import { GameControls } from '@/components/GameControls';
import { SplashScreen } from '@/components/SplashScreen';
import { MainMenu } from '@/components/MainMenu';
import { LevelSelect } from '@/components/LevelSelect';
import { WorldMap } from '@/components/WorldMap';
import { LevelIntro } from '@/components/LevelIntro';
import { LessonOverlay } from '@/components/LessonOverlay';
import { LevelComplete } from '@/components/LevelComplete';
import { AIMentor } from '@/components/AIMentor';
import { Confetti } from '@/components/Confetti';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { ProfileSetup } from '@/components/ProfileSetup';
import { Dashboard } from '@/components/Dashboard';
import { TacticsTrainer } from '@/components/TacticsTrainer';
import { GameAnalysis } from '@/components/GameAnalysis';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LEVELS, WORLDS } from '@/lib/curriculum';
import { getMistakeMessage, getPraiseMessage, getStuckMessage, getHint } from '@/lib/mentorPrompts';
import { Square, Move } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import { useSound } from '@/hooks/useSound';
import { getAIMove } from '@/lib/aiOpponent';
import { DifficultyLevel } from '@/types/opponent';
import { CONSTANTS } from '@/config/constants';
import { updateGameStats, saveLevelProgress } from '@/lib/userData';

const ScreenWrapper = ({ children, screenKey }: { children: React.ReactNode, screenKey: string }) => (
  <motion.div
    key={screenKey}
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    className="absolute inset-0 overflow-y-auto overflow-x-hidden min-h-[100dvh]"
  >
    {children}
  </motion.div>
);

export default function App() {
  const { userData, isLoading, hasProfile, createProfile } = useUserProfile();

  const [screen, setScreen] = useState<'splash' | 'profileSetup' | 'dashboard' | 'menu' | 'worldMap' | 'levelSelect' | 'levelIntro' | 'game' | 'levelComplete' | 'tactics' | 'analysis'>('splash');
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [lastGamePgn, setLastGamePgn] = useState<string | null>(null);

  const handleWorldSelect = (id: number) => {
    setCurrentWorldId(id);
    setScreen('levelSelect');
  };
  const [completedLevels, setCompletedLevels] = useState<Record<number, number>>({});
  const [earnedStars, setEarnedStars] = useState(0);
  const [currentAiSummary, setCurrentAiSummary] = useState<any>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const { playClick, playCheckmate } = useSound();

  useEffect(() => {
    const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.PROGRESS);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompletedLevels(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleLevelSelect = (id: number) => {
    setCurrentLevelId(id);
    setScreen('levelIntro');
  };

  const handleLevelComplete = (stars: number, aiSummary?: any, pgn?: string) => {
    // If player won (or lesson complete), stats update
    const playerWon = stars > 1; // Assuming 0 or 1 star might be a loss/poor performance, but we sent 3 for checkmate, 1 for being checkmated in game.
    updateGameStats(playerWon, false);

    if (currentLevelId) {
       const newCompleted = { ...completedLevels, [currentLevelId]: Math.max(stars, completedLevels[currentLevelId] || 0) };
       setCompletedLevels(newCompleted);
       localStorage.setItem(CONSTANTS.STORAGE_KEYS.PROGRESS, JSON.stringify(newCompleted));
       
       saveLevelProgress(currentLevelId, stars, 0, aiSummary?.mistakes || 0);
    }
    setEarnedStars(stars);
    setCurrentAiSummary(aiSummary || null);
    if (pgn) setLastGamePgn(pgn);
    setScreen('levelComplete');
    // Trigger confetti on level complete
    setConfettiTrigger(c => c + 1);
  };

  const renderScreen = () => {
    if (screen === 'splash') {
      return (
        <ScreenWrapper screenKey="splash">
          <SplashScreen onComplete={() => setScreen((hasProfile && !isLoading) ? 'menu' : 'profileSetup')} />
        </ScreenWrapper>
      );
    }
    if (screen === 'profileSetup') {
      return (
        <ScreenWrapper screenKey="profileSetup">
          <ProfileSetup 
            onComplete={(name, avatar, age) => {
              createProfile(name, avatar, age);
              setScreen('worldMap');
            }} 
          />
        </ScreenWrapper>
      );
    }
    if (screen === 'menu') {
      return (
        <ScreenWrapper screenKey="menu">
          <MainMenu 
            onStart={() => setScreen('worldMap')} 
            onHowToPlay={() => setShowHowToPlay(true)} 
            onTactics={() => setScreen('tactics')}
          />
          {userData && (
            <div className="absolute top-4 right-4 z-50">
               <button 
                 onClick={() => { playClick(); setScreen('dashboard'); }}
                 className="flex items-center gap-2 bg-white/80 hover:bg-white p-2 pr-4 rounded-full shadow-md font-bold text-indigo-900 border-2 border-indigo-200 transition-colors"
               >
                 <span className="text-2xl">{userData.profile.avatar}</span>
                 {userData.profile.displayName}
               </button>
            </div>
          )}
        </ScreenWrapper>
      );
    }
    if (screen === 'tactics') {
      return (
        <ScreenWrapper screenKey="tactics">
          <TacticsTrainer onBack={() => setScreen('menu')} />
        </ScreenWrapper>
      );
    }
    if (screen === 'analysis' && lastGamePgn) {
       return (
         <ScreenWrapper screenKey="analysis">
           <GameAnalysis pgn={lastGamePgn} onBack={() => setScreen('levelComplete')} />
         </ScreenWrapper>
       );
    }
    if (screen === 'dashboard' && userData) {
       return (
        <ScreenWrapper screenKey="dashboard">
          <Dashboard userData={userData} onBack={() => setScreen('menu')} />
        </ScreenWrapper>
       );
    }
    if (screen === 'worldMap') {
      return (
        <ScreenWrapper screenKey="worldMap">
          <WorldMap
            onWorldSelect={handleWorldSelect}
            onBack={() => setScreen('menu')}
            completedLevels={completedLevels}
          />
        </ScreenWrapper>
      );
    }
    if (screen === 'levelSelect' && currentWorldId) {
      return (
        <ScreenWrapper screenKey="levelSelect">
          <LevelSelect 
            worldId={currentWorldId}
            onLevelSelect={handleLevelSelect} 
            onBack={() => setScreen('worldMap')} 
            completedLevels={completedLevels} 
          />
        </ScreenWrapper>
      );
    }
    if (screen === 'levelIntro' && currentLevelId) {
      const level = LEVELS.find(l => l.id === currentLevelId)!;
      return (
        <ScreenWrapper screenKey="levelIntro">
          <LevelIntro 
            level={level} 
            onComplete={() => setScreen('game')} 
          />
        </ScreenWrapper>
      );
    }
    if (screen === 'levelComplete') {
      return (
        <ScreenWrapper screenKey="levelComplete">
          <LevelComplete 
            stars={earnedStars}
            aiSummary={currentAiSummary}
            onNext={() => {
              playClick();
              const nextId = (currentLevelId || 1) + 1;
              if (nextId <= LEVELS.length) {
                 const nextLevel = LEVELS.find(l => l.id === nextId);
                 if (nextLevel) {
                   setCurrentWorldId(nextLevel.worldId);
                 }
                 setCurrentLevelId(nextId);
                 setScreen('levelIntro');
              } else {
                 setScreen('worldMap');
              }
            }}
            onMenu={() => {
              playClick();
              if (currentLevelId) {
                 const lvl = LEVELS.find(l => l.id === currentLevelId);
                 if (lvl) setCurrentWorldId(lvl.worldId);
              }
              setScreen('levelSelect');
            }}
            isLastLevel={(currentLevelId || 1) >= LEVELS.length}
          />
        </ScreenWrapper>
      );
    }

    return (
      <ScreenWrapper screenKey="game">
        <GameScreen 
          levelId={currentLevelId}
          onLevelComplete={handleLevelComplete}
          onCheckmate={() => setConfettiTrigger(c => c + 1)}
          onBack={() => {
            playClick();
            setScreen('levelSelect');
          }} 
        />
      </ScreenWrapper>
    );
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-gradient-to-br from-[#FFF8E7] to-[#FFE4C4] overflow-hidden">
      <Confetti trigger={confettiTrigger} />
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}

function GameScreen({ onBack, levelId, onLevelComplete, onCheckmate }: { onBack: () => void, levelId?: number | null, onLevelComplete?: (stars: number, aiSummary?: any, pgn?: string) => void, onCheckmate?: () => void }) {
  // Use state to persist the game logic without re-instantiating on every render
  // and without triggering ESLint ref rules during render.
  const level = levelId ? LEVELS.find(l => l.id === levelId) : null;
  const isLessonMode = !!level;
  
  const [engine] = useState(() => {
    const g = new GameEngine();
    if (level && level.steps[0]) {
      try { g.game.load(level.steps[0].fen); } catch(e){}
    }
    return g;
  });
  
  const { playCapture, playCheck, playCheckmate, playIllegal, playQueen, playClick } = useSound();

  // Lesson State
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = level ? level.steps[stepIndex] : null;
  const [hintVisible, setHintVisible] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // AI Opponent State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    const savedDiff = localStorage.getItem(CONSTANTS.STORAGE_KEYS.DIFFICULTY) as DifficultyLevel;
    if (savedDiff) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDifficulty(savedDiff);
    }
  }, []);

  // Stats
  const [startTime] = useState(() => Date.now());
  const [playTime, setPlayTime] = useState(0);

  // React state to drive UI updates
  const [fen, setFen] = useState(engine.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string, to: string } | null>(null);

  // Mentor State
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [mentorCustomMessage, setMentorCustomMessage] = useState<string | null>(null);
  const stuckTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showMentorMessage = useCallback((msg: string) => {
      setMentorCustomMessage(msg);
      setIsMentorOpen(true);
  }, []);

  useEffect(() => {
    const handleFallback = () => {
      showMentorMessage("AI is being silly! Making a quick move instead 😄");
    };
    window.addEventListener('cuzo-ai-fallback', handleFallback);
    return () => window.removeEventListener('cuzo-ai-fallback', handleFallback);
  }, [showMentorMessage]);

  // We play as White.
  const isPlayerTurn = engine.turn() === 'w';
  const isGameOver = engine.isGameOver() && !isLessonMode;
  const inCheck = engine.isCheck();
  const checkmate = engine.isCheckmate();
  const draw = engine.isDraw();

  useEffect(() => {
    if (isGameOver) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayTime(Math.floor((Date.now() - startTime) / 1000));
    }
  }, [isGameOver, startTime]);

  // Find the king's square if in check
  const getKingSquare = (): Square | null => {
    if (!inCheck) return null;
    const board = engine.getBoard();
    const turnColor = engine.turn();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece && piece.type === 'k' && piece.color === turnColor) {
           return piece.square;
        }
      }
    }
    return null;
  };

  // Sync state from engine to React
  const syncState = useCallback((moveDetails?: { from: string, to: string }) => {
    setFen(engine.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    if (moveDetails) {
       setLastMove(moveDetails);
    } else {
       setLastMove(null);
    }
  }, [engine]);

  // Load new step FEN when step changes
  useEffect(() => {
    if (isLessonMode && currentStep) {
      try {
        engine.game.load(currentStep.fen);
      } catch(e){}
      // eslint-disable-next-line react-hooks/set-state-in-effect
      syncState();
       
      setHintVisible(false);
    }
  }, [stepIndex, isLessonMode, currentStep, engine, syncState]);

  const getSummary = useCallback((playerWon: boolean) => {
    // Generate simple pseudo-random analysis
    const historyLen = engine.game.history().length;
    return {
      goodMoves: Math.max(5, Math.floor(historyLen / 2) - mistakes),
      mistakes: mistakes + (playerWon ? 0 : 2),
      bestMove: playerWon ? engine.game.history()[Math.max(0, historyLen - 2)] : 'Castling early',
      improvement: playerWon ? 'Keep controlling the center' : 'Watch out for sneaky knights',
      skill: difficulty === 'easy' ? 'Beginner 🛡️' : difficulty === 'medium' ? 'Rising Star ⭐' : 'Master 👑'
    };
  }, [engine.game, mistakes, difficulty]);

  // AI Turn Logic
  useEffect(() => {
    if (isLessonMode) return; // No AI turns in lesson mode

    if (!isPlayerTurn && !isGameOver && !isAIThinking) {
      const takeAITurn = async () => {
        setIsAIThinking(true);
        try {
          // Small delay before AI moves to feel more natural
          await new Promise(r => setTimeout(r, 600));
          
          const fenStr = engine.fen();
          const moveStr = await getAIMove(fenStr, difficulty);
          
          if (!moveStr) {
            setIsAIThinking(false);
            return;
          }

          const targetSquare = moveStr.substring(2, 4) as Square;
          const pieceAtTarget = engine.game.get(targetSquare);
          
          const move = engine.makeMoveString(moveStr); 
          
          if (move) {
            if (engine.isCheckmate()) {
              playCheckmate();
              if (onCheckmate) onCheckmate(); // Trigger checkmate animation
              setTimeout(() => {
                onLevelComplete?.(1, getSummary(false), engine.game.pgn());
              }, 2000);
            } else if (engine.isCheck()) {
              playCheck();
              if (!isLessonMode) {
                 showMentorMessage(getHint(engine));
              }
            } else if (pieceAtTarget) {
              playCapture();
            }
            syncState({ from: move.from, to: move.to });
          }
        } catch (e) {
          console.error("Error during AI turn:", e);
        } finally {
          setIsAIThinking(false);
        }
      };

      takeAITurn();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn, isGameOver, isAIThinking, difficulty, engine, syncState, getSummary]);

  const resetStuckTimer = useCallback(() => {
     if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
     if (!isLessonMode && isPlayerTurn && !isGameOver) {
         stuckTimerRef.current = setTimeout(() => {
             showMentorMessage(getStuckMessage());
         }, 10000);
     }
  }, [isLessonMode, isPlayerTurn, isGameOver, showMentorMessage]);

  useEffect(() => {
      resetStuckTimer();
      return () => { if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current); };
  }, [resetStuckTimer]);

  // Handle player selecting a square
  const handleSelectSquare = (square: Square | null) => {
    if (!isPlayerTurn || isGameOver) return; // Prevent selection if not player's turn or game over
    
    setSelectedSquare(square);
    setHintVisible(false); // hide hint if they click somewhere else
    
    if (square) {
      let moves = engine.getLegalMoves(square);
      
      if (isLessonMode && currentStep) {
          const expected = currentStep.expectedMove;
          if (expected && square !== expected.from && square !== currentStep.highlightSquare) {
             const highlight = currentStep.highlightSquare || expected.from;
             showMentorMessage(`Try this one instead: the piece on ${highlight}!`);
             moves = []; // don't show legal moves for wrong piece
          } else if (expected && square === expected.from) {
             // Only show the target square if they selected the correct piece
             moves = moves.filter(m => m.to === expected.to);
          }
      }
      
      setLegalMoves(moves);
    } else {
      setLegalMoves([]);
    }
  };

  // Handle player making a move
  const handleMove = (source: Square, target: Square) => {
    resetStuckTimer();
    const pieceAtTarget = engine.game.get(target);

    // Filter move logic in lesson mode
    if (isLessonMode && currentStep) {
      const expected = currentStep.expectedMove;
      if (source !== expected.from || target !== expected.to) {
        playIllegal();
        setMistakes(m => m + 1);
        setHintVisible(true);
        setSelectedSquare(null);
        setLegalMoves([]);
        showMentorMessage(currentStep.hint || getMistakeMessage());
        return;
      }
      
      // Correct move!
      showMentorMessage(getPraiseMessage());
      const moveOpts = { from: source, to: target, promotion: 'q' };
      engine.game.move(moveOpts);
      syncState({ from: source, to: target });

      if (pieceAtTarget) playCapture();
      else playCheck(); // Just an alert sound

      // Wait a bit, then advance
      setTimeout(() => {
        if (stepIndex < level!.steps.length - 1) {
           const nextStep = level!.steps[stepIndex + 1];
           if (nextStep.fen) {
              engine.game.load(nextStep.fen);
              syncState(); 
           }
           setStepIndex(stepIndex + 1);
        } else {
           // Complete level! Calculate stars.
           const stars = mistakes === 0 ? 3 : (mistakes <= 2 ? 2 : 1);
           onLevelComplete?.(stars);
        }
      }, 1000);

      return;
    }

    // STANDARD Move logic
    const success = engine.move(source, target);

    if (success) {
      if (pieceAtTarget) { // great move
         if (Math.random() > 0.5) showMentorMessage(getPraiseMessage());
      }
      
      if (engine.isCheckmate()) {
        playCheckmate();
        if (onCheckmate) onCheckmate(); // Trigger checkmate animation
        setTimeout(() => {
          onLevelComplete?.(3, getSummary(true), engine.game.pgn());
        }, 2000);
      } else if (engine.isCheck()) {
        playCheck();
      } else if (pieceAtTarget) {
        playCapture();
      }
      
      syncState({ from: source, to: target });
    } else {
      // Invalid move, deselect
      playIllegal();
      showMentorMessage(getMistakeMessage());
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleUndo = () => {
    // If it's the AI's turn, we might only want to undo once.
    // If it's our turn, we want to undo the AI's move AND our last move.
    engine.undo();
    if (engine.turn() === 'b') {
        engine.undo(); // Undo white's move too to get back to white's turn
    }
    syncState();
  };

  const handleReset = () => {
    engine.reset();
    syncState();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] to-[#FFE4C4] flex flex-col items-center py-4 sm:py-10 px-2 sm:px-4">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-8 shrink-0"
      >
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#8B5A2B] tracking-tight drop-shadow-md">
          CUZO
        </h1>
        <p className="text-lg sm:text-xl text-[#B58863] font-bold mt-1 sm:mt-2">Kids&apos; Chess Adventure!</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-12 w-full max-w-6xl">
        
        {/* Left Column (Board & Status) */}
        <div className="flex flex-col items-center w-full lg:w-auto flex-1 max-w-[95dvw] sm:max-w-lg">
          {/* Status Bar */}
          <div className="w-full flex justify-between items-center mb-2 sm:mb-4 px-2">
            <div className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-sm sm:text-lg shadow-sm border-2 ${isPlayerTurn ? 'bg-white text-blue-500 border-blue-200' : 'bg-gray-200 text-gray-600 border-transparent'} transition-colors`}>
              👩‍🚀 Your Turn
            </div>
            <div className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-sm sm:text-lg shadow-sm border-2 ${!isPlayerTurn ? 'bg-[#2A2A2A] text-white border-gray-600' : 'bg-gray-200 text-gray-500 border-transparent'} transition-colors flex items-center gap-1`}>
              {isAIThinking ? (
                <>
                  🤖 Robot is thinking
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.2 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.4 }}>.</motion.span>
                </>
              ) : (
                <>🤖 Robot&apos;s Turn <span className="text-xs sm:text-sm ml-1 opacity-80">({difficulty === 'easy' ? 'Novice 🛡️' : difficulty === 'medium' ? 'Warrior ⚔️' : 'Master 👑'})</span></>
              )}
            </div>
          </div>

          {/* Main Board Area */}
          <motion.div 
            animate={checkmate ? { x: [-15, 15, -15, 15, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative w-full flex flex-col justify-center items-center"
          >
        {isLessonMode && currentStep && (
          <LessonOverlay 
             step={currentStep} 
             stepNumber={stepIndex + 1} 
             totalSteps={level!.steps.length} 
             hintVisible={hintVisible} 
             onSkip={() => {
                playClick();
                if (stepIndex < level!.steps.length - 1) {
                  const nextStep = level!.steps[stepIndex + 1];
                  if (nextStep.fen) {
                    engine.game.load(nextStep.fen);
                    syncState(); 
                  }
                  setStepIndex(stepIndex + 1);
                } else {
                  onLevelComplete?.(1);
                }
             }}
             onShowMe={() => {
                playClick();
                if (currentStep.expectedMove) {
                   setSelectedSquare(currentStep.expectedMove.from as Square);
                   setLegalMoves(engine.getLegalMoves(currentStep.expectedMove.from as Square).filter(m => m.to === currentStep.expectedMove.to));
                   showMentorMessage(`Watch carefully! It's ${currentStep.expectedMove.from} to ${currentStep.expectedMove.to}`);
                }
             }}
          />
        )}

        <ChessBoard 
          board={engine.getBoard()}
          onMove={handleMove}
          legalMoves={legalMoves}
          onSelectSquare={handleSelectSquare}
          selectedSquare={selectedSquare}
          lastMove={lastMove}
          inCheck={inCheck}
          kingSquare={getKingSquare()}
          lessonHighlightSquare={isLessonMode && currentStep ? (currentStep.highlightSquare || (hintVisible && currentStep.expectedMove ? currentStep.expectedMove.from : null)) : null}
          lessonTargetSquare={isLessonMode && currentStep?.expectedMove?.to ? currentStep.expectedMove.to : null}
        />

        {/* Game Over Overlay */}
        <AnimatePresence>
          {isGameOver && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
             >
                <div className="absolute inset-0 bg-black/60 rounded-xl"></div>
                <motion.div 
                   initial={{ scale: 0, rotate: -10 }}
                   animate={{ scale: 1, rotate: 0 }}
                   transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
                   className={`relative bg-white p-8 rounded-3xl text-center shadow-2xl border-8 ${checkmate ? 'border-red-500' : 'border-yellow-400'} max-w-sm flex flex-col items-center`}
                >
                   {checkmate && (
                      <motion.div
                         animate={{ scale: [1, 1.2, 1] }}
                         transition={{ repeat: Infinity, duration: 1.5 }}
                         className="text-6xl mb-4 drop-shadow-lg"
                      >
                         🏆
                      </motion.div>
                   )}
                   <motion.h2 
                      animate={checkmate ? { scale: [1, 1.1, 1] } : {}}
                      transition={checkmate ? { repeat: Infinity, duration: 2 } : {}}
                      className={`text-4xl sm:text-5xl font-black text-transparent bg-clip-text ${checkmate ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 uppercase' : 'bg-gradient-to-b from-gray-700 to-gray-900'} mb-2 drop-shadow-sm`}
                   >
                     {checkmate ? "CHECKMATE!" : "GAME OVER"}
                   </motion.h2>
                   <p className="text-xl sm:text-2xl text-gray-700 font-bold mt-2">
                     {checkmate 
                       ? (!isPlayerTurn ? "You Win! 🌟" : "The Robot Wins! 🤖") 
                       : (draw ? "It's a Draw! 🤝" : "Game Over")}
                   </p>
                   
                   <div className="mt-4 bg-gray-100 rounded-xl p-4 w-full flex justify-around text-gray-600 font-bold">
                     <div className="text-center">
                        <div className="text-sm uppercase opacity-70">Moves</div>
                        <div className="text-2xl text-blue-600">{Math.ceil(engine.game.history().length / 2)}</div>
                     </div>
                     <div className="text-center">
                        <div className="text-sm uppercase opacity-70">Time</div>
                        <div className="text-2xl text-green-600">
                          {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
                        </div>
                     </div>
                   </div>
                   
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={handleReset}
                     className={`mt-8 ${checkmate ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 border-orange-700' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 border-indigo-800'} text-white font-black text-xl py-4 px-10 rounded-full shadow-xl border-b-6 active:border-b-0 active:translate-y-1 transition-all`}
                   >
                     PLAY AGAIN
                   </motion.button>
                </motion.div>
             </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </div>

      {/* Right Column (Controls) */}
      <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-8 flex-none w-full lg:w-auto">
        {/* Controls */}
        {!isLessonMode && (
           <GameControls 
             onUndo={handleUndo} 
             onReset={handleReset}
             // Disable undo if it's the very first move
             disableUndo={engine.game.history().length === 0 || (!isPlayerTurn && !isGameOver)}
             toggleMentor={() => setIsMentorOpen(v => !v)}
           />
        )}

        {/* Back to Menu */}
        <button 
          onClick={onBack}
          className="mt-4 lg:mt-8 text-[#B58863] hover:text-[#8B5A2B] font-bold text-base sm:text-lg underline underline-offset-4 transition-colors z-20 pb-20 sm:pb-0"
        >
          {isLessonMode ? "Back to Map" : "Back to Main Menu"}
        </button>
      </div>

     </div>

      <AIMentor 
         isOpen={isMentorOpen} 
         onClose={() => setIsMentorOpen(false)} 
         engine={engine} 
         worldId={level?.worldId || 1}
         worldName={level ? WORLDS.find(w => w.id === level.worldId)?.title : 'Free Play'}
         levelName={level?.title || 'Free Play'}
         lastMove={lastMove}
         customMessage={mentorCustomMessage}
         onClearCustomMessage={() => setMentorCustomMessage(null)}
      />
    </div>
  );
}
