class GameError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.name = 'GameError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const errorTypes = {
  INVALID_ROOM: 'INVALID_ROOM',
  ROOM_FULL: 'ROOM_FULL',
  GAME_NOT_STARTED: 'GAME_NOT_STARTED',
  INVALID_PLAYER: 'INVALID_PLAYER',
  INVALID_EQUIPMENT: 'INVALID_EQUIPMENT',
  INVALID_TURN: 'INVALID_TURN',
  NO_BULLETS: 'NO_BULLETS',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  GAME_STATE_ERROR: 'GAME_STATE_ERROR'
};

const createError = (type, message, statusCode = 400) => {
  return new GameError(message, type, statusCode);
};

const handleSocketError = (socket, error, event = 'error') => {
  console.error(`Socket error in ${event}:`, error);
  
  if (error instanceof GameError) {
    socket.emit(event, {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
  } else {
    socket.emit(event, {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    });
  }
};

const validateRoom = (roomId, rooms) => {
  if (!rooms[roomId]) {
    throw createError(errorTypes.INVALID_ROOM, 'Room does not exist', 404);
  }
  return true;
};

const validatePlayer = (player, roomName) => {
  if (!player || !roomName[player]) {
    throw createError(errorTypes.INVALID_PLAYER, 'Player not found', 404);
  }
  return true;
};

const validateGameState = (roomConfig, roomId) => {
  if (!roomConfig[roomId] || !roomConfig[roomId].hasStarted) {
    throw createError(errorTypes.GAME_NOT_STARTED, 'Game has not started', 400);
  }
  return true;
};

module.exports = {
  GameError,
  errorTypes,
  createError,
  handleSocketError,
  validateRoom,
  validatePlayer,
  validateGameState
};
