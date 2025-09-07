const { handleSocketError } = require('../utils/errorHandler');

class GameEventHandler {
  constructor(gameStateManager) {
    this.gameStateManager = gameStateManager;
  }

  handleStartRound(socket, { roomId }) {
    try {
      const normalizedRoomId = roomId.toLowerCase();
      const roundData = this.gameStateManager.startRound(normalizedRoomId);
      
      socket.emit("round-started", roundData);
      socket.to(normalizedRoomId).emit("round-started", roundData);
    } catch (error) {
      handleSocketError(socket, error, 'round-start-error');
    }
  }

  handleShootPlayer(socket, { shooter, victim, roomId }) {
    try {
      const normalizedRoomId = roomId.toLowerCase();
      const shotData = this.gameStateManager.shootPlayer(normalizedRoomId, shooter, victim);
      
      socket.to(normalizedRoomId).emit("player-shot", shotData);
      socket.emit("player-shot", shotData);

      // Check for game over
      const gameOver = this.gameStateManager.checkGameOver(normalizedRoomId);
      if (gameOver) {
        socket.emit("game-over", gameOver);
        socket.to(normalizedRoomId).emit("game-over", gameOver);
        return;
      }

      // Check if round is over
      const roomConfig = this.gameStateManager.roomConfigs[normalizedRoomId];
      if (roomConfig.bulletArr.length === 0) {
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
      const equipmentData = this.gameStateManager.useEquipment(roomId, player, equipmentType);
      
      socket.to(roomId).emit("used-equipment", equipmentData);
    } catch (error) {
      handleSocketError(socket, error, 'equipment-error');
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
        const roomData = this.gameStateManager.getRoomData(roomId);
        const username = Object.keys(roomData.memberNames).find(
          name => roomData.memberNames[name]?.peerId === socket.id
        );

        if (username) {
          const disconnectData = this.gameStateManager.handleDisconnect(
            socket, 
            roomId, 
            socket.id, 
            username
          );
          
          socket.to(roomId).emit("user-disconnected", disconnectData);

          // Clean up empty rooms
          if (Object.keys(roomData.memberNames).length === 0) {
            delete this.gameStateManager.roomConfigs[roomId];
          }
        }
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  handleReconnect(socket, { roomId, userId }) {
    try {
      if (this.gameStateManager.disconnected[roomId]) {
        this.gameStateManager.roomConfigs[roomId] = this.gameStateManager.disconnected[roomId];
        delete this.gameStateManager.disconnected[roomId];

        socket.join(roomId);
        socket.emit("reconnected", { 
          roomConfig: this.gameStateManager.roomConfigs[roomId], 
          roomId 
        });
        socket.to(roomId).emit("user-reconnected", { user: userId });
      }
    } catch (error) {
      handleSocketError(socket, error, 'reconnect-error');
    }
  }

  registerEventHandlers(socket) {
    socket.on("start-round", (data) => this.handleStartRound(socket, data));
    socket.on("shoot-player", (data) => this.handleShootPlayer(socket, data));
    socket.on("use-equipment", (data) => this.handleUseEquipment(socket, data));
    socket.on("rotate", (data) => this.handleRotate(socket, data));
    socket.on("disconnect", () => this.handleDisconnect(socket));
    socket.on("reconnect-user", (data) => this.handleReconnect(socket, data));
  }
}

module.exports = GameEventHandler;
