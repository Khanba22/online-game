import React from 'react';
import EquipmentBar from '../three/UIComponents/EquipmentBar';
import Stats from '../three/UIComponents/Stats';
import SettingsTab from './SettingsTab';
import PlayerList from './PlayerList';
import GameStatus from './GameStatus';

const GameHUD = ({ 
  turn, 
  lives, 
  round, 
  playerTurn, 
  playerData, 
  myData 
}) => {
  return (
    <>
      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="bg-black bg-opacity-80 backdrop-blur-sm border-b border-red-500">
          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center space-x-4">
              <h1 className="text-white text-xl font-bold foldit-bold">
                The Last Take
              </h1>
              <GameStatus 
                turn={turn}
                playerTurn={playerTurn}
                round={round}
              />
            </div>
            <SettingsTab />
          </div>
        </div>
      </div>

      {/* Left Side - Player List */}
      <div className="absolute left-4 top-20 z-40">
        <PlayerList 
          playerData={playerData}
          myData={myData}
          currentPlayer={playerTurn}
        />
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        {/* Equipment Bar */}
        <div className="mb-4">
          <EquipmentBar />
        </div>
        
        {/* Stats Bar */}
        <div className="bg-black bg-opacity-80 backdrop-blur-sm border-t border-red-500">
          <Stats 
            turn={turn} 
            lives={lives} 
            playerTurn={playerTurn} 
            round={round} 
          />
        </div>
      </div>

      {/* Crosshair overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="w-4 h-4 border-2 border-white rounded-full">
          <div className="w-1 h-1 bg-red-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </>
  );
};

export default GameHUD;
