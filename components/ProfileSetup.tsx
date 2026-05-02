import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { UserData } from '@/types/userData';

type ProfileSetupProps = {
  onComplete: (name: string, avatar: string, age: UserData['profile']['ageRange']) => void;
};

const AVATARS = [
  { icon: '♟️', name: 'Pawn Pete' },
  { icon: '🐴', name: 'Knight Ned' },
  { icon: '⛪', name: 'Bishop Bea' },
  { icon: '🧱', name: 'Rook Rex' },
  { icon: '👑', name: 'Queen Quinn' },
  { icon: '♚', name: 'King Kyle' }
];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('♟️');
  const [ageRange, setAgeRange] = useState<UserData['profile']['ageRange']>('9-11');
  
  const { playClick, playCheckmate } = useSound();

  const handleNext = () => {
    playClick();
    if (step < 3) {
      setStep(step + 1);
    } else {
      playCheckmate();
      onComplete(name, avatar, ageRange);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <motion.div 
            className="h-full bg-yellow-400" 
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <h1 className="text-3xl font-black text-center text-purple-900 mb-8 mt-4">
          Welcome to CUZO!
        </h1>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-700 text-center">What&apos;s your chess name?</h2>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grandmaster Alex"
                className="w-full text-center text-2xl font-bold border-4 border-purple-200 rounded-2xl p-4 focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={20}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-700 text-center">Pick your chess buddy!</h2>
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map(val => (
                  <button
                    key={val.icon}
                    onClick={() => setAvatar(val.icon)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-4 transition-all ${
                      avatar === val.icon 
                        ? 'border-yellow-400 bg-yellow-50 scale-105' 
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-4xl mb-2">{val.icon}</span>
                    <span className="text-xs font-bold text-gray-500">{val.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-700 text-center">How old are you?</h2>
              <div className="flex flex-col gap-3">
                {[
                  { id: '6-8', label: '6-8 years old', icon: '🌱' },
                  { id: '9-11', label: '9-11 years old', icon: '🌿' },
                  { id: '12-14', label: '12-14 years old', icon: '🌳' },
                ].map((age) => (
                  <button
                    key={age.id}
                    onClick={() => setAgeRange(age.id as any)}
                    className={`flex items-center p-4 rounded-2xl border-4 transition-all ${
                      ageRange === age.id 
                        ? 'border-green-400 bg-green-50 scale-105' 
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-3xl mr-4">{age.icon}</span>
                    <span className="text-lg font-bold text-gray-700">{age.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex justify-end">
          <button
            disabled={step === 1 && name.trim().length === 0}
            onClick={handleNext}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-lg py-4 px-8 rounded-2xl shadow-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? "Let's Go!" : "Next"} <ChevronRight />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

import { AnimatePresence } from 'motion/react';
