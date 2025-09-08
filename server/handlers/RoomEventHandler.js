const { handleSocketError } = require('../utils/errorHandler');
const RoomManager = require('../managers/RoomManager');

class RoomEventHandler {
  constructor(roomManager) {
    this.roomManager = roomManager;
  }

  handleCreateRoom(socket) {
    try {
      const roomId = this.roomManager.createRoom(socket);
      socket.emit("room-created", { roomId });
      console.log(`Room created: ${roomId} by socket ${socket.id}`);
      this.roomManager.debugRoomInfo(roomId); // Debug: list all rooms
    } catch (error) {
      console.error('Error creating room:', error);
      handleSocketError(socket, error, 'create-room-error');
    }
  }

  handleJoinRoom(socket, { roomId, peerId, username }) {
    try {
      console.log(`Attempting to join room: ${roomId} with username: ${username}`);
      this.roomManager.debugRoomInfo(roomId); // Debug: list all rooms before join
      const joinData = this.roomManager.joinRoom(socket, roomId, peerId, username);
      
      // Notify all users in the room about the new user
      socket.to(joinData.roomId).emit("user-joined", { peerId, username });
      
      // Send current room state to the joining user
      const roomData = this.roomManager.getRoomData(joinData.roomId);
      socket.emit("get-users", { 
        roomId: joinData.roomId, 
        participants: roomData.participants, 
        memberNames: this.roomManager.getRoomPlayers(joinData.roomId)
      });
      
      // Notify other users about the updated room state
      this.broadcastUsers(socket, joinData.roomId);
      
      console.log(`User ${username} joined room ${roomId}`);
      this.roomManager.debugRoomInfo(roomId); // Debug: list all rooms after join
      return joinData;
    } catch (error) {
      console.error('Error joining room:', error);
      this.roomManager.debugRoomInfo(roomId); // Debug: list all rooms on error
      handleSocketError(socket, error, 'join-room-error');
    }
  }

  handleStartGame(socket, { roomId }) {
    try {
      // Start game logic - this would be handled by GameEventHandler now
      this.broadcastUsers(socket, roomId);
      socket.to(roomId).emit("start-game", { roomId });
      socket.emit("start-game", { roomId });
      
      return { roomId };
    } catch (error) {
      handleSocketError(socket, error, 'start-game-error');
    }
  }

  handleDisconnect(socket) {
    try {
      const userRooms = Array.from(socket.rooms).filter(roomId => roomId !== socket.id);
      
      userRooms.forEach((roomId) => {
        this.roomManager.handleDisconnect(socket, roomId);
        socket.to(roomId).emit("user-disconnected", { roomId });
      });
    } catch (error) {
      console.error('Error handling room disconnect:', error);
    }
  }

  broadcastUsers(socket, roomId) {
    try {
      const roomData = this.roomManager.getRoomData(roomId);
      
      socket.to(roomId).emit("get-users", { 
        roomId, 
        participants: roomData.participants, 
        memberNames: this.roomManager.getRoomPlayers(roomId)
      });
      socket.emit("get-users", { 
        roomId, 
        participants: roomData.participants, 
        memberNames: this.roomManager.getRoomPlayers(roomId)
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
