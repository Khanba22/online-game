import { useCallback, useRef, useState } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRefs = useRef({});

  const playSound = useCallback((src, options = {}) => {
    if (isMuted) return;

    try {
      // Reuse existing audio element if available
      if (!audioRefs.current[src]) {
        audioRefs.current[src] = new Audio(src);
      }

      const audio = audioRefs.current[src];
      audio.volume = volume * (options.volume || 1);
      audio.currentTime = 0; // Reset to beginning
      
      audio.play().catch(error => {
        console.warn('Audio playback failed:', error);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [isMuted, volume]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setAudioVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  }, []);

  const stopAllSounds = useCallback(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);

  return {
    isMuted,
    volume,
    playSound,
    toggleMute,
    setAudioVolume,
    stopAllSounds
  };
};
