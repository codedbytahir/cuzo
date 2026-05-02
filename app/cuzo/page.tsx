'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { motion } from 'motion/react';

const updateChessboardTool: FunctionDeclaration = {
  name: "update_chessboard",
  description: "Updates the visual chessboard for the student to see.",
  parameters: {
    type: "OBJECT" as any,
    properties: {
      fen: {
        type: "STRING" as any,
        description: "The fen string representing the chess board state."
      },
      highlights: {
         type: "ARRAY" as any,
         items: { type: "STRING" as any },
         description: "An array of square names to highlight. e.g. ['e4', 'f3']"
      },
      animation: {
         type: "STRING" as any,
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
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsTyping(true);

    try {
      console.log("Cuzo handling message:", userMsg);
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      console.log("API Key present?", !!apiKey);
      if (!apiKey) {
        throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY. The platform should inject this, or you may need to add it via settings.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const historyContents = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      
      if (historyContents.length > 0 && historyContents[0].role === 'model') {
        historyContents.unshift({ role: 'user', parts: [{ text: 'Hello, I want to learn about chess!' }] });
      }
      
      const contents = [...historyContents, { role: 'user', parts: [{ text: userMsg }] }];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents as any,
        config: {
          systemInstruction: "You are 'Cuzo', a high-energy, pun-loving Chess Master and tutor. You speak enthusiastically and use chess puns. When a user asks you to explain a concept or says 'teach me', use the `update_chessboard` tool to set up the chessboard to illustrate your point. Only use the tool if the board state needs to change. Your goal is to guide the student, step-by-step. Keep responses concise and engaging.",
          tools: [{ functionDeclarations: [updateChessboardTool] }],
        }
      });
      
      let gotReply = false;
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
        
        // Let's add the agent's text response if any
        let textContent = "";
        try {
          textContent = response.text || "";
        } catch (e) {
          // accessing response.text can throw if no text part exists
        }

        if (textContent.trim().length > 0) {
           setMessages(prev => [...prev, { role: 'model', content: textContent }]);
        } else {
           setMessages(prev => [...prev, { role: 'model', content: "Let me show you on the board!" }]);
        }
      } else {
         let textContent = "";
         try {
           textContent = response.text || "";
         } catch(e) {}
         
         if (textContent.trim().length > 0) {
             gotReply = true;
             setMessages(prev => [...prev, { role: 'model', content: textContent }]);
         }
      }

      if (!gotReply) {
         setMessages(prev => [...prev, { role: 'system', content: "Cuzo's response was empty. Please try rephrasing!" }]);
      }

    } catch (e: any) {
      console.error("Cuzo Chat Error full:", e);
      let errMsg = "An unknown error occurred.";
      if (e instanceof Error) {
        errMsg = e.message;
      } else if (typeof e === 'string') {
        errMsg = e;
      } else if (e && typeof e === 'object') {
        try {
           errMsg = JSON.stringify(e);
        } catch(err) {}
      }
      setMessages(prev => [...prev, { role: 'system', content: `API Error: ${errMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row p-4 gap-8">
      {/* Board Column */}
      <div className="flex-1 flex flex-col items-center justify-center">
         <h1 className="text-4xl font-black text-yellow-400 mb-6 drop-shadow-md">Cuzo the Chess Tutor</h1>
         <motion.div 
             animate={animation === 'shake' ? { x: [-10, 10, -10, 10, 0] } : {}}
             transition={{ duration: 0.4 }}
             className="w-full max-w-md bg-slate-800 p-2 rounded-xl shadow-2xl"
         >
             <Chessboard 
                options={{
                   position: fen,
                   squareStyles: customSquareStyles,
                   boardOrientation: "white",
                   allowDragging: false
                }}
             />
         </motion.div>
         {animation === 'sparkles' && (
             <div className="text-4xl mt-4 animate-bounce">✨ Great Move! ✨</div>
         )}
      </div>

      {/* Chat Column */}
      <div className="flex-1 flex flex-col bg-slate-800 rounded-2xl p-4 shadow-xl max-w-xl self-center h-[80vh]">
         {/* Messages */}
         <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4 pr-2">
             {messages.length === 0 && (
                <div className="text-center text-slate-400 my-auto text-lg italic">
                   Say hi to Cuzo and ask him to teach you Scholar&apos;s Mate!
                </div>
             )}
             {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-lg max-w-[85%] ${
                   m.role === 'user' ? 'bg-blue-600 self-end text-right rounded-br-sm' : 
                   m.role === 'model' ? 'bg-slate-700 self-start text-left rounded-bl-sm' : 
                   'bg-red-500/20 text-red-300 text-center text-sm self-center'
                }`}>
                   {m.content}
                </div>
             ))}
             {isTyping && (
                <div className="bg-slate-700 p-3 rounded-lg max-w-[85%] self-start text-left rounded-bl-sm flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                   <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-75"></div>
                   <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-150"></div>
                </div>
             )}
             <div ref={endOfMessagesRef} />
         </div>

         {/* Chat Input */}
         <div className="flex gap-2 shrink-0">
             <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isTyping) {
                     handleSendMessage();
                  }
                }}
                disabled={isTyping}
                placeholder="Ask Cuzo to teach you a tactic..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
             />
             <button 
                onClick={handleSendMessage}
                disabled={isTyping}
                className="bg-blue-600 hover:bg-blue-500 font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
             >
                Send
             </button>
         </div>
      </div>
    </div>
  );
}
