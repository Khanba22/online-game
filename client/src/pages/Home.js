import React, { useCallback, useContext, useState, useEffect } from "react";
import { RoomContext } from "../contexts/socketContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { ws } = useContext(RoomContext);
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRoom = useCallback(() => {
    try {
      if (!ws) {
        setError('Connection not available');
        return;
      }
      setIsLoading(true);
      setError(null);
      ws.emit("create-room");
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room');
      setIsLoading(false);
    }
  }, [ws]);

  const joinRoom = useCallback(() => {
    try {
      if (!roomId || roomId.length !== 8) {
        setError('Please enter a valid 8-character room ID');
        return;
      }
      if (!ws) {
        setError('Connection not available');
        return;
      }
      setIsLoading(true);
      setError(null);
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room');
      setIsLoading(false);
    }
  }, [roomId, ws, navigate]);

  const handleRoomIdChange = useCallback((e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomId(value);
    setError(null);
  }, []);

  // Handle socket events
  useEffect(() => {
    if (!ws) return;

    const handleRoomCreated = (data) => {
      setIsLoading(false);
      navigate(`/room/${data.roomId}`);
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
      setError(error.message || 'Connection error');
      setIsLoading(false);
    };

    ws.on("room-created", handleRoomCreated);
    ws.on("error", handleError);

    return () => {
      ws.off("room-created", handleRoomCreated);
      ws.off("error", handleError);
    };
  }, [ws, navigate]);

  return (
    <div className="h-screen w-screen bg-black">
      <div className="home-screen container justify-center flex items-center">
        <div className="flex w-2/4 h-1/2 px-10 flex-col justify-evenly">
          <h1 className="text-slate-50 mb-10 text-center w-full cursor-none bg-transparent p-3 text-7xl from-red-700 foldit-bold">
            The Last Take
          </h1>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-200 text-center">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-700 transition duration-300 text-sm mx-auto block"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Room ID Input */}
          <div className="relative">
            <input
              className="text-slate-50 my-4 text-center border-none rounded-3xl w-full cursor-pointer bg-transparent border-slate-200 border-y-yellow-200 p-3 text-5xl from-red-700 foldit-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              type="text"
              placeholder="Enter Room Code"
              value={roomId}
              onChange={handleRoomIdChange}
              maxLength={8}
              disabled={isLoading}
            />
            {roomId.length > 0 && roomId.length < 8 && (
              <p className="text-yellow-400 text-sm text-center mt-2">
                {8 - roomId.length} characters remaining
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              disabled={roomId.length !== 8 || isLoading}
              className="w-full outline-none my-4 border-none p-3 text-5xl foldit-semibold disabled:opacity-50 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-3xl transition-all duration-300 disabled:cursor-not-allowed"
              onClick={joinRoom}
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
            
            <button
              disabled={isLoading}
              style={{border:"1px solid #f78fb3"}}
              className="w-full outline-none my-4 border-none rounded-3xl hover:bg-[#6363630f] p-3 text-5xl foldit-semibold disabled:opacity-50 transition-all duration-300 disabled:cursor-not-allowed"
              onClick={createRoom}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
