// Debug utility for tracking game state changes
export const debugLogger = {
  // Log game state changes
  logStateChange: (action, data) => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [DEBUG ${timestamp}] ${action}:`, data);
  },

  // Log Redux actions
  logReduxAction: (action, payload) => {
    console.log(`🔄 [REDUX] ${action}:`, payload);
  },

  // Log socket events
  logSocketEvent: (event, data, direction = 'OUT') => {
    const arrow = direction === 'OUT' ? '📤' : '📥';
    console.log(`${arrow} [SOCKET ${direction}] ${event}:`, data);
  },

  // Log player state
  logPlayerState: (playerName, state) => {
    console.log(`👤 [PLAYER ${playerName}] State:`, {
      lives: state.lives,
      isShielded: state.isShielded,
      hasDoubleDamage: state.hasDoubleDamage,
      canLookBullet: state.canLookBullet,
      hasDoubleTurn: state.hasDoubleTurn,
      equipment: state.equipment
    });
  },

  // Log game events flow
  logEventFlow: (step, data) => {
    console.log(`🔄 [EVENT FLOW] ${step}:`, data);
  }
};

// Enhanced console logging for development
if (process.env.NODE_ENV === 'development') {
  window.debugLogger = debugLogger;
  console.log('🔍 Debug logger available as window.debugLogger');
}
