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
      [0.9890437907365466, 0.19, 3.241785515479182],
      [-2.5940437907365466, 0.19, 1.878651166377898],
      [1.1940437907365475, 0.19, -3.178651166377897],
      [-3.0417855154791825, 0.19, -1.9890437907365458],
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

const roomHandler = (socket, rooms, roomName, roomConfig) => {
  const createRoom = () => {
    const roomId = v4();
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
          username: username,
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
          color: colorArr[roomConfig[roomId].memberNo],
        };
        roomName[roomId][username] = config;
        rooms[roomId].push(peerId);
        roomConfig[roomId].memberNo = roomConfig[roomId].memberNo + 1;
        socket.to(roomId).emit("user-joined", { peerId , username });
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
    } else {
      socket.emit("invalid-room", { roomId });
    }

    socket.on("start-request", ({ roomId }) => {
      var arr = Object.keys(roomName[roomId]);
      for (let index = 0; index < roomConfig[roomId].memberNo; index++) {
        roomName[roomId][arr[index]].position =
          playerPositionArr[roomConfig[roomId].memberNo].position[index];
        roomName[roomId][arr[index]].angle =
          playerPositionArr[roomConfig[roomId].memberNo].angle[index];
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
        delete roomName[roomId][username];
        console.log("USer Diusconnected",roomName[roomId]);
        socket
          .to(roomId)
          .emit("user-disconnected", { peerId, members: roomName[roomId] });
      } catch (error) {}
    });
  };

  socket.on("create-room", createRoom);

  socket.on("join-room", joinRoom);
};

module.exports = { roomHandler };
