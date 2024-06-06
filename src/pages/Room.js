import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import AudioControls from "../components/AudioControls";

const Room = () => {
  const { id } = useParams();
  const { setName, name, joined, setJoined } = useContext(RoomContext);
  const { ws, me, data, } = useContext(RoomContext);
  const { roomId, members } = data;
  const startGame = () => {
    ws.emit("start-request", { roomId });
  };
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (joined) {
      setIsAdmin(members[0] === name);
    }
  }, [joined, name, members]);
  useEffect(() => {
    if (me && joined) {
      ws.emit("join-room", { roomId: id, peerId: me._id, name });
    }
  }, [id, me, ws, joined, name]);

  return (
    <>
      {joined ? (
        <>
          <AudioControls />
          {isAdmin && (
            <button
              className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
              onClick={startGame}
            >
              Start Game
            </button>
          )}
        </>
      ) : (
        <div className="bg-teal-100 p-6 rounded-lg shadow-lg">
          <label htmlFor="name" className="text-teal-800 font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="block w-full p-2 mb-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
            onClick={() => setJoined(true)}
          >
            Join Room
          </button>
        </div>
      )}
    </>
  );
};

export default Room;
