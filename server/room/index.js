const { v4 } = require("uuid");
const rooms = {};
const roomName = {};
const roomConfig = {};

const roomHandler = (socket) => {
  const createRoom = () => {
    const roomId = v4();
    rooms[roomId] = [];
    roomName[roomId] = [];
    roomConfig[roomId] = {
      hasStarted: false,
    };
    socket.join(roomId);
    socket.emit("room-created", { roomId });
  };
  const joinRoom = ({ roomId, peerId, name }) => {
    if (rooms[roomId] && !roomConfig[roomId].hasStarted) {
      socket.join(roomId);
      if (!rooms[roomId].includes(peerId)) {
        roomName[roomId].push(name);
        rooms[roomId].push(peerId);
      }
      socket.to(roomId).emit("user-joined", { peerId });
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
    } else {
      socket.emit("invalid-room", { roomId });
    }

    socket.on("start-request", ({ roomId }) => {
      roomConfig[roomId] = {
        ...roomConfig[roomId],
        hasStarted: true,
      };
      socket.to(roomId).emit("start-game", { roomId });
      socket.emit("start-game", { roomId });
    });

    socket.on("disconnect", () => {
      rooms[roomId] = rooms[roomId].filter((id) => id !== peerId);
      roomName[roomId] = roomName[roomId].filter((id) => id !== name);
      socket
        .to(roomId)
        .emit("user-disconnected", { peerId, members: roomName[roomId] });
    });
  };

  socket.on("create-room", createRoom);

  socket.on("join-room", joinRoom);
};

module.exports = { roomHandler };
