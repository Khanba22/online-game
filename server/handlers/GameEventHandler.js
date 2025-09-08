const { handleSocketError } = require('../utils/errorHandler');
const RoomManager = require('../managers/RoomManager');
const EquipmentManager = require('../managers/EquipmentManager');
const RoundManager = require('../managers/RoundManager');

class GameEventHandler {
  constructor(roomManager, equipmentManager, roundManager) {
    this.roomManager = roomManager;
    this.equipmentManager = equipmentManager;
    this.roundManager = roundManager;
  }

  handleStartRound(socket, { roomId }) {
    try {
      console.log(`🎮 [GAME HANDLER] Starting round for room: ${roomId}`);
      console.log(`🎮 [GAME HANDLER] Available rooms:`, Object.keys(this.roomManager.rooms));
      
      const normalizedRoomId = roomId.toLowerCase();
      console.log(`🎮 [GAME HANDLER] Normalized room ID: ${normalizedRoomId}`);
      
      const roundData = this.roundManager.startRound(normalizedRoomId);
      
      socket.emit("round-started", roundData);
      socket.to(normalizedRoomId).emit("round-started", roundData);
    } catch (error) {
      console.error(`🎮 [GAME HANDLER] Error starting round:`, error);
      handleSocketError(socket, error, 'round-start-error');
    }
  }

  handleShootPlayer(socket, { shooter, victim, roomId }) {
    try {
      console.log(`🎯 [GAME HANDLER] Processing shoot: ${shooter} → ${victim} in room ${roomId}`);
      const normalizedRoomId = roomId.toLowerCase();
      const shotData = this.roundManager.shootPlayer(normalizedRoomId, shooter, victim);
      
      console.log(`📤 [GAME HANDLER] Broadcasting player-shot to room ${normalizedRoomId}:`, {
        victim: shotData.victim,
        victimLives: shotData.victimLives,
        livesTaken: shotData.livesTaken,
        isBulletLive: shotData.isBulletLive
      });
      
      socket.to(normalizedRoomId).emit("player-shot", shotData);
      socket.emit("player-shot", shotData);

      // Check for game over
      const gameOver = this.roundManager.checkGameOver(normalizedRoomId);
      if (gameOver) {
        socket.emit("game-over", gameOver);
        socket.to(normalizedRoomId).emit("game-over", gameOver);
        return;
      }

      // Check if round is over
      if (this.roundManager.isRoundOver(normalizedRoomId)) {
        socket.emit("round-over");
        socket.to(normalizedRoomId).emit("round-over");
        
        // Start next round after delay
        setTimeout(() => {
          this.handleStartRound(socket, { roomId: normalizedRoomId });
        }, 5000);
      }
    } catch (error) {
      handleSocketError(socket, error, 'shoot-error');
    }
  }

  handleUseEquipment(socket, { roomId, player, equipmentType }) {
    try {
      console.log(`⚙️ [GAME HANDLER] Processing equipment: ${player} using ${equipmentType} in room ${roomId}`);
      const normalizedRoomId = roomId.toLowerCase();
      
      // Debug room and player existence
      console.log(`🔍 [DEBUG] Room exists: ${!!this.roomManager.rooms[normalizedRoomId]}`);
      console.log(`🔍 [DEBUG] Room names exists: ${!!this.roomManager.roomNames[normalizedRoomId]}`);
      console.log(`🔍 [DEBUG] Player exists: ${!!this.roomManager.roomNames[normalizedRoomId]?.[player]}`);
      
      const equipmentData = this.equipmentManager.useEquipment(normalizedRoomId, player, equipmentType);
      
      // Handle skip turn if it's a skip equipment
      if (equipmentData.skipTurn) {
        const turnData = this.roundManager.handleSkipTurn(normalizedRoomId, player, equipmentData.skipCount);
        equipmentData.currentTurn = turnData.currentTurn;
        equipmentData.playerTurn = turnData.playerTurn;
        equipmentData.skipCount = turnData.skipCount;
      }
      
      // Get updated player data after equipment usage
      const updatedPlayerData = this.roomManager.getPlayerState(normalizedRoomId, player);
      equipmentData.playerState = updatedPlayerData;
      
      console.log(`📤 [GAME HANDLER] Broadcasting used-equipment to room ${normalizedRoomId}:`, {
        user: equipmentData.user,
        equipment: equipmentData.equipment,
        lives: equipmentData.lives,
        message: equipmentData.message,
        playerState: equipmentData.playerState
      });
      
      socket.to(normalizedRoomId).emit("used-equipment", equipmentData);
      socket.emit("used-equipment", equipmentData);
    } catch (error) {
      console.error(`❌ [GAME HANDLER] Equipment error for ${player} using ${equipmentType}:`, error);
      console.error(`❌ [GAME HANDLER] Error details:`, {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      handleSocketError(socket, error, 'equipment-error');
    }
  }

  handleLookBullet(socket, { roomId, player }) {
    // DEPRECATED: Looker equipment now handled via use-equipment
    console.log(`⚠️ [DEPRECATED] look-bullet event received - use use-equipment instead`);
    handleSocketError(socket, 
      new Error('look-bullet event is deprecated. Use use-equipment with equipmentType: "looker" instead'), 
      'looker-error'
    );
  }

  handleRotate(socket, { rotation, username, roomId }) {
    try {
      socket.to(roomId).emit("rotation", { username, rotation });
    } catch (error) {
      handleSocketError(socket, error, 'rotation-error');
    }
  }

  handleDisconnect(socket) {
    try {
      const userRooms = Array.from(socket.rooms).filter(roomId => roomId !== socket.id);
      
      userRooms.forEach((roomId) => {
        this.roomManager.handleDisconnect(socket, roomId);
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  handleReconnect(socket, { roomId, peerId, username }) {
    try {
      const result = this.roomManager.handleReconnect(socket, roomId, peerId, username);
      socket.emit("reconnected", result);
    } catch (error) {
      handleSocketError(socket, error, 'reconnect-error');
    }
  }

  // Individual equipment handlers
  handleUseShield(socket, { roomId, player }) {
    this.handleEquipmentUsage(socket, roomId, player, "shield");
  }

  handleUseDoubleDamage(socket, { roomId, player }) {
    this.handleEquipmentUsage(socket, roomId, player, "doubleDamage");
  }

  handleUseHeals(socket, { roomId, player }) {
    this.handleEquipmentUsage(socket, roomId, player, "heals");
  }

  handleUseLooker(socket, { roomId, player }) {
    this.handleEquipmentUsage(socket, roomId, player, "looker");
  }

  handleUseDoubleTurn(socket, { roomId, player }) {
    this.handleEquipmentUsage(socket, roomId, player, "doubleTurn");
  }

  handleUseSkip(socket, { roomId, player }) {
    this.handleEquipmentUsage(socket, roomId, player, "skip");
  }

  // Generic equipment usage handler
  handleEquipmentUsage(socket, roomId, player, equipmentType) {
    try {
      console.log(`⚙️ [EQUIPMENT HANDLER] ${player} using ${equipmentType} in room ${roomId}`);
      const normalizedRoomId = roomId.toLowerCase();
      
      // Debug room and player existence
      console.log(`🔍 [DEBUG] Room exists: ${!!this.roomManager.rooms[normalizedRoomId]}`);
      console.log(`🔍 [DEBUG] Room names exists: ${!!this.roomManager.roomNames[normalizedRoomId]}`);
      console.log(`🔍 [DEBUG] Player exists: ${!!this.roomManager.roomNames[normalizedRoomId]?.[player]}`);
      
      const equipmentData = this.equipmentManager.useEquipment(normalizedRoomId, player, equipmentType);
      
      // Handle skip turn if it's a skip equipment
      if (equipmentData.skipTurn) {
        const turnData = this.roundManager.handleSkipTurn(normalizedRoomId, player, equipmentData.skipCount);
        equipmentData.currentTurn = turnData.currentTurn;
        equipmentData.playerTurn = turnData.playerTurn;
        equipmentData.skipCount = turnData.skipCount;
      }
      
      // Get updated player data after equipment usage
      const updatedPlayerData = this.roomManager.getPlayerState(normalizedRoomId, player);
      equipmentData.playerState = updatedPlayerData;
      
      console.log(`📤 [EQUIPMENT HANDLER] Broadcasting ${equipmentType} usage to room ${normalizedRoomId}:`, {
        user: equipmentData.user,
        equipment: equipmentData.equipment,
        lives: equipmentData.lives,
        message: equipmentData.message,
        playerState: equipmentData.playerState
      });
      
      // Emit specific equipment used event
      const usedEvent = `used-${equipmentType}`;
      socket.to(normalizedRoomId).emit(usedEvent, equipmentData);
      socket.emit(usedEvent, equipmentData);
      
      // Also emit general used-equipment for backward compatibility
      socket.to(normalizedRoomId).emit("used-equipment", equipmentData);
      socket.emit("used-equipment", equipmentData);
    } catch (error) {
      console.error(`❌ [EQUIPMENT HANDLER] ${equipmentType} error for ${player}:`, error);
      console.error(`❌ [EQUIPMENT HANDLER] Error details:`, {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      handleSocketError(socket, error, 'equipment-error');
    }
  }

  registerEventHandlers(socket) {
    socket.on("start-round", (data) => this.handleStartRound(socket, data));
    socket.on("shoot-player", (data) => this.handleShootPlayer(socket, data));
    socket.on("use-equipment", (data) => this.handleUseEquipment(socket, data));
    socket.on("look-bullet", (data) => this.handleLookBullet(socket, data));
    socket.on("rotate", (data) => this.handleRotate(socket, data));
    socket.on("disconnect", () => this.handleDisconnect(socket));
    socket.on("reconnect-user", (data) => this.handleReconnect(socket, data));
    
    // Individual equipment event handlers
    socket.on("use-shield", (data) => this.handleUseShield(socket, data));
    socket.on("use-doubleDamage", (data) => this.handleUseDoubleDamage(socket, data));
    socket.on("use-heals", (data) => this.handleUseHeals(socket, data));
    socket.on("use-looker", (data) => this.handleUseLooker(socket, data));
    socket.on("use-doubleTurn", (data) => this.handleUseDoubleTurn(socket, data));
    socket.on("use-skip", (data) => this.handleUseSkip(socket, data));
  }
}

module.exports = GameEventHandler;
