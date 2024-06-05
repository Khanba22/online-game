const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const port = 8080;
const cors = require("cors");
const { roomHandler } = require("./room/index");

const server = http.createServer(app);
app.use(cors);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User Connected");

  roomHandler(socket);

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server Active on port ${port}`);
});
