// Debug utility for server-side logging
const debugLogger = {
  // Log game events with timestamps
  logGameEvent: (event, data) => {
    const timestamp = new Date().toISOString();
    console.log(`🎮 [GAME ${timestamp}] ${event}:`, data);
  },

  // Log room state changes
  logRoomState: (roomId, state) => {
    console.log(`🏠 [ROOM ${roomId}] State:`, {
      participants: Object.keys(state.roomStats || {}).length,
      turn: state.roomConfig?.turn,
      bulletCount: state.roomConfig?.bulletArr?.length || 0,
      players: Object.keys(state.roomStats || {}).map(player => ({
        name: player,
        lives: state.roomStats[player]?.lives,
        isAlive: state.roomStats[player]?.lives > 0
      }))
    });
  },

  // Log player actions
  logPlayerAction: (player, action, data) => {
    console.log(`👤 [PLAYER ${player}] ${action}:`, data);
  },

  // Log socket events
  logSocketEvent: (event, data, socketId) => {
    console.log(`🔌 [SOCKET ${socketId}] ${event}:`, data);
  },

  // Log state transitions
  logStateTransition: (from, to, data) => {
    console.log(`🔄 [STATE] ${from} → ${to}:`, data);
  },

  // Log errors with context
  logError: (context, error, data = {}) => {
    console.error(`❌ [ERROR ${context}]:`, error, data);
  }
};

module.exports = debugLogger;
