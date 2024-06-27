const { v4 } = require("uuid");
const colorArr = ["red", "blue", "green", "black", "purple"];
const positions = [
  [-1.7, 1.5, 1.7],
  [0.8, 1.5, 3.2],
  [3.7, 1.5, 1],
  [2.4, 1.5, -2.4],
  [-1.4, 1.5, -2],
];

const playerPositionArr = {
  2: {
    position: [
      [3.2, 0.0, 1.95],
      [-3.2, 3.91886975727153e-16, 1.95],
    ],
    angle: [
      [0, 3.141592653589793, 0],
      [0, 0.0, 0],
    ],
  },
  3: {
    position: [
      [3.2, 0.0, 1.95],
      [-1.6000000000000005, 2.77163859753386, 1.95],
      [-1.599999999999999, -2.771638597533861, 1.95],
    ],
    angle: [
      [0, 3.141592653589793, 0],
      [0, 2.0943951023931957, 0],
      [0, -2.094395102393195, 0],
    ],
  },
  4: {
    position: [
      [3.2, 0.0, 1.95],
      [1.959434878635765e-16, 3.2, 1.95],
      [-3.2, 3.91886975727153e-16, 1.95],
      [-5.878304635907295e-16, -3.2, 1.95],
    ],
    angle: [
      [0, 3.141592653589793, 0],
      [0, 1.5707963267948966, 0],
      [0, 0.0, 0],
      [0, -1.5707963267948966, 0],
    ],
  },
  5: {
    position: [
      [3.2, 0.0, 1.95],
      [0.9890437907365466, 3.041785515479182, 1.95],
      [-2.5940437907365466, 1.878651166377898, 1.95],
      [-2.5940437907365475, -1.878651166377897, 1.95],
      [0.9890437907365458, -3.0417855154791825, 1.95],
    ],
    angle: [
      [0, 3.141592653589793, 0],
      [0, 2.5132741228718345, 0],
      [0, -2.8274333882308134, 0],
      [0, -0.3141592653589793, 0],
      [0, -0.6283185307179586, 0],
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
  const joinRoom = ({ roomId, peerId, username }) => {
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
        socket.to(roomId).emit("user-joined", { peerId });
        roomConfig[roomId].memberNo = roomConfig[roomId].memberNo + 1;
        socket.emit("user-joined", { peerId });
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
        console.log(roomName[roomId]);
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
