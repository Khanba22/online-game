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
      // Live bullet - player is eliminated
      this.roomNames[normalizedRoomId][victim].isAlive = false;
      this.roomNames[normalizedRoomId][victim].lives = 0;
      
      // Move to next turn
      this.moveToNextTurn(normalizedRoomId);
      
      return {
        shooter,
        victim,
        isLive: true,
        isBulletLive: true,
        eliminated: victim,
        livesTaken: 1,
        turn: roomConfig.turn,
        currentTurn: roomConfig.turn,
        playerTurn: this.getCurrentPlayer(normalizedRoomId),
        bulletArr: roomConfig.bulletArr
      };
    } else {
      // Fake bullet - player survives
      
      // Move to next turn
      this.moveToNextTurn(normalizedRoomId);
      
      return {
        shooter,
        victim,
        isLive: false,
        isBulletLive: false,
        eliminated: null,
        livesTaken: 0,
        turn: roomConfig.turn,
        currentTurn: roomConfig.turn,
        playerTurn: this.getCurrentPlayer(normalizedRoomId),
        bulletArr: roomConfig.bulletArr
      };
    }
  }

  useEquipment(roomId, player, equipmentType) {
    const normalizedRoomId = this.validateRoom(roomId);
    this.validateGameState(normalizedRoomId);

    const playerData = this.roomNames[normalizedRoomId][player];
    if (!playerData.equipments[equipmentType]) {
      throw createError(errorTypes.INVALID_EQUIPMENT, 'Equipment not available');
    }

    playerData.equipments[equipmentType] -= 1;

    return {
      player,
      equipmentType,
      remaining: playerData.equipments[equipmentType]
    };
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
        knife: 1,
        magnifyingGlass: 1
      }
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
    
    if (alivePlayers.length <= 1) {
      return; // Game over, no need to move turn
    }
    
    // Find next alive player
    let nextTurn = (roomConfig.turn + 1) % players.length;
    let attempts = 0;
    
    while (!this.roomNames[normalizedRoomId][players[nextTurn]].isAlive && attempts < players.length) {
      nextTurn = (nextTurn + 1) % players.length;
      attempts++;
    }
    
    roomConfig.turn = nextTurn;
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