const { v4 } = require("uuid");
const rooms = {};
const roomName = {};

const roomHandler = (socket) => {
  const createRoom = () => {
    const roomId = v4();
    rooms[roomId] = [];
    roomName[roomId] = [];

    socket.join(roomId);
    socket.emit("room-created", { roomId });
    console.log("User Created Room");
  };
  const joinRoom = ({ roomId, peerId, name }) => {
    if (rooms[roomId]) {
      console.log(`User Joined The room ${roomId} PeerId = ${peerId}`);
      socket.join(roomId);
      if (!rooms[roomId].includes(peerId)) {
        roomName[roomId].push(name);
        rooms[roomId].push(peerId);
      }
      socket.to(roomId).emit("user-joined", { peerId });
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

    socket.on("disconnect", () => {
      rooms[roomId] = rooms[roomId].filter((id) => id !== peerId);
      roomName[roomId] = rooms[roomId].filter((id) => id !== name);
      socket.to(roomId).emit("user-disconnected", { peerId , name });
    });
  };

  socket.on("create-room", createRoom);

  socket.on("join-room", joinRoom);
};

module.exports = { roomHandler };
