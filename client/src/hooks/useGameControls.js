import { useCallback, useState, useEffect } from 'react';

export const useGameControls = (ws, roomId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [gameError, setGameError] = useState(null);

  // Set loading to false after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const startNextRound = useCallback(() => {
    try {
      if (ws && roomId) {
        const normalizedRoomId = roomId?.toLowerCase();
        ws.emit("start-round", { roomId: normalizedRoomId });
      } else {
        setGameError('Cannot start round: missing connection or room ID');
      }
    } catch (error) {
      console.error('Error starting next round:', error);
      setGameError('Failed to start next round');
    }
  }, [ws, roomId]);

  const clearError = useCallback(() => {
    setGameError(null);
  }, []);

  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    gameError,
    startNextRound,
    clearError,
    setLoading
  };
};
