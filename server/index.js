const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const port = 4000;
require("dotenv").config();
const cors = require("cors");
const { roomHandler } = require("./room/index");
const { gameHandler } = require("./game");

const server = http.createServer(app);
app.use(cors());
const rooms = {};
const roomName = {};
const roomConfig = {};
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send(`The Server is Active !`);
});

io.on("connection", (socket) => {
  roomHandler(socket, rooms, roomName, roomConfig);
  gameHandler(socket, rooms, roomName, roomConfig);
  socket.on("disconnect", () => {});
});

server.listen(4000, "0.0.0.0", () =>
  console.log("Server running on port 4000")
);

server.on("error", (err) => {
  console.error("Server Error:", err);
});
