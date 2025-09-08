import React, { useContext, useEffect } from "react";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";
import { useSelector } from "react-redux";
import GameControls from "../components/GameControls";
import GameHUD from "../components/GameHUD";
import LoadingScreen from "../components/LoadingScreen";
import ErrorBoundary from "../components/ErrorBoundary";
import { useGameEvents } from "../hooks/useGameEvents";
import { useGameControls } from "../hooks/useGameControls";

const GamePage = () => {
  const { ws, roomId, isAdmin } = useContext(RoomContext);
  const { turn, playerTurn } = useSelector((state) => state.gameConfig);
  const playerData = useSelector(state => state.otherPlayerData);
  const data = useSelector(state => state.myPlayerData);
  const { username, lives } = data;

  // Use custom hooks
  const { gameError: eventsError, setGameError: setEventsError } = useGameEvents(ws, username);
  const { isLoading, gameError: controlsError, startNextRound, clearError } = useGameControls(ws, roomId);

  // Auto-start the first round when the game page loads
  useEffect(() => {
    if (ws && roomId && isAdmin) {
      const normalizedRoomId = roomId?.toLowerCase();
      console.log('🎮 [GAME PAGE] Auto-starting first round...');
      console.log('🎮 [GAME PAGE] Room ID:', normalizedRoomId);
      console.log('🎮 [GAME PAGE] Is Admin:', isAdmin);
      ws.emit("start-round", { roomId: normalizedRoomId });
    }
  }, [ws, roomId, isAdmin]);

  // Combine errors
  const gameError = eventsError || controlsError;

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen
  if (gameError) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Game Error</h2>
          <p className="mb-4">{gameError}</p>
          <button
            onClick={() => {
              clearError();
              setEventsError(null);
            }}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen relative overflow-hidden">
        <MainCanvas turn={turn} playerTurn={playerTurn} />
        <GameHUD 
          turn={turn} 
          playerTurn={playerTurn} 
          lives={lives} 
          round={0}
          playerData={playerData}
          myData={data}
        />
        <GameControls 
          isAdmin={isAdmin}
          onStartNextRound={startNextRound}
          onDebug={() => console.log(playerData)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default GamePage;
