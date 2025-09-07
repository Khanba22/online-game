import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addEquipment, reduceMyLife } from '../redux/PlayerDataReducer';
import { reduceLife, usePlayerEquipment } from '../redux/AllPlayerReducer';
import { setBulletArr, updateGameTurn } from '../redux/GameConfig';

export const useGameEvents = (ws, username) => {
  const dispatch = useDispatch();
  const [gameError, setGameError] = useState(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  // Helper function to play sound with error handling
  const playSound = useCallback((src) => {
    try {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Audio playback failed:', error);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  // Handle player being shot
  const shotPlayer = useCallback((data) => {
    const {
      shooter,
      isBulletLive,
      victim,
      livesTaken,
      currentTurn,
      playerTurn,
    } = data;
    try {
      playSound(
        isBulletLive ? "/sounds/gun_shoot.mp3" : "/sounds/fakeBullet.mp3"
      );
      toast.info(isBulletLive ? "Bullet Was Live" : "Bullet Was Fake");

      // Update bullet array from server response
      if (data.bulletArr) {
        dispatch({
          type: `${setBulletArr}`,
          payload: { bulletArr: data.bulletArr },
        });
      }
      
      dispatch({
        type: `${updateGameTurn}`,
        payload: { playerTurn, turn: currentTurn },
      });

      if (victim === username) {
        dispatch({
          type: `${reduceMyLife}`,
          payload: { liveCount: livesTaken },
        });
      }

      dispatch({
        type: `${reduceLife}`,
        payload: { user: victim, liveCount: livesTaken },
      });
    } catch (error) {
      console.error('Error handling player shot:', error);
      setGameError('Failed to process player shot');
    }
  }, [playSound, dispatch, username]);

  // Countdown function for round start
  const countdown = useCallback(async (seconds, live, fakes) => {
    try {
      setIsCountdownActive(true);
      for (let i = seconds; i >= 0; i--) {
        if (i > 0) {
          toast.info(`Round Starting In ${i}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          toast.info(`Live Bullets: ${live}, Fake Bullets: ${fakes}`);
        }
      }
      setIsCountdownActive(false);
    } catch (error) {
      console.error('Error during countdown:', error);
      setGameError('Countdown failed');
      setIsCountdownActive(false);
    }
  }, []);

  // Start a new round
  const roundStart = useCallback(async (data) => {
    try {
      console.log("Received round-started event with data:", data);
      
      const { bulletArr, equipments, live, fakes, turn, playerTurn } = data;
    
      if (!equipments) {
        console.error("Error: Equipments is undefined on client!");
        setGameError('Invalid game data received');
        return;
      }
    
      playSound("/sounds/countdown.mp3");
      console.log(equipments);
      await countdown(3, live, fakes);
    
      dispatch({
        type: `${updateGameTurn}`,
        payload: { turn, playerTurn },
      });
    
      dispatch({
        type: `${setBulletArr}`,
        payload: { bulletArr },
      });
      console.log(`Adding Equipments to ${username}`)
      dispatch({
        type: `${addEquipment}`,
        payload: { equipment: equipments[username] },
      });
    } catch (error) {
      console.error('Error starting round:', error);
      setGameError('Failed to start round');
    }
  }, [countdown, playSound, dispatch, username]);

  // Handle round over
  const roundOver = useCallback(() => {
    try {
      toast.info("Round Over");
      setTimeout(() => toast.info("Starting Next Round"), 1000);
    } catch (error) {
      console.error('Error handling round over:', error);
    }
  }, []);

  // Handle equipment usage
  const usedEquipment = useCallback(({ user, equipment }) => {
    try {
      if (equipment === "heals") {
        dispatch({
          type: `${usePlayerEquipment}`,
          payload: { user, equipmentType: equipment },
        });
      }
      toast.info(`${user} Activated ${equipment}`);
    } catch (error) {
      console.error('Error handling equipment usage:', error);
      setGameError('Failed to process equipment usage');
    }
  }, [dispatch]);

  // Setup socket event listeners
  useEffect(() => {
    if (!ws) {
      setGameError('WebSocket connection not available');
      return;
    }

    try {
      ws.on("player-shot", shotPlayer);
      ws.on("round-started", roundStart);
      ws.on("round-over", roundOver);
      ws.on("used-equipment", usedEquipment);
      ws.on("error", (error) => {
        console.error('Socket error:', error);
        setGameError('Connection error occurred');
      });

      return () => {
        ws.off("player-shot", shotPlayer);
        ws.off("round-started", roundStart);
        ws.off("round-over", roundOver);
        ws.off("used-equipment", usedEquipment);
        ws.off("error");
      };
    } catch (error) {
      console.error('Error setting up socket listeners:', error);
      setGameError('Failed to initialize game connection');
    }
  }, [ws, shotPlayer, roundStart, roundOver, usedEquipment]);

  return {
    gameError,
    setGameError,
    playSound,
    isCountdownActive
  };
};
