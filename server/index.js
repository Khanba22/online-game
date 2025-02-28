const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const port = 8080;
const cors = require("cors");
const { roomHandler } = require("./room/index");
const { gameHandler } = require("./game");

const server = http.createServer(app);
app.use(cors);
const rooms = {};
const roomName = {};
const roomConfig = {};
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


app.get("/",(req,res)=>{
  res.send(`The Server is Active on ${process.env.HOST}`)
})

io.on("connection", (socket) => {
  roomHandler(socket,rooms,roomName,roomConfig);
  gameHandler(socket,rooms,roomName,roomConfig);
  socket.on("disconnect", () => {
  });
});

server.listen(port, () => {
  console.log(`Server Active on port ${port}`);
});
