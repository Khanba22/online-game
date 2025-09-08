const { createError, errorTypes } = require('../utils/errorHandler');

class GameStateManager {
  constructor() {
    this.rooms = {};
    this.roomNames = {};
    this.roomConfigs = {};
    this.disconnected = {};
  }

  createRoom(socket) {
    const roomId = Math.random().toString(36).substr(2, 8).toLowerCase();
    this.rooms[roomId] = [];
    this.roomNames[roomId] = {};
    this.roomConfigs[roomId] = {
      turn: 0,
      rounds: 3,
      memberNo: 0,
      hasStarted: false,
      bulletArr: []
    };
    this.disconnected[roomId] = {};
    
    console.log(`Room created: ${roomId}. Total rooms: ${Object.keys(this.rooms).length}`);
    console.log(`Available rooms: ${Object.keys(this.rooms).join(', ')}`);
    return roomId;
  }

  joinRoom(socket, roomId, peerId, username) {
    console.log(`Attempting to join room ${roomId}. Available rooms: ${Object.keys(this.rooms).join(', ')}`);
    const normalizedRoomId = this.validateRoom(roomId);

    // Check if user is reconnecting
    if (this.disconnected[normalizedRoomId]?.[username]) {
      throw createError(errorTypes.CONNECTION_ERROR, 'Unable to rejoin - user already exists');
    }

    if (!this.roomNames[normalizedRoomId][username]) {
      // New user joining the game
      this.roomNames[normalizedRoomId][username] = {
        username,
        peerId, // Store the peerId for peer connections
        color: this.getPlayerColor(this.roomConfigs[normalizedRoomId].memberNo),
        ...this.getDefaultPlayerConfig()
      };
      this.rooms[normalizedRoomId].push(peerId);
      this.roomConfigs[normalizedRoomId].memberNo += 1;
    } else {
      // Update peerId for existing user (reconnection)
      this.roomNames[normalizedRoomId][username].peerId = peerId;
    }

    socket.join(normalizedRoomId);
    return {
      roomId: normalizedRoomId,
      playerData: this.roomNames[normalizedRoomId][username]
    };
  }

  startGame(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    const roomConfig = this.roomConfigs[normalizedRoomId];
    const members = Object.keys(this.roomNames[normalizedRoomId]);

    // Set player positions
    const playerPositionArr = require('../data/positionConfig.json');
    for (let i = 0; i < roomConfig.memberNo; i++) {
      if (playerPositionArr[roomConfig.memberNo]) {
        this.roomNames[normalizedRoomId][members[i]].position = playerPositionArr[roomConfig.memberNo].position[i];
        this.roomNames[normalizedRoomId][members[i]].rotation = playerPositionArr[roomConfig.memberNo].rotation[i];
        this.roomNames[normalizedRoomId][members[i]].cameraOffset = playerPositionArr[roomConfig.memberNo].cameraOffset[i];
      }
    }

    roomConfig.hasStarted = true;
    return {
      roomId: normalizedRoomId,
      members,
      roomConfig
    };
  }

  startRound(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    this.validateGameState(normalizedRoomId);

    const live = Math.floor(Math.random() * 3) + 1;
    const fakes = Math.floor(Math.random() * 3);
    const bulletArr = this.createRandomizedArray(live, fakes);

    const equipments = this.generateEquipments(normalizedRoomId);
    this.roomConfigs[normalizedRoomId].bulletArr = bulletArr;

    return {
      bulletArr,
      equipments,
      live,
      fakes,
      turn: this.roomConfigs[normalizedRoomId].turn,
      playerTurn: this.getCurrentPlayer(normalizedRoomId)
    };
  }

  shootPlayer(roomId, shooter, victim) {
    const normalizedRoomId = this.validateRoom(roomId);
    this.validateGameState(normalizedRoomId);

    // Fix any players with invalid lives values
    this.fixPlayerLives(normalizedRoomId);

    // Validate it's the shooter's turn
    const currentPlayer = this.getCurrentPlayer(normalizedRoomId);
    console.log(`Current turn: ${currentPlayer}, Shooter: ${shooter}, Room: ${normalizedRoomId}`);
    if (currentPlayer !== shooter) {
      throw createError(errorTypes.INVALID_TURN, 'It is not your turn');
    }

    const roomConfig = this.roomConfigs[normalizedRoomId];
    
    // Check if there are bullets left
    if (roomConfig.bulletArr.length === 0) {
      throw createError(errorTypes.NO_BULLETS, 'No bullets left in this round');
    }

    // Pop the bullet from the array
    const bullet = roomConfig.bulletArr.pop();
    
    if (bullet === 1) {
      // Live bullet - reduce lives by 1, don't eliminate immediately
      const currentLives = this.roomNames[normalizedRoomId][victim].lives || 0;
      const newLives = Math.max(0, currentLives - 1);
      this.roomNames[normalizedRoomId][victim].lives = newLives;
      
      // Only eliminate if lives reach 0
      if (newLives === 0) {
        this.roomNames[normalizedRoomId][victim].isAlive = false;
      }
      
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
        eliminated: newLives === 0 ? victim : null,
        livesTaken: 1,
        victimLives: newLives,
        shooterLives: this.roomNames[normalizedRoomId][shooter].lives,
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
        victimLives: this.roomNames[normalizedRoomId][victim].lives,
        shooterLives: this.roomNames[normalizedRoomId][shooter].lives,
        turn: finalTurn,
        currentTurn: finalTurn,
        playerTurn: finalPlayerTurn,
        bulletArr: roomConfig.bulletArr
      };
    }
  }

  useEquipment(roomId, player, equipmentType) {
    const normalizedRoomId = this.validateRoom(roomId);
    this.validateGameState(normalizedRoomId);

    console.log(`⚙️ [EQUIPMENT EVENT] Player: ${player}, Equipment: ${equipmentType}, Room: ${normalizedRoomId}`);

    const playerData = this.roomNames[normalizedRoomId][player];
    
    // Check if player has the equipment
    if (!playerData.equipments || !playerData.equipments[equipmentType] || playerData.equipments[equipmentType] <= 0) {
      console.log(`❌ [EQUIPMENT ERROR] Player ${player} doesn't have ${equipmentType}`);
      throw createError(errorTypes.INVALID_EQUIPMENT, 'Equipment not available');
    }

    console.log(`📦 [EQUIPMENT] Player ${player} has ${playerData.equipments[equipmentType]} ${equipmentType}(s)`);

    // Equipment effect mapping
    const effectMap = {
      shield: "isShielded",
      doubleDamage: "hasDoubleDamage", 
      heals: "healing",
      looker: "canLookBullet",
      doubleTurn: "hasDoubleTurn",
      skip: "skipTurn"
    };

    const effect = effectMap[equipmentType];
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
      // Skip turn - move to next alive player
      const oldTurn = this.roomConfigs[normalizedRoomId].turn;
      this.moveToNextTurn(normalizedRoomId);
      equipmentData.message = `${player} used skip turn!`;
      equipmentData.currentTurn = this.roomConfigs[normalizedRoomId].turn;
      equipmentData.playerTurn = this.getCurrentPlayer(normalizedRoomId);
      console.log(`⏭️ [SKIP] Turn skipped: ${oldTurn} → ${this.roomConfigs[normalizedRoomId].turn}`);
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

  checkGameOver(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    const roomConfig = this.roomConfigs[normalizedRoomId];
    const members = Object.keys(this.roomNames[normalizedRoomId]);
    
    const alivePlayers = members.filter(member => this.roomNames[normalizedRoomId][member].isAlive);
    
    if (alivePlayers.length <= 1) {
      return {
        winner: alivePlayers[0] || null,
        gameOver: true
      };
    }
    
    return null;
  }

  handleDisconnect(socket, roomId) {
    const normalizedRoomId = roomId ? roomId.toLowerCase() : null;
    if (!normalizedRoomId || !this.rooms[normalizedRoomId]) return;

    const room = this.rooms[normalizedRoomId];
    const socketIndex = room.findIndex(s => s.id === socket.id);
    
    if (socketIndex !== -1) {
      const username = Object.keys(this.roomNames[normalizedRoomId]).find(
        name => this.roomNames[normalizedRoomId][name].peerId === room[socketIndex]
      );
      
      if (username) {
        this.disconnected[normalizedRoomId][username] = this.roomNames[normalizedRoomId][username];
        delete this.roomNames[normalizedRoomId][username];
        this.roomConfigs[normalizedRoomId].memberNo -= 1;
      }
      
      room.splice(socketIndex, 1);
    }
  }

  // Helper methods
  getPlayerColor(memberNo) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors[memberNo % colors.length];
  }

  getDefaultPlayerConfig() {
    return {
      isAlive: true,
      lives: 3, // Add lives property
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      cameraOffset: { x: 0, y: 0, z: 0 },
      equipments: {
        shield: 1,
        doubleDamage: 1,
        heals: 1,
        looker: 1,
        doubleTurn: 1,
        skip: 1
      },
      // Equipment status flags
      isShielded: false,
      hasDoubleDamage: false,
      canLookBullet: false,
      hasDoubleTurn: false
    };
  }

  // Fix players with invalid lives values
  fixPlayerLives(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    const players = this.roomNames[normalizedRoomId];
    
    Object.keys(players).forEach(username => {
      const player = players[username];
      if (isNaN(player.lives) || player.lives === undefined) {
        console.log(`Fixing lives for player ${username}: ${player.lives} -> 3`);
        player.lives = 3;
        player.isAlive = true;
      }
    });
  }

  createRandomizedArray(live, fakes) {
    const arr = Array(live).fill(1).concat(Array(fakes).fill(0));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  generateEquipments(roomId) {
    const members = Object.keys(this.roomNames[roomId]);
    const equipments = {};
    
    members.forEach(member => {
      equipments[member] = this.getDefaultPlayerConfig().equipments;
    });
    
    return equipments;
  }

  getCurrentPlayer(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    const players = Object.keys(this.roomNames[normalizedRoomId]);
    const currentTurn = this.roomConfigs[normalizedRoomId].turn;
    const currentPlayer = players[currentTurn];
    console.log(`getCurrentPlayer - Room: ${normalizedRoomId}, Players: [${players.join(', ')}], Turn: ${currentTurn}, Current Player: ${currentPlayer}`);
    return currentPlayer;
  }

  moveToNextTurn(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    const roomConfig = this.roomConfigs[normalizedRoomId];
    const players = Object.keys(this.roomNames[normalizedRoomId]);
    const alivePlayers = players.filter(player => this.roomNames[normalizedRoomId][player].isAlive);
    
    console.log(`🔄 [TURN] Moving to next turn. Current turn: ${roomConfig.turn}, Alive players: ${alivePlayers.length}`);
    
    if (alivePlayers.length <= 1) {
      console.log(`🔄 [TURN] Game over - not moving turn`);
      return; // Game over, no need to move turn
    }
    
    // Find next alive player
    let nextTurn = (roomConfig.turn + 1) % players.length;
    let attempts = 0;
    
    console.log(`🔄 [TURN] Starting from turn ${nextTurn}, checking ${players[nextTurn]}`);
    
    while (!this.roomNames[normalizedRoomId][players[nextTurn]].isAlive && attempts < players.length) {
      nextTurn = (nextTurn + 1) % players.length;
      attempts++;
      console.log(`🔄 [TURN] Player ${players[nextTurn]} is dead, trying next: ${nextTurn}`);
    }
    
    const oldTurn = roomConfig.turn;
    roomConfig.turn = nextTurn;
    console.log(`🔄 [TURN] Turn changed: ${oldTurn} → ${roomConfig.turn} (${players[roomConfig.turn]})`);
  }

  validateRoom(roomId) {
    // Normalize room ID to lowercase for consistent matching
    const normalizedRoomId = roomId.toLowerCase();
    if (!this.rooms[normalizedRoomId]) {
      throw createError(errorTypes.INVALID_ROOM, 'Room does not exist', 404);
    }
    return normalizedRoomId;
  }

  validatePlayer(player, roomName) {
    if (!player || !roomName[player]) {
      throw createError(errorTypes.INVALID_PLAYER, 'Player not found', 404);
    }
  }

  validateGameState(roomId) {
    if (!this.roomConfigs[roomId] || !this.roomConfigs[roomId].hasStarted) {
      throw createError(errorTypes.GAME_NOT_STARTED, 'Game has not started', 400);
    }
  }

  getRoomData(roomId) {
    const normalizedRoomId = roomId.toLowerCase();
    return {
      participants: this.rooms[normalizedRoomId] || [],
      memberNames: this.roomNames[normalizedRoomId] || {},
      roomConfig: this.roomConfigs[normalizedRoomId] || {}
    };
  }

  // Debug method to list all rooms
  listRooms() {
    console.log('=== ROOM DEBUG INFO ===');
    console.log('Total rooms:', Object.keys(this.rooms).length);
    console.log('Room IDs:', Object.keys(this.rooms));
    Object.keys(this.rooms).forEach(roomId => {
      console.log(`Room ${roomId}:`, {
        participants: this.rooms[roomId].length,
        members: Object.keys(this.roomNames[roomId] || {}),
        config: this.roomConfigs[roomId]
      });
    });
    console.log('========================');
  }
}

module.exports = GameStateManager;