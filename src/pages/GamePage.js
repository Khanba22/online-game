import React, { useContext } from "react";
import Room from "./Room";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";

const GamePage = () => {
  const { id } = useParams();
  const { ws, me, data, stream, peers, setName, name } =
    useContext(RoomContext);
  const { roomId, members, participants } = data;

  return (
    <div>
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
        </div>
    </div>
  );
};

export default GamePage;
