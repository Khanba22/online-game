const { createError, errorTypes } = require('../utils/errorHandler');

class EquipmentManager {
  constructor(roomManager) {
    this.roomManager = roomManager;
    
    // Equipment effect mapping
    this.effectMap = {
      shield: "isShielded",
      doubleDamage: "hasDoubleDamage", 
      heals: "healing",
      looker: "canLookBullet",
      doubleTurn: "hasDoubleTurn",
      skip: "skipTurn"
    };
  }

  useEquipment(roomId, player, equipmentType) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    this.validateGameState(normalizedRoomId);

    console.log(`⚙️ [EQUIPMENT EVENT] Player: ${player}, Equipment: ${equipmentType}, Room: ${normalizedRoomId}`);

    const playerData = this.roomManager.roomNames[normalizedRoomId][player];
    
    // Check if player has the equipment
    if (!playerData.equipments || !playerData.equipments[equipmentType] || playerData.equipments[equipmentType] <= 0) {
      console.log(`❌ [EQUIPMENT ERROR] Player ${player} doesn't have ${equipmentType}`);
      throw createError(errorTypes.INVALID_EQUIPMENT, 'Equipment not available');
    }

    console.log(`📦 [EQUIPMENT] Player ${player} has ${playerData.equipments[equipmentType]} ${equipmentType}(s)`);

    const effect = this.effectMap[equipmentType];
    if (!effect) {
      console.log(`❌ [EQUIPMENT ERROR] Invalid equipment type: ${equipmentType}`);
      throw createError(errorTypes.INVALID_EQUIPMENT, 'Invalid equipment type');
    }

    // Consume the equipment
    playerData.equipments[equipmentType] -= 1;
    console.log(`📦 [EQUIPMENT] Consumed 1 ${equipmentType}, remaining: ${playerData.equipments[equipmentType]}`);

    // Apply equipment effects
    let equipmentData = {
      user: player,
      equipment: equipmentType,
      equipmentCount: playerData.equipments[equipmentType],
      lives: playerData.lives,
      isShielded: playerData.isShielded || false,
      hasDoubleDamage: playerData.hasDoubleDamage || false,
      canLookBullet: playerData.canLookBullet || false,
      hasDoubleTurn: playerData.hasDoubleTurn || false,
      // Send complete player state for synchronization
      playerState: {
        lives: playerData.lives,
        isShielded: playerData.isShielded || false,
        hasDoubleDamage: playerData.hasDoubleDamage || false,
        canLookBullet: playerData.canLookBullet || false,
        hasDoubleTurn: playerData.hasDoubleTurn || false,
        equipment: { ...playerData.equipments }
      }
    };

    if (effect === "healing") {
      const oldLives = playerData.lives;
      playerData.lives += 1;
      equipmentData.lives = playerData.lives;
      equipmentData.playerState.lives = playerData.lives;
      equipmentData.message = `${player} used heal and gained 1 life!`;
      console.log(`❤️ [HEAL] Player ${player} healed: ${oldLives} → ${playerData.lives} lives`);
    } else if (equipmentType === "skip") {
      // Skip turn - this will be handled by RoundManager
      equipmentData.message = `${player} used skip turn!`;
      equipmentData.skipTurn = true; // Flag for RoundManager to handle
      equipmentData.skipCount = 1; // Track number of skips used
      console.log(`⏭️ [SKIP] Player ${player} used skip turn`);
    } else {
      playerData[effect] = true;
      equipmentData[effect] = true;
      equipmentData.playerState[effect] = true;
      equipmentData.message = `${player} used ${equipmentType}!`;
      console.log(`✨ [EFFECT] Player ${player} activated ${equipmentType}, ${effect}: true`);
    }

    console.log(`📤 [EQUIPMENT RESULT] Returning equipment data:`, {
      user: equipmentData.user,
      equipment: equipmentData.equipment,
      lives: equipmentData.lives,
      message: equipmentData.message
    });

    return equipmentData;
  }

  lookAtBullet(roomId, player) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const roomConfig = this.roomManager.getRoomConfig(normalizedRoomId);
    const playerData = this.roomManager.roomNames[normalizedRoomId][player];
    
    // Check if player has looker equipment and can use it
    if (!playerData.canLookBullet || !playerData.equipments || playerData.equipments.looker <= 0) {
      throw createError(errorTypes.INVALID_EQUIPMENT, 'You don\'t have looker equipment or can\'t use it');
    }

    // Check if there are bullets to look at
    if (roomConfig.bulletArr.length === 0) {
      throw createError(errorTypes.NO_BULLETS, 'No bullets left to look at');
    }

    const nextBullet = roomConfig.bulletArr[roomConfig.bulletArr.length - 1];
    const bulletType = nextBullet === 1 ? 'Live' : 'Fake';
    
    // Consume the looker equipment
    playerData.equipments.looker -= 1;
    playerData.canLookBullet = false;

    console.log(`👁️ [LOOKER] Player ${player} looked at bullet: ${bulletType}`);

    return {
      bulletType,
      isLive: nextBullet === 1,
      message: `Next bullet is ${bulletType}!`
    };
  }

  resetPlayerEquipmentStatus(roomId, player) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const playerData = this.roomManager.roomNames[normalizedRoomId][player];
    
    // Reset all equipment status flags
    playerData.isShielded = false;
    playerData.hasDoubleDamage = false;
    playerData.canLookBullet = false;
    playerData.hasDoubleTurn = false;
    
    console.log(`🔄 [EQUIPMENT RESET] Reset equipment status for player ${player}`);
  }

  resetAllPlayersEquipmentStatus(roomId) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const players = Object.keys(this.roomManager.roomNames[normalizedRoomId]);
    
    players.forEach(player => {
      this.resetPlayerEquipmentStatus(normalizedRoomId, player);
    });
    
    console.log(`🔄 [EQUIPMENT RESET] Reset equipment status for all players in room ${normalizedRoomId}`);
  }

  getPlayerEquipmentStatus(roomId, player) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const playerData = this.roomManager.roomNames[normalizedRoomId][player];
    
    return {
      isShielded: playerData.isShielded || false,
      hasDoubleDamage: playerData.hasDoubleDamage || false,
      canLookBullet: playerData.canLookBullet || false,
      hasDoubleTurn: playerData.hasDoubleTurn || false,
      equipments: { ...playerData.equipments }
    };
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

  // Check if player has specific equipment
  hasEquipment(roomId, player, equipmentType) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const playerData = this.roomManager.roomNames[normalizedRoomId][player];
    
    return playerData.equipments && 
           playerData.equipments[equipmentType] && 
           playerData.equipments[equipmentType] > 0;
  }

  // Get equipment count for player
  getEquipmentCount(roomId, player, equipmentType) {
    const normalizedRoomId = this.roomManager.validateRoom(roomId);
    const playerData = this.roomManager.roomNames[normalizedRoomId][player];
    
    return playerData.equipments?.[equipmentType] || 0;
  }
}

module.exports = EquipmentManager;
