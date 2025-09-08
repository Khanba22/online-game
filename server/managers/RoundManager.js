const { createError, errorTypes } = require('../utils/errorHandler');

class RoundManager {
  constructor(roomManager, equipmentManager) {
    this.roomManager = roomManager;
    this.equipmentManager = equipmentManager;
  }

  startRound(roomId) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const live = Math.floor(Math.random() * 3) + 1;
    const fakes = Math.floor(Math.random() * 3);
    let bulletArr = this.createRandomizedArray(live, fakes);

    const equipments = this.roomManager.generateEquipments(normalizedRoomId);

    console.log(`🎮 [ROUND START] Room: ${normalizedRoomId}, Live: ${live}, Fakes: ${fakes}, Bullets: [${bulletArr.join(', ')}]`);

    this.roomManager.updateRoomConfig(normalizedRoomId, {
      bulletArr: bulletArr,
      hasStarted: true
    });

    // Reset all equipment status flags for new round
    this.equipmentManager.resetAllPlayersEquipmentStatus(normalizedRoomId);

    return {
      bulletArr,
      equipments,
      live,
      fakes,
      turn: 0
    };
  }

  shootPlayer(roomId, shooter, victim) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    this.validateGameState(normalizedRoomId);

    // Fix any players with invalid lives values
    this.roomManager.fixPlayerLives(normalizedRoomId);

    // Validate it's the shooter's turn
    const currentPlayer = this.getCurrentPlayer(normalizedRoomId);
    console.log(`Current turn: ${currentPlayer}, Shooter: ${shooter}, Room: ${normalizedRoomId}`);
    if (currentPlayer !== shooter) {
      throw createError(errorTypes.INVALID_TURN, 'It is not your turn');
    }

    const roomConfig = this.roomManager.getRoomConfig(normalizedRoomId);
    
    // Check if there are bullets left
    if (roomConfig.bulletArr.length === 0) {
      throw createError(errorTypes.NO_BULLETS, 'No bullets left in this round');
    }

    // Pop the bullet from the array
    const bullet = roomConfig.bulletArr.pop();
    
    console.log(`🎯 [SHOOT EVENT] Shooter: ${shooter}, Victim: ${victim}, Room: ${normalizedRoomId}`);
    console.log(`💥 [BULLET RESULT] Is Live: ${bullet === 1}, Bullet Array After: [${roomConfig.bulletArr.join(', ')}]`);

    if (bullet === 1) {
      // Live bullet - apply damage with equipment buffs
      const victimData = this.roomManager.roomNames[normalizedRoomId][victim];
      const shooterData = this.roomManager.roomNames[normalizedRoomId][shooter];
      
      let livesTaken = 0;
      let damage = 1; // Base damage
      
      // Check if victim has shield - shield negates any damage
      if (victimData.isShielded) {
        livesTaken = 0;
        console.log(`🛡️ [SHIELD] Victim ${victim} has shield - damage negated`);
        victimData.isShielded = false; // Shield is consumed
        // Remove shield equipment
        if (victimData.equipments && victimData.equipments.shield > 0) {
          victimData.equipments.shield -= 1;
          console.log(`🛡️ [SHIELD] Shield equipment consumed, remaining: ${victimData.equipments.shield}`);
        }
      } else {
        // No shield - apply damage with double damage buff
        if (shooterData.hasDoubleDamage) {
          damage = 2;
          console.log(`⚔️ [DOUBLE DAMAGE] Shooter ${shooter} has double damage active`);
        }
        
        const currentLives = victimData.lives || 0;
        const newLives = Math.max(0, currentLives - damage);
        victimData.lives = newLives;
        livesTaken = damage;
        
        console.log(`💀 [DAMAGE] ${damage} damage dealt (${currentLives} → ${newLives} lives)`);
        
        // Only eliminate if lives reach 0
        if (newLives === 0) {
          victimData.isAlive = false;
        }
      }
      
      // Reset shooter's double damage after use
      shooterData.hasDoubleDamage = false;
      
      // Live bullet - always move to next turn
      this.moveToNextTurn(normalizedRoomId);
      
      const finalTurn = roomConfig.turn;
      const finalPlayerTurn = this.getCurrentPlayer(normalizedRoomId);
      console.log(`🎯 [SHOOT RESULT] Live bullet - Final turn: ${finalTurn}, Player turn: ${finalPlayerTurn}`);
      
      return {
        shooter,
        victim,
        isLive: true,
        isBulletLive: true,
        eliminated: victimData.lives === 0 ? victim : null,
        livesTaken: livesTaken,
        victimLives: victimData.lives,
        shooterLives: shooterData.lives,
        turn: finalTurn,
        currentTurn: finalTurn,
        playerTurn: finalPlayerTurn,
        bulletArr: roomConfig.bulletArr
      };
    } else {
      // Fake bullet - player survives
      // Only move to next turn if shooter shot someone else
      if (shooter !== victim) {
        console.log(`🎯 [SHOOT RESULT] Fake bullet on other player - moving turn`);
        this.moveToNextTurn(normalizedRoomId);
      } else {
        console.log(`🎯 [SHOOT RESULT] Fake bullet on self - keeping turn`);
      }
      // If shooter shot himself with fake bullet, turn stays the same
      
      const finalTurn = roomConfig.turn;
      const finalPlayerTurn = this.getCurrentPlayer(normalizedRoomId);
      console.log(`🎯 [SHOOT RESULT] Fake bullet - Final turn: ${finalTurn}, Player turn: ${finalPlayerTurn}`);
      
      return {
        shooter,
        victim,
        isLive: false,
        isBulletLive: false,
        eliminated: null,
        livesTaken: 0,
        victimLives: this.roomManager.roomNames[normalizedRoomId][victim].lives,
        shooterLives: this.roomManager.roomNames[normalizedRoomId][shooter].lives,
        turn: finalTurn,
        currentTurn: finalTurn,
        playerTurn: finalPlayerTurn,
        bulletArr: roomConfig.bulletArr
      };
    }
  }

  checkGameOver(roomId) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const alivePlayers = Object.keys(this.roomManager.roomNames[normalizedRoomId]).filter(
      (player) => this.roomManager.roomNames[normalizedRoomId][player].lives > 0
    );
    
    console.log(`🏁 [GAME OVER CHECK] Room: ${normalizedRoomId}, Alive players: ${alivePlayers.length}`);
    
    if (alivePlayers.length <= 1) {
      const winner = alivePlayers[0] || null;
      console.log(`🏆 [GAME OVER] Winner: ${winner}`);
      return {
        winner,
        gameOver: true
      };
    }
    
    return null;
  }

  getCurrentPlayer(roomId) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const players = Object.keys(this.roomManager.roomNames[normalizedRoomId]);
    const currentTurn = this.roomManager.getRoomConfig(normalizedRoomId).turn;
    const currentPlayer = players[currentTurn];
    console.log(`getCurrentPlayer - Room: ${normalizedRoomId}, Players: [${players.join(', ')}], Turn: ${currentTurn}, Current Player: ${currentPlayer}`);
    return currentPlayer;
  }

  moveToNextTurn(roomId) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const roomConfig = this.roomManager.getRoomConfig(normalizedRoomId);
    const players = Object.keys(this.roomManager.roomNames[normalizedRoomId]);
    const alivePlayers = players.filter(player => this.roomManager.roomNames[normalizedRoomId][player].isAlive);
    
    console.log(`🔄 [TURN] Moving to next turn. Current turn: ${roomConfig.turn}, Alive players: ${alivePlayers.length}`);
    
    if (alivePlayers.length <= 1) {
      console.log(`🔄 [TURN] Game over - not moving turn`);
      return; // Game over, no need to move turn
    }
    
    // Find next alive player
    let nextTurn = (roomConfig.turn + 1) % players.length;
    let attempts = 0;
    
    console.log(`🔄 [TURN] Starting from turn ${nextTurn}, checking ${players[nextTurn]}`);
    
    while (!this.roomManager.roomNames[normalizedRoomId][players[nextTurn]].isAlive && attempts < players.length) {
      nextTurn = (nextTurn + 1) % players.length;
      attempts++;
      console.log(`🔄 [TURN] Player ${players[nextTurn]} is dead, trying next: ${nextTurn}`);
    }
    
    const oldTurn = roomConfig.turn;
    this.roomManager.updateRoomConfig(normalizedRoomId, { turn: nextTurn });
    console.log(`🔄 [TURN] Turn changed: ${oldTurn} → ${nextTurn} (${players[nextTurn]})`);
  }

  handleSkipTurn(roomId, player, skipCount = 1) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const oldTurn = this.roomManager.getRoomConfig(normalizedRoomId).turn;
    
    console.log(`⏭️ [SKIP] Player ${player} using ${skipCount} skip(s)`);
    
    // Move turn skipCount times
    for (let i = 0; i < skipCount; i++) {
      this.moveToNextTurn(normalizedRoomId);
    }
    
    const newTurn = this.roomManager.getRoomConfig(normalizedRoomId).turn;
    const newPlayerTurn = this.getCurrentPlayer(normalizedRoomId);
    
    console.log(`⏭️ [SKIP] Turn skipped by ${player}: ${oldTurn} → ${newTurn} (${newPlayerTurn}) after ${skipCount} skip(s)`);
    
    return {
      currentTurn: newTurn,
      playerTurn: newPlayerTurn,
      skipCount: skipCount
    };
  }

  createRandomizedArray(live, fakes) {
    const arr = [];
    for (let i = 0; i < live; i++) {
      arr.push(1); // 1 represents live bullet
    }
    for (let i = 0; i < fakes; i++) {
      arr.push(0); // 0 represents fake bullet
    }
    
    // Shuffle the array
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    return arr;
  }

  validateGameState(roomId) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const roomConfig = this.roomManager.getRoomConfig(normalizedRoomId);
    
    if (!roomConfig.hasStarted) {
      throw createError(errorTypes.GAME_NOT_STARTED, 'Game has not started yet');
    }
    
    if (roomConfig.memberNo < 2) {
      throw createError(errorTypes.INSUFFICIENT_PLAYERS, 'Not enough players to play');
    }
  }

  // Check if round is over (no bullets left)
  isRoundOver(roomId) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const roomConfig = this.roomManager.getRoomConfig(normalizedRoomId);
    return roomConfig.bulletArr.length === 0;
  }

  // Get round statistics
  getRoundStats(roomId) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const roomConfig = this.roomManager.getRoomConfig(normalizedRoomId);
    const players = Object.keys(this.roomManager.roomNames[normalizedRoomId]);
    const alivePlayers = players.filter(player => this.roomManager.roomNames[normalizedRoomId][player].isAlive);
    
    return {
      totalPlayers: players.length,
      alivePlayers: alivePlayers.length,
      bulletsLeft: roomConfig.bulletArr.length,
      currentTurn: roomConfig.turn,
      currentPlayer: this.getCurrentPlayer(normalizedRoomId),
      hasStarted: roomConfig.hasStarted
    };
  }
}

module.exports = RoundManager;
