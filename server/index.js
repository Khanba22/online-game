const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// Import our new modular components
const GameEventHandler = require("./handlers/GameEventHandler");
const RoomEventHandler = require("./handlers/RoomEventHandler");
const { handleSocketError } = require("./utils/errorHandler");
const logger = require("./utils/logger");
const config = require("./config/config");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Initialize shared managers
const RoomManager = require('./managers/RoomManager');
const EquipmentManager = require('./managers/EquipmentManager');
const RoundManager = require('./managers/RoundManager');

const roomManager = new RoomManager();
const equipmentManager = new EquipmentManager(roomManager);
const roundManager = new RoundManager(roomManager, equipmentManager);

// Initialize handlers with shared managers
const gameEventHandler = new GameEventHandler(roomManager, equipmentManager, roundManager);
const roomEventHandler = new RoomEventHandler(roomManager);

// Socket.IO configuration
const io = new Server(server, config.socket);

// Routes
app.get("/", (req, res) => {
  res.json({ 
    status: "Server is active", 
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    rooms: gameEventHandler.roomManager.getAllRooms().length
  });
});

// Socket connection handling
io.on("connection", (socket) => {
  logger.socketEvent(socket.id, 'connected');
  
  try {
    // Register event handlers
    roomEventHandler.registerEventHandlers(socket);
    gameEventHandler.registerEventHandlers(socket);
    
    // Handle connection errors
    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}`, { error: error.message, stack: error.stack });
      handleSocketError(socket, error, 'connection-error');
    });
    
    socket.on("disconnect", (reason) => {
      logger.socketEvent(socket.id, 'disconnected', { reason });
    });
    
  } catch (error) {
    logger.error(`Error setting up socket ${socket.id}`, { error: error.message, stack: error.stack });
    handleSocketError(socket, error, 'setup-error');
  }
});

// Server error handling
server.on("error", (err) => {
  logger.error("Server Error", { error: err.message, stack: err.stack });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(config.server.port, config.server.host, () => {
  logger.info(`Server running on ${config.server.host}:${config.server.port}`);
  logger.info(`Environment: ${config.server.environment}`);
});
