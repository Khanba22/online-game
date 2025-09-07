import React, { useState } from 'react';

const GameControls = ({ isAdmin, onStartNextRound, onDebug }) => {
  const [showControls, setShowControls] = useState(false);

  return (
    <>
      {/* Control Toggle Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 right-4 z-50 bg-black bg-opacity-70 text-white p-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
        title="Toggle Controls"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Controls Panel */}
      {showControls && (
        <div className="absolute top-16 right-4 z-50 bg-black bg-opacity-90 backdrop-blur-sm border border-red-500 rounded-lg p-4 min-w-64">
          <h3 className="text-white text-lg font-bold mb-4 foldit-bold">Game Controls</h3>
          
          <div className="space-y-3">
            {/* Admin Controls */}
            {isAdmin && (
              <div className="border-t border-gray-600 pt-3">
                <h4 className="text-red-400 text-sm font-semibold mb-2">Admin Controls</h4>
                <button
                  onClick={onStartNextRound}
                  className="w-full bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300 text-sm"
                >
                  Start Next Round
                </button>
              </div>
            )}

            {/* Debug Controls */}
            <div className="border-t border-gray-600 pt-3">
              <h4 className="text-gray-400 text-sm font-semibold mb-2">Debug</h4>
              <button
                onClick={onDebug}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
              >
                Log Player Data
              </button>
            </div>

            {/* Game Instructions */}
            <div className="border-t border-gray-600 pt-3">
              <h4 className="text-gray-400 text-sm font-semibold mb-2">Instructions</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <p>• Use mouse to look around</p>
                <p>• Click to shoot when it's your turn</p>
                <p>• Use equipment from the bottom bar</p>
                <p>• Press X to unlock mouse</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameControls;
