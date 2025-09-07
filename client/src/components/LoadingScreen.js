import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Spinning loader */}
          <div className="w-16 h-16 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Game title */}
          <h1 className="text-4xl font-bold text-white mb-2 foldit-bold">
            The Last Take
          </h1>
          
          {/* Loading text */}
          <p className="text-gray-300 text-lg mb-4">
            Loading Game...
          </p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
