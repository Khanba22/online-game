import React from 'react';

const PlayerList = ({ playerData, myData, currentPlayer }) => {
  const players = Object.values(playerData || {});
  // Filter out myData from players to avoid duplicates
  const otherPlayers = players.filter(player => player.username !== myData.username);
  const allPlayers = [myData, ...otherPlayers];

  const renderHearts = (lives) => {
    const hearts = [];
    for (let i = 0; i < lives; i++) {
      hearts.push(
        <img 
          key={i} 
          src="/assets/heart.png" 
          alt="heart" 
          className="w-4 h-4" 
        />
      );
    }
    return hearts;
  };

  const getPlayerStatus = (player) => {
    if (player.lives <= 0) return 'eliminated';
    if (player.username === currentPlayer) return 'current';
    return 'alive';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'eliminated': return 'text-red-500';
      case 'current': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'eliminated': return 'ELIMINATED';
      case 'current': return 'YOUR TURN';
      default: return 'ALIVE';
    }
  };

  return (
    <div className="bg-black bg-opacity-80 backdrop-blur-sm border border-red-500 rounded-lg p-4 min-w-64">
      <h3 className="text-white text-lg font-bold mb-4 foldit-bold">Players</h3>
      
      <div className="space-y-3">
        {allPlayers.map((player, index) => {
          if (!player) return null;
          
          const status = getPlayerStatus(player);
          const isMe = player.username === myData.username;
          
          return (
            <div 
              key={player.username || index}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                status === 'current' 
                  ? 'border-yellow-400 bg-yellow-400 bg-opacity-10' 
                  : status === 'eliminated'
                  ? 'border-red-500 bg-red-500 bg-opacity-10'
                  : 'border-gray-600 bg-gray-600 bg-opacity-10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      status === 'eliminated' 
                        ? 'bg-red-500' 
                        : status === 'current'
                        ? 'bg-yellow-400'
                        : 'bg-green-400'
                    }`}
                  ></div>
                  <span className={`font-semibold ${isMe ? 'text-blue-400' : 'text-white'}`}>
                    {player.username} {isMe && '(You)'}
                  </span>
                </div>
                <span className={`text-xs font-bold ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {renderHearts(player.lives)}
                </div>
                <span className="text-xs text-gray-400">
                  {player.lives} lives
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList;
