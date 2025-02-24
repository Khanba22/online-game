const { v4 } = require("uuid");

const colorArr = ["red", "blue", "green", "black", "purple"];
const playerPositionArr = require("../data/positionConfig.json");

const defaultConfig = {
  lives: 5,
  equipment: {
    shield: 0,
    doubleDamage: 0,
    heals: 0,
    looker: 0,
    doubleTurn: 0,
  },
  neckRotation: [0, 0, 0],
  isShielded: false,
  hasDoubleDamage: false,
  canLookBullet: false,
  hasDoubleTurn: false,
};

const disconnected = {}; // Store disconnected user data

const createRoom = (socket, rooms, roomName, roomConfig) => {
  const roomId = v4().split("-")[0];
  rooms[roomId] = [];
  roomName[roomId] = {};
  roomConfig[roomId] = {
    turn: 0,
    rounds: 3,
    memberNo: 0,
    hasStarted: false,
  };

  socket.join(roomId);
  socket.emit("room-created", { roomId });
};

const joinRoom = (socket, rooms, roomName, roomConfig) => async ({ roomId, peerId, username }) => {
  if (!rooms[roomId]) {
    socket.emit("invalid-room", { roomId });
    return;
  }

  socket.join(roomId);
  
  // Check if user is reconnecting
  if (disconnected[roomId]?.[username]) {
    roomName[roomId][username] = disconnected[roomId][username];
    delete disconnected[roomId][username];
    console.log(`${username} reconnected in room ${roomId}`);
  } else if (!roomName[roomId][username]) {
    // New user joining the game
    roomName[roomId][username] = {
      username,
      color: colorArr[roomConfig[roomId].memberNo],
      ...defaultConfig,
    };
    rooms[roomId].push(peerId);
    roomConfig[roomId].memberNo += 1;
  }

  socket.to(roomId).emit("user-joined", { peerId, username });
  broadcastUsers(socket, roomId, rooms, roomName);
};

const startGame = (socket, rooms, roomName, roomConfig) => ({ roomId }) => {
  if (!roomName[roomId]) return;

  const members = Object.keys(roomName[roomId]);
  const { memberNo } = roomConfig[roomId];

  for (let i = 0; i < memberNo; i++) {
    if (playerPositionArr[memberNo]) {
      roomName[roomId][members[i]].position = playerPositionArr[memberNo].position[i];
      roomName[roomId][members[i]].rotation = playerPositionArr[memberNo].rotation[i];
      roomName[roomId][members[i]].cameraOffset = playerPositionArr[memberNo].cameraOffset[i];
    }
  }

  broadcastUsers(socket, roomId, rooms, roomName);
  roomConfig[roomId].hasStarted = true;
  socket.to(roomId).emit("start-game", { roomId });
  socket.emit("start-game", { roomId });
};

const handleDisconnect = (socket, rooms, roomName, roomConfig) => (roomId, peerId, username) => {
  if (!rooms[roomId]) return;

  rooms[roomId] = rooms[roomId].filter((id) => id !== peerId);
  socket.leave(roomId);

  if (!disconnected[roomId]) {
    disconnected[roomId] = {};
  }
  disconnected[roomId][username] = roomName[roomId][username];

  delete roomName[roomId][username];

  console.log(`User ${username} disconnected from room ${roomId}`);

  socket.to(roomId).emit("user-disconnected", {
    peerId,
    members: roomName[roomId],
    username,
  });
};

const broadcastUsers = (socket, roomId, rooms, roomName) => {
  const participants = rooms[roomId] || [];
  const memberNames = roomName[roomId] || {};

  socket.to(roomId).emit("get-users", { roomId, participants, memberNames });
  socket.emit("get-users", { roomId, participants, memberNames });
};

const roomHandler = (socket, rooms, roomName, roomConfig) => {
  socket.on("create-room", () => createRoom(socket, rooms, roomName, roomConfig));
  socket.on("join-room", joinRoom(socket, rooms, roomName, roomConfig));
  socket.on("start-request", startGame(socket, rooms, roomName, roomConfig));

  socket.on("disconnecting", () => {
    const [roomId] = Array.from(socket.rooms).filter((id) => id !== socket.id);
    if (roomId) {
      const peerId = rooms[roomId]?.find((id) => id === socket.id);
      const username = Object.keys(roomName[roomId] || {}).find(
        (name) => roomName[roomId][name]?.peerId === peerId
      );

      if (username) {
        handleDisconnect(socket, rooms, roomName, roomConfig)(roomId, peerId, username);
      }
    }
  });
};

module.exports = { roomHandler };
