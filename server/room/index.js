const { v4 } = require("uuid");

const colorArr = ["red", "blue", "green", "black", "purple"];

const playerPositionArr = {
  1: {
    position: [[2.5, 0.19, 2.5]],
    angle: [[0, 0.7, 0]],
  },
  2: {
    position: [
      [2.5, 0.19, 2.5],
      [-2.5, 0.19, -2.5],
    ],
    angle: [
      [0, 0.7, 0],
      [0, -2.2, 0],
    ],
  },
  3: {
    position: [
      [3.4, 0.19, -0.5],
      [-2.5, 0.19, -2.5],
      [-1.5, 0.19, 3],
    ],
    angle: [
      [0, 1.5, 0],
      [0, -2.4, 0],
      [0, -0.4, 0],
    ],
  },
  4: {
    position: [
      [2.5, 0.19, 2.5],
      [-2.5, 0.19, -2.5],
      [-2, 0.19, 2.5],
      [2.3, 0.19, -2.5],
    ],
    angle: [
      [0, 0.7, 0],
      [0, -2.4, 0],
      [0, -0.7, 0],
      [0, 2.4, 0],
    ],
  },
  5: {
    position: [
      [3.3, 0.19, 0.0],
      [0.99, 0.19, 3.24],
      [-2.59, 0.19, 1.88],
      [1.19, 0.19, -3.18],
      [-3.04, 0.19, -1.99],
    ],
    angle: [
      [0, 1.5, 0],
      [0, 0.3, 0],
      [0, -0.7, 0],
      [0, 2.7, 0],
      [0, -2.2, 0],
    ],
  },
};

const defaultConfig = {
  lives: 5,
  equipment: {
    shield: 0,
    doubleDamage: 0,
    heals: 0,
    looker: 0,
    doubleTurn: 0,
  },
  isShielded: false,
  hasDoubleDamage: false,
  canLookBullet: false,
  hasDoubleTurn: false,
};

const disconnected = {};

const roomHandler = (socket, rooms, roomName, roomConfig) => {
  const createRoom = () => {
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

  const joinRoom = async ({ roomId, peerId, username }) => {
    if (rooms[roomId] && !roomConfig[roomId].hasStarted) {
      socket.join(roomId);
      if (!rooms[roomId].includes(peerId)) {
        const config = {
          username,
          color: colorArr[roomConfig[roomId].memberNo],
          ...defaultConfig,
        };
        roomName[roomId][username] = config;
        rooms[roomId].push(peerId);
        roomConfig[roomId].memberNo += 1;

        socket.to(roomId).emit("user-joined", { peerId, username });
        socket.emit("get-users", {
          roomId,
          participants: rooms[roomId],
          memberNames: roomName[roomId],
        });
        socket.to(roomId).emit("get-users", {
          roomId,
          participants: rooms[roomId],
          memberNames: roomName[roomId],
        });
      }
    } else if (rooms[roomId] && roomConfig[roomId].hasStarted) {
      console.log("Game has Already Started");
      console.log(disconnected[roomId]);
      if (disconnected[roomId][username]) {
        console.log("Disconnected User Trying To Reconnect");
      }
    } else {
      socket.emit("invalid-room", { roomId });
    }

    socket.on("start-request", ({ roomId }) => {
      const members = Object.keys(roomName[roomId]);
      const { memberNo } = roomConfig[roomId];
      for (let i = 0; i < memberNo; i++) {
        roomName[roomId][members[i]].position =
          playerPositionArr[memberNo].position[i];
        roomName[roomId][members[i]].rotation =
          playerPositionArr[memberNo].angle[i];
      }

      socket.to(roomId).emit("get-users", {
        roomId,
        participants: rooms[roomId],
        memberNames: roomName[roomId],
      });
      socket.emit("get-users", {
        roomId,
        participants: rooms[roomId],
        memberNames: roomName[roomId],
      });

      roomConfig[roomId].hasStarted = true;
      socket.to(roomId).emit("start-game", { roomId });
      socket.emit("start-game", { roomId });
    });

    socket.on("disconnect", () => {
      try {
        rooms[roomId] = rooms[roomId].filter((id) => id !== peerId);
        if (disconnected[roomId]) {
          disconnected[roomId] = {
            ...disconnected[roomId],
            username: roomName[roomId][username],
          };
        } else {
          disconnected[roomId] = { [username]: roomName[roomId][username] };
        }
        delete roomName[roomId][username];
        console.log("User Disconnected:", roomName[roomId]);
        socket.to(roomId).emit("user-disconnected", {
          peerId,
          members: roomName[roomId],
          username,
        });
      } catch (error) {
        console.error(error);
      }
    });
  };

  socket.on("create-room", createRoom);
  socket.on("join-room", joinRoom);
};

module.exports = { roomHandler };
