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
      const equipmentData = this.equipmentManager.useEquipment(normalizedRoomId, player, equipmentType);
      
      // Handle skip turn if it's a skip equipment
      if (equipmentData.skipTurn) {
        const turnData = this.roundManager.handleSkipTurn(normalizedRoomId, player, equipmentData.skipCount);
        equipmentData.currentTurn = turnData.currentTurn;
        equipmentData.playerTurn = turnData.playerTurn;
        equipmentData.skipCount = turnData.skipCount;
      }
      
      console.log(`📤 [GAME HANDLER] Broadcasting used-equipment to room ${normalizedRoomId}:`, {
        user: equipmentData.user,
        equipment: equipmentData.equipment,
        lives: equipmentData.lives,
        message: equipmentData.message
      });
      
      socket.to(normalizedRoomId).emit("used-equipment", equipmentData);
      socket.emit("used-equipment", equipmentData);
    } catch (error) {
      handleSocketError(socket, error, 'equipment-error');
    }
  }

  handleLookBullet(socket, { roomId, player }) {
    try {
      console.log(`👁️ [GAME HANDLER] Processing look-bullet: ${player} in room ${roomId}`);
      const normalizedRoomId = roomId.toLowerCase();
      const lookData = this.equipmentManager.lookAtBullet(normalizedRoomId, player);
      
      console.log(`📤 [GAME HANDLER] Broadcasting bullet-looked to ${player}:`, lookData);
      
      socket.emit("bullet-looked", lookData);
      socket.to(normalizedRoomId).emit("player-used-looker", {
        player,
        message: `${player} used looker!`
      });
    } catch (error) {
      handleSocketError(socket, error, 'looker-error');
    }
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

  registerEventHandlers(socket) {
    socket.on("start-round", (data) => this.handleStartRound(socket, data));
    socket.on("shoot-player", (data) => this.handleShootPlayer(socket, data));
    socket.on("use-equipment", (data) => this.handleUseEquipment(socket, data));
    socket.on("look-bullet", (data) => this.handleLookBullet(socket, data));
    socket.on("rotate", (data) => this.handleRotate(socket, data));
    socket.on("disconnect", () => this.handleDisconnect(socket));
    socket.on("reconnect-user", (data) => this.handleReconnect(socket, data));
  }
}

module.exports = GameEventHandler;
