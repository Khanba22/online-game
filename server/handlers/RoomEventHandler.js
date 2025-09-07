const { handleSocketError } = require('../utils/errorHandler');

class RoomEventHandler {
  constructor(gameStateManager) {
    this.gameStateManager = gameStateManager;
  }

  handleCreateRoom(socket) {
    try {
      const roomId = this.gameStateManager.createRoom(socket);
      socket.emit("room-created", { roomId });
      console.log(`Room created: ${roomId} by socket ${socket.id}`);
      this.gameStateManager.listRooms(); // Debug: list all rooms
    } catch (error) {
      console.error('Error creating room:', error);
      handleSocketError(socket, error, 'create-room-error');
    }
  }

  handleJoinRoom(socket, { roomId, peerId, username }) {
    try {
      console.log(`Attempting to join room: ${roomId} with username: ${username}`);
      this.gameStateManager.listRooms(); // Debug: list all rooms before join
      const joinData = this.gameStateManager.joinRoom(socket, roomId, peerId, username);
      
      // Notify all users in the room about the new user
      socket.to(roomId).emit("user-joined", { peerId, username });
      
      // Send current room state to the joining user
      const roomData = this.gameStateManager.getRoomData(roomId);
      socket.emit("get-users", { 
        roomId, 
        participants: roomData.participants, 
        memberNames: roomData.memberNames 
      });
      
      // Notify other users about the updated room state
      this.broadcastUsers(socket, roomId);
      
      console.log(`User ${username} joined room ${roomId}`);
      this.gameStateManager.listRooms(); // Debug: list all rooms after join
      return joinData;
    } catch (error) {
      console.error('Error joining room:', error);
      this.gameStateManager.listRooms(); // Debug: list all rooms on error
      handleSocketError(socket, error, 'join-room-error');
    }
  }

  handleStartGame(socket, { roomId }) {
    try {
      const startData = this.gameStateManager.startGame(roomId);
      
      this.broadcastUsers(socket, roomId);
      socket.to(roomId).emit("start-game", { roomId });
      socket.emit("start-game", { roomId });
      
      return startData;
    } catch (error) {
      handleSocketError(socket, error, 'start-game-error');
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
        }
      });
    } catch (error) {
      console.error('Error handling room disconnect:', error);
    }
  }

  broadcastUsers(socket, roomId) {
    try {
      const roomData = this.gameStateManager.getRoomData(roomId);
      
      socket.to(roomId).emit("get-users", { 
        roomId, 
        participants: roomData.participants, 
        memberNames: roomData.memberNames 
      });
      socket.emit("get-users", { 
        roomId, 
        participants: roomData.participants, 
        memberNames: roomData.memberNames 
      });
    } catch (error) {
      console.error('Error broadcasting users:', error);
    }
  }

  registerEventHandlers(socket) {
    socket.on("create-room", () => this.handleCreateRoom(socket));
    socket.on("join-room", (data) => this.handleJoinRoom(socket, data));
    socket.on("start-request", (data) => this.handleStartGame(socket, data));
    socket.on("disconnecting", () => this.handleDisconnect(socket));
  }
}

module.exports = RoomEventHandler;
