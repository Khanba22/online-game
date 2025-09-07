import React, { useContext, useState, useCallback } from "react";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAudio } from "../hooks/useAudio";

const AudioControls = () => {
  const { roomId, peers, myPeerId, usernameRef, adminRef } =
    useContext(RoomContext);
  const playerData = useSelector((state) => state.otherPlayerData);
  const { isMuted, volume, toggleMute, setAudioVolume } = useAudio();
  const [error, setError] = useState(null);

  const copyRoomId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    } catch (error) {
      console.error('Failed to copy room ID:', error);
      toast.error("Failed to copy room ID");
      setError('Failed to copy room ID');
    }
  }, [roomId]);

  const handleVolumeChange = useCallback((e) => {
    try {
      const newVolume = parseFloat(e.target.value);
      setAudioVolume(newVolume);
    } catch (error) {
      console.error('Failed to set volume:', error);
      setError('Failed to set volume');
    }
  }, [setAudioVolume]);

  if (error) {
    return (
      <div className="h-full text-white flex justify-center w-full mx-auto">
        <div className="p-6 w-4/6 h-4/5 mt-20 rounded-lg shadow-lg bg-red-900 bg-opacity-50">
          <h1 className="text-4xl py-10 font-bold text-center text-red-400">Error</h1>
          <p className="text-center text-red-200 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full text-white flex justify-center w-full mx-auto">
      <div className="p-6 w-4/6 h-4/5 mt-20 rounded-lg shadow-lg bg-black bg-opacity-80">
        <h1 className="text-4xl py-10 font-bold text-center foldit-bold">Room</h1>
        
        {/* Room ID Section */}
        <div className="text-xl my-10 text-center">
          <span className="text-gray-300">Room ID: </span>
          <span className="font-mono text-yellow-400">{roomId}</span>
          <button
            onClick={copyRoomId}
            className="ml-4 bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
          >
            Copy
          </button>
        </div>

        {/* Audio Controls */}
        <div className="flex justify-center items-center space-x-6 mb-6">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg transition duration-300 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-700' 
                : 'bg-green-500 hover:bg-green-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
            <span className="text-sm text-gray-300">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-4 my-2">
          {Object.keys(peers).length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Waiting for players to join...</p>
            </div>
          ) : (
            Object.keys(peers).map((peerId, i) => {
              const isYou = peerId === myPeerId;
              const admin = Object.keys(playerData)[0];
              const myName =
                peers[peerId].username === "You"
                  ? usernameRef.current
                  : peers[peerId].username;
              adminRef.current = admin === myName;
              return (
                <VideoPlayer
                  you={isYou}
                  key={i}
                  isAdmin={admin === myName}
                  stream={peers[peerId].stream}
                  username={peers[peerId].username}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
