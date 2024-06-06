import React, { useContext } from "react";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";

const AudioControls = () => {
  const { data, stream, peers, name } = useContext(RoomContext);
  const { roomId, members } = data;

  return (
    <div className="container h-screen flex justify-center items-center w-screen mx-auto p-10">
        <div className="bg-teal-100 p-6 rounded-lg shadow-lg h-4/5">
          <h2 className="text-teal-800 text-2xl font-bold mb-4">
            Room Id {roomId}
          </h2>
          <div className="space-y-4 my-2">
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

export default AudioControls;
