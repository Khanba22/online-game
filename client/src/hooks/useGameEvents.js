import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addEquipment } from '../redux/PlayerDataReducer';
import { reduceLife, usePlayerEquipment } from '../redux/AllPlayerReducer';
import { updateGameTurn, setBulletArr } from '../redux/GameConfig';

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

  // Handle player being shot - ONLY update state based on server data
  const shotPlayer = useCallback((data) => {
    console.log(`🎯 [CLIENT] Received player-shot event:`, {
      victim: data.victim,
      victimLives: data.victimLives,
      livesTaken: data.livesTaken,
      isBulletLive: data.isBulletLive,
      currentTurn: data.currentTurn,
      playerTurn: data.playerTurn
    });

    const {
      isBulletLive,
      victim,
      currentTurn,
      playerTurn,
      victimLives,
      bulletArr
    } = data;
    try {
      playSound(
        isBulletLive ? "/sounds/gun_shoot.mp3" : "/sounds/fakeBullet.mp3"
      );
      toast.info(isBulletLive ? "Bullet Was Live" : "Bullet Was Fake");

      // Update bullet array from server response (authoritative)
      if (bulletArr) {
        dispatch({
          type: `${setBulletArr}`,
          payload: bulletArr,
        });
      }
      
      // Update turn from server
      dispatch({
        type: `${updateGameTurn}`,
        payload: { playerTurn, turn: currentTurn },
      });

      // Update lives based on server-provided life counts (authoritative)
      if (victimLives !== undefined) {
        console.log(`💀 [CLIENT] Updating ${victim}'s lives to ${victimLives} (server authoritative)`);
        dispatch({
          type: `${reduceLife}`,
          payload: { user: victim, lives: victimLives },
        });
      }
    } catch (error) {
      console.error('Error handling player shot:', error);
      setGameError('Failed to process player shot');
    }
  }, [playSound, dispatch]);

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

  // Handle equipment usage with full synchronization
  const usedEquipment = useCallback((data) => {
    console.log(`⚙️ [CLIENT] Received used-equipment event:`, {
      user: data.user,
      equipment: data.equipment,
      lives: data.lives,
      message: data.message,
      playerState: data.playerState
    });

    try {
      const { 
        user, 
        equipment, 
        equipmentCount, 
        lives, 
        isShielded, 
        hasDoubleDamage, 
        canLookBullet, 
        hasDoubleTurn,
        message,
        currentTurn,
        playerTurn,
        playerState
      } = data;

      // Use complete player state from server if available
      if (playerState) {
        console.log(`📦 [CLIENT] Using complete player state from server:`, playerState);
        dispatch({
          type: `${usePlayerEquipment}`,
          payload: { 
            user, 
            equipmentType: equipment,
            equipmentCount: playerState.equipment[equipment],
            lives: playerState.lives,
            isShielded: playerState.isShielded,
            hasDoubleDamage: playerState.hasDoubleDamage,
            canLookBullet: playerState.canLookBullet,
            hasDoubleTurn: playerState.hasDoubleTurn
          },
        });
      } else {
        console.log(`📦 [CLIENT] Using individual properties (fallback)`);
        // Fallback to individual properties
        dispatch({
          type: `${usePlayerEquipment}`,
          payload: { 
            user, 
            equipmentType: equipment,
            equipmentCount,
            lives,
            isShielded,
            hasDoubleDamage,
            canLookBullet,
            hasDoubleTurn
          },
        });
      }

      // Update turn if it's a skip turn
      if (equipment === "skip" && currentTurn !== undefined && playerTurn) {
        dispatch({
          type: `${updateGameTurn}`,
          payload: { playerTurn, turn: currentTurn },
        });
      }

      // Show equipment usage message
      if (message) {
        toast.success(message);
      }
    } catch (error) {
      console.error('Error handling equipment usage:', error);
      setGameError('Failed to process equipment usage');
    }
  }, [dispatch]);

  // Handle looker equipment usage
  const bulletLooked = useCallback((data) => {
    try {
      const { isLive, message } = data;
      
      // Show bullet status with appropriate styling
      toast.info(message || `🔍 The next bullet is ${isLive ? 'LIVE' : 'FAKE'}!`, {
        autoClose: 3000,
        className: isLive ? 'toast-live' : 'toast-fake'
      });
    } catch (error) {
      console.error('Error handling bullet look:', error);
    }
  }, []);

  // Handle when someone else uses looker
  const playerUsedLooker = useCallback((data) => {
    try {
      const { player, message } = data;
      toast.info(message || `${player} used looker equipment`);
    } catch (error) {
      console.error('Error handling looker usage:', error);
    }
  }, []);

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
      ws.on("bullet-looked", bulletLooked);
      ws.on("player-used-looker", playerUsedLooker);
      ws.on("equipment-error", (error) => {
        console.error('Equipment error:', error);
        toast.error(error.message || 'Equipment usage failed');
      });
      ws.on("error", (error) => {
        console.error('Socket error:', error);
        setGameError('Connection error occurred');
      });

      return () => {
        ws.off("player-shot", shotPlayer);
        ws.off("round-started", roundStart);
        ws.off("round-over", roundOver);
        ws.off("used-equipment", usedEquipment);
        ws.off("bullet-looked", bulletLooked);
        ws.off("player-used-looker", playerUsedLooker);
        ws.off("equipment-error");
        ws.off("error");
      };
    } catch (error) {
      console.error('Error setting up socket listeners:', error);
      setGameError('Failed to initialize game connection');
    }
  }, [ws, shotPlayer, roundStart, roundOver, usedEquipment, bulletLooked, playerUsedLooker]);

  return {
    gameError,
    setGameError,
    playSound,
    isCountdownActive
  };
};
