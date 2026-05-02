'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronLeft, Bot, User, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Move tool definition outside or useMemo to prevent re-renders if needed
const updateChessboardTool = {
  name: "update_chessboard",
  description: "Updates the visual chessboard for the student to see.",
  parameters: {
    type: "OBJECT",
    properties: {
      fen: {
        type: "STRING",
        description: "The fen string representing the chess board state."
      },
      highlights: {
         type: "ARRAY",
         items: { type: "STRING" },
         description: "An array of square names to highlight. e.g. ['e4', 'f3']"
      },
      animation: {
         type: "STRING",
         description: "Optional animation to trigger on the frontend. Values: 'sparkles', 'shake'"
      }
    },
    required: ["fen"]
  }
};

export default function CuzoTutor() {
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [animation, setAnimation] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model' | 'system', content: string }[]>([
     { role: 'model', content: "Welcome to Lesson 1: Scholar's Mate! It's an aggressive but sneaky opener. Usually White brings their bishop and queen out early to attack the weak f7 pawn. Let's see how it looks. Tell me when you're ready!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Custom styles for highlights
  const customSquareStyles = highlights.reduce((acc, square) => {
    acc[square] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    return acc;
  }, {} as Record<string, React.CSSProperties>);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsTyping(true);

    try {
      const historyContents = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      
      if (historyContents.length > 0 && historyContents[0].role === 'model') {
        historyContents.unshift({ role: 'user', parts: [{ text: 'Hello, I want to learn about chess!' }] });
      }
      
      const contents = [...historyContents, { role: 'user', parts: [{ text: userMsg }] }];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0-flash',
          contents,
          systemInstruction: "You are 'Cuzo', a high-energy, pun-loving Chess Master and tutor for kids. You speak enthusiastically and use chess puns. When a user asks you to explain a concept or says 'teach me', use the `update_chessboard` tool to set up the chessboard to illustrate your point. Only use the tool if the board state needs to change. Your goal is to guide the student, step-by-step. Keep responses concise and engaging.",
          tools: [{ functionDeclarations: [updateChessboardTool] }]
        })
      });

      if (!res.ok) throw new Error('Failed to reach AI Tutor');
      const response = await res.json();
      
      let gotReply = false;

      // Process Tool Calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        gotReply = true;
        for (const call of response.functionCalls) {
          if (call.name === 'update_chessboard' && call.args) {
             const args = call.args as any;
             if (args.fen) setFen(args.fen);
             if (args.highlights) setHighlights(args.highlights);
             if (args.animation) {
                setAnimation(args.animation);
                setTimeout(() => setAnimation(null), 2000);
             }
          }
        }
      }

      // Process Text Content
      const textContent = response.text || (gotReply ? "Let me show you on the board!" : "");
      if (textContent.trim().length > 0) {
         gotReply = true;
         setMessages(prev => [...prev, { role: 'model', content: textContent }]);
      }

      if (!gotReply) {
         setMessages(prev => [...prev, { role: 'system', content: "Cuzo's thinking cap is a bit loose! Try asking again." }]);
      }

    } catch (e: any) {
      console.error("Cuzo Chat Error:", e);
      setMessages(prev => [...prev, { role: 'system', content: `Oh no! ${e.message || "Something went wrong."}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-2xl shadow-inner">🧙‍♂️</div>
             <div>
               <h1 className="text-xl font-black text-yellow-400 leading-none">CUZO</h1>
               <p className="text-xs text-slate-400 font-bold tracking-wider">AI CHESS TUTOR</p>
             </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-700">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-xs font-bold text-slate-300">ONLINE</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Board Section */}
        <div className="flex-[1.2] flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
           {/* Animated Background Ornaments */}
           <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

           <motion.div
             animate={animation === 'shake' ? { x: [-10, 10, -10, 10, 0] } : {}}
             transition={{ duration: 0.4 }}
             className="w-full max-w-[min(80vw,500px)] aspect-square bg-slate-800 p-2 sm:p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-slate-700/50 relative z-10"
           >
             <Chessboard 
                options={{
                    id: "cuzo-board",
                    position: fen,
                    squareStyles: customSquareStyles,
                    boardOrientation: "white",
                    allowDragging: false
                }}
             />

             <AnimatePresence>
               {animation === 'sparkles' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                  >
                    <div className="text-6xl filter drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]">✨</div>
                  </motion.div>
               )}
             </AnimatePresence>
           </motion.div>

           <div className="mt-6 flex flex-wrap justify-center gap-3">
              {['Scholar\'s Mate', 'The Fork', 'Pin Tactics', 'Back Rank Mate'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setInput(`Tell me about ${tag}`)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs font-bold text-slate-300 transition-colors"
                >
                  {tag}
                </button>
              ))}
           </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-slate-800/80 border-l border-slate-700/50 backdrop-blur-md shadow-2xl z-10">
           {/* Messages Area */}
           <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 custom-scrollbar">
               <AnimatePresence initial={false}>
                 {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                       <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center shadow-md ${
                         m.role === 'user' ? 'bg-blue-500' :
                         m.role === 'model' ? 'bg-yellow-500' : 'bg-red-500'
                       }`}>
                         {m.role === 'user' ? <User size={16} /> :
                          m.role === 'model' ? <Bot size={18} /> : <span>⚠️</span>}
                       </div>

                       <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm leading-relaxed text-sm sm:text-base ${
                         m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' :
                         m.role === 'model' ? 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600/50' :
                         'bg-red-500/10 text-red-300 text-center italic border border-red-500/20 w-full'
                       }`}>
                          {m.content}
                       </div>
                    </motion.div>
                 ))}
               </AnimatePresence>

               {isTyping && (
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-md animate-bounce">
                        <Bot size={18} />
                     </div>
                     <div className="bg-slate-700 p-4 rounded-2xl rounded-tl-none border border-slate-600/50 flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-300"></div>
                     </div>
                  </div>
               )}
               <div ref={endOfMessagesRef} />
           </div>

           {/* Input Area */}
           <div className="p-4 sm:p-6 bg-slate-900/30 border-t border-slate-700/50">
               <div className="flex gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 focus-within:border-blue-500 transition-all shadow-inner">
                   <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isTyping) handleSendMessage();
                      }}
                      disabled={isTyping}
                      placeholder="Ask Cuzo anything about chess..."
                      className="flex-1 bg-transparent px-4 py-3 outline-none text-sm sm:text-base disabled:opacity-50"
                   />
                   <button
                      onClick={handleSendMessage}
                      disabled={isTyping || !input.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white p-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
                   >
                      <Send size={20} className={isTyping ? 'animate-pulse' : ''} />
                   </button>
               </div>
           </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
