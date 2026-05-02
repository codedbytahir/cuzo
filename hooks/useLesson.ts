/**
 * hooks/useLesson.ts
 */
import { useState, useCallback, useEffect } from 'react';
import { LessonDef, LessonStep } from '@/types/lessons';
import { getLesson } from '@/lib/lessonDefinitions';
import { evaluateLessonMove } from '@/lib/lessonEngine';
import { GameEngine } from '@/lib/chessEngine';
import { useSound } from '@/hooks/useSound';

export function useLesson(lessonId: string | null, engine?: GameEngine) {
  const [lesson, setLesson] = useState<LessonDef | null>(null);
  const [currentStep, setCurrentStep] = useState<LessonStep | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { playClick, playCapture, playIllegal } = useSound();

  useEffect(() => {
    if (lessonId) {
      const l = getLesson(lessonId);
      if (l) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLesson(l);
         
        setCurrentStep(l.steps[l.firstStepId]);
        if (engine && typeof engine.game.load === 'function') {
           engine.game.load(l.setupFEN);
        }
      }
    }
  }, [lessonId, engine]);

  const handleLessonMove = useCallback((from: string, to: string) => {
    if (!currentStep || !engine) return false;

    const evaluation = evaluateLessonMove(engine.game, currentStep, { from, to });

    if (evaluation.type === 'target') {
        setScore(s => s + evaluation.points);
        setFeedback(evaluation.explanation);
        engine.game.move({ from, to, promotion: 'q' });
        playClick(); // Or play capture if capture

        if (evaluation.nextStepId && lesson) {
           const nextStep = lesson.steps[evaluation.nextStepId];
           if (nextStep.setupFEN) {
             engine.game.load(nextStep.setupFEN);
           }
           setCurrentStep(nextStep);
        } else {
           setCurrentStep(null); // Complete
        }
        return true;
    } else if (evaluation.type === 'acceptable') {
        playClick();
        setFeedback(evaluation.feedback + " " + evaluation.redirect);
        // Engine moves back instantly so player can try again?
        return false;
    } else if (evaluation.type === 'weak') {
        playIllegal();
        setFeedback(evaluation.feedback);
        return false;
    } else if (evaluation.type === 'blunder') {
        playIllegal();
        setFeedback(evaluation.feedback);
        return false;
    }

    return false;
  }, [currentStep, engine, lesson, playClick, playCapture, playIllegal]);

  return {
    lesson,
    currentStep,
    score,
    feedback,
    handleLessonMove,
    isComplete: !!lesson && !currentStep
  };
}
