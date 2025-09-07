module.exports = {
  server: {
    port: process.env.PORT || 4000,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  
  socket: {
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB
    transports: ['websocket', 'polling']
  },
  
  game: {
    maxPlayers: 6,
    defaultLives: 5,
    equipmentPerRound: 2,
    maxRounds: 10,
    roundStartDelay: 5000,
    countdownDuration: 3
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.NODE_ENV !== 'production'
  }
};
