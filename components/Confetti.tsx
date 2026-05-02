import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ConfettiProps = {
  trigger: number; // Increment to re-trigger
};

export const Confetti: React.FC<ConfettiProps> = ({ trigger }) => {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; color: string; delay: number; rotation: number; shape: string; targetX: number; targetRotate: number; targetScale: number; duration: number }[]
  >([]);

  useEffect(() => {
    if (trigger > 0) {
      const colors = ['#FFD700', '#FF3366', '#4ADE80', '#3B82F6', '#A855F7', '#FF8A00'];
      const shapes = ['square', 'circle'];
      const newParticles = Array.from({ length: 80 }).map(() => ({
        id: Math.random(),
        x: Math.random() * 100, // vw
        y: -10 - Math.random() * 20, // vh
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        targetX: Math.random() * 30 - 15,
        targetRotate: 720 + Math.random() * 360,
        targetScale: Math.random() > 0.5 ? 1 : 0.6,
        duration: 2.5 + Math.random() * 2,
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ top: `${p.y}vh`, left: `${p.x}vw`, rotate: p.rotation, scale: 0 }}
            animate={{ 
              top: '110vh', 
              left: `${p.x + p.targetX}vw`, 
              rotate: p.rotation + p.targetRotate, 
              scale: p.targetScale 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
            className={`absolute w-3 h-3 sm:w-4 sm:h-4 ${p.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
            style={{ backgroundColor: p.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

