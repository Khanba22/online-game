const { v4 } = require("uuid");
const colorArr = ["red", "blue", "green", "yellow", "pink"];
const positions = [
  [16,0,8],
  [10.472,0,15.608],
  [1.528,0,12.704],
  [1.528,0,3.296],
  [10.472,0,0.392],
];

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
          color: colorArr[roomConfig[roomId].memberNo],
          position: positions[roomConfig[roomId].memberNo],
        };
        roomName[roomId][username] = config;
        console.log(roomName[roomId]);
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
      roomConfig[roomId].hasStarted = true
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
