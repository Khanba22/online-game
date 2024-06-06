import React, { useContext, useState } from "react";
import Room from "./Room";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";

const GamePage = () => {
  const { id } = useParams();
  const { ws, me, data, stream, peers, setName, name } =
    useContext(RoomContext);
  const { roomId, members, participants } = data;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative overflow-clip h-screen w-screen">
      <button
        className="absolute top-4 right-4 z-50 p-2 text-gray-700 bg-gray-200 rounded-md focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>

      <div className={`lg:flex lg:flex-row ${menuOpen ? "block" : "hidden"}`}>
        <div className="bg-teal-100 p-6 rounded-lg shadow-lg lg:w-1/4 inset-0 z-40">
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
        </div>
        <div className="flex-1 p-6">
          {/* Add any additional content for the game page here */}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
