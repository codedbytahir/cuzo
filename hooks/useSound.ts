import { useState, useEffect } from 'react';
import { soundManager } from '../lib/soundManager';

export const useSound = () => {
    // Force re-render when mute state changes
    const [isMuted, setIsMuted] = useState(soundManager.isMuted);
    const [isMusicPlaying, setIsMusicPlaying] = useState(soundManager.isMusicPlaying);

    const toggleMute = () => {
        soundManager.toggleMute();
        setIsMuted(soundManager.isMuted);
    };

    const toggleMusic = () => {
        soundManager.toggleMusic();
        setIsMusicPlaying(soundManager.isMusicPlaying);
    };

    return {
        isMuted,
        isMusicPlaying,
        toggleMute,
        toggleMusic,
        playPawn: () => soundManager.playPawn(),
        playRook: () => soundManager.playRook(),
        playKnight: () => soundManager.playKnight(),
        playBishop: () => soundManager.playBishop(),
        playQueen: () => soundManager.playQueen(),
        playKing: () => soundManager.playKing(),
        playCapture: () => soundManager.playCapture(),
        playCheck: () => soundManager.playCheck(),
        playCheckmate: () => soundManager.playCheckmate(),
        playIllegal: () => soundManager.playIllegal(),
        playClick: () => soundManager.playClick(),
    };
};
