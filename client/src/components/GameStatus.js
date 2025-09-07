import React from 'react';

const GameStatus = ({ turn, playerTurn, round }) => {
  return (
    <div className="flex items-center space-x-6 text-sm">
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">Round:</span>
        <span className="text-white font-bold">{round || 1}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">Turn:</span>
        <span className="text-white font-bold">{turn || 0}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">Shooter:</span>
        <span className="text-yellow-400 font-bold">
          {playerTurn || 'Waiting...'}
        </span>
      </div>
      
      {/* Turn indicator */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span className="text-yellow-400 text-xs">ACTIVE</span>
      </div>
    </div>
  );
};

export default GameStatus;
