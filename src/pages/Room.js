import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";

const Room = () => {
  const { id } = useParams();
  const { ws, me, data, stream, peers, setName, name } =
    useContext(RoomContext);
  const [joined, setJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { roomId, members } = data;

  useEffect(() => {
    if (joined) {
      setIsAdmin(members[0] === name);
    }
  }, [joined, name, members]);

  const logData = () => {
    console.log(data);
  };

  const startGame = () => {
    ws.emit("start-request", { roomId });
  };

  useEffect(() => {
    if (me && joined) {
      ws.emit("join-room", { roomId: id, peerId: me._id, name });
    }
  }, [id, me, ws, joined, name]);
  return (
    <div className="container mx-auto p-4">
      {joined ? (
        <div className="bg-teal-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-teal-800 text-2xl font-bold mb-4">
            Room Id {roomId}
          </h2>
          <div className="space-y-4">
            {Object.values(peers).map((peer, i) => {
              const isYou = members[i] === name;
              return (
                <VideoPlayer
                  you={isYou}
                  key={i}
                  isAdmin={i === 0}
                  stream={isYou ? stream : peer.stream}
                  name={members[i]}
                />
              );
            })}
          </div>
          <div className="mt-6 space-x-4">
            <button
              className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
              onClick={logData}
            >
              Log Data
            </button>
            {isAdmin && (
              <button
                className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
                onClick={startGame}
              >
                Start Game
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-teal-100 p-6 rounded-lg shadow-lg">
          <label htmlFor="name" className="block text-teal-800 font-bold mb-2">
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
    </div>
  );
};

export default Room;
