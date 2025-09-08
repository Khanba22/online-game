const { createError, errorTypes } = require('../utils/errorHandler');

class RoomManager {
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
    
    console.log(`🏠 [ROOM MANAGER] Room created: ${roomId}. Total rooms: ${Object.keys(this.rooms).length}`);
    console.log(`🏠 [ROOM MANAGER] Available rooms: ${Object.keys(this.rooms).join(', ')}`);
    console.log(`🏠 [ROOM MANAGER] Room data:`, {
      rooms: this.rooms,
      roomNames: this.roomNames,
      roomConfigs: this.roomConfigs
    });
    return roomId;
  }

  joinRoom(socket, roomId, peerId, username) {
    console.log(`🏠 [ROOM MANAGER] Attempting to join room ${roomId}. Available rooms: ${Object.keys(this.rooms).join(', ')}`);
    console.log(`🏠 [ROOM MANAGER] Room data before join:`, {
      rooms: this.rooms,
      roomNames: this.roomNames,
      roomConfigs: this.roomConfigs
    });
    const normalizedRoomId = this.validateRoom(roomId);
    console.log(`🏠 [ROOM MANAGER] Normalized room ID: ${normalizedRoomId}`);

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
    
    console.log(`🏠 [ROOM MANAGER] User ${username} joined room ${normalizedRoomId}`);
    console.log(`🏠 [ROOM MANAGER] Room data after join:`, {
      rooms: this.rooms,
      roomNames: this.roomNames,
      roomConfigs: this.roomConfigs
    });
    
    return {
      roomId: normalizedRoomId,
      playerData: this.roomNames[normalizedRoomId][username]
    };
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
        
        console.log(`User ${username} disconnected from room ${normalizedRoomId}`);
        console.log(`Room ${normalizedRoomId} now has ${this.roomConfigs[normalizedRoomId].memberNo} members`);
      }
    }
  }

  handleReconnect(socket, roomId, peerId, username) {
    const normalizedRoomId = this.validateRoom(roomId);
    
    if (this.disconnected[normalizedRoomId]?.[username]) {
      // Restore user data
      this.roomNames[normalizedRoomId][username] = {
        ...this.disconnected[normalizedRoomId][username],
        peerId
      };
      delete this.disconnected[normalizedRoomId][username];
      
      socket.join(normalizedRoomId);
      console.log(`User ${username} reconnected to room ${normalizedRoomId}`);
      
      return {
        roomId: normalizedRoomId,
        playerData: this.roomNames[normalizedRoomId][username]
      };
    }
    
    throw createError(errorTypes.CONNECTION_ERROR, 'No disconnected user found to reconnect');
  }

  getRoomData(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    return {
      participants: this.roomConfigs[normalizedRoomId].memberNo,
      members: Object.keys(this.roomNames[normalizedRoomId]),
      config: this.roomConfigs[normalizedRoomId]
    };
  }

  getAllRooms() {
    return Object.keys(this.rooms).map(roomId => ({
      roomId,
      ...this.getRoomData(roomId)
    }));
  }

  getRoomPlayers(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    return this.roomNames[normalizedRoomId];
  }

  getRoomConfig(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    return this.roomConfigs[normalizedRoomId];
  }

  updateRoomConfig(roomId, updates) {
    const normalizedRoomId = this.validateRoom(roomId);
    this.roomConfigs[normalizedRoomId] = {
      ...this.roomConfigs[normalizedRoomId],
      ...updates
    };
  }

  getPlayerColor(memberNo) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors[memberNo % colors.length];
  }

  getDefaultPlayerConfig() {
    return {
      isAlive: true,
      lives: 3,
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

  validateRoom(roomId) {
    // Normalize room ID to lowercase for consistent matching
    const normalizedRoomId = roomId.toLowerCase();
    if (!this.rooms[normalizedRoomId]) {
      throw createError(errorTypes.ROOM_NOT_FOUND, 'Room not found');
    }
    return normalizedRoomId;
  }

  // Fix players with invalid lives values
  fixPlayerLives(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    const players = this.roomNames[normalizedRoomId];

    Object.keys(players).forEach(player => {
      if (typeof players[player].lives !== 'number' || players[player].lives < 0) {
        console.log(`Fixing invalid lives for player ${player}: ${players[player].lives} -> 3`);
        players[player].lives = 3;
      }
    });
  }

  // Generate equipment for all players in a room
  generateEquipments(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    const members = Object.keys(this.roomNames[normalizedRoomId]);
    const equipments = {};
    
    members.forEach(member => {
      equipments[member] = this.getDefaultPlayerConfig().equipments;
    });
    
    return equipments;
  }

  // Debug method to log room information
  debugRoomInfo(roomId) {
    const normalizedRoomId = this.validateRoom(roomId);
    console.log(`=== ROOM DEBUG INFO ===`);
    console.log(`Total rooms: ${Object.keys(this.rooms).length}`);
    console.log(`Room IDs: [ ${Object.keys(this.rooms).join(', ')} ]`);
    console.log(`Room ${normalizedRoomId}:`, this.getRoomData(normalizedRoomId));
    console.log(`========================`);
  }

  // Update player state
  updatePlayerState(roomId, username, newState) {
    const normalizedRoomId = this.validateRoom(roomId);
    if (this.roomNames[normalizedRoomId][username]) {
      this.roomNames[normalizedRoomId][username] = {
        ...this.roomNames[normalizedRoomId][username],
        ...newState
      };
      return true;
    }
    return false;
  }
}

module.exports = RoomManager;
