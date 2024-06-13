import React, { useContext, useEffect } from "react";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";

const AudioControls = () => {
  const { roomId,playerData, stream, peers, name } = useContext(RoomContext);


  return (
    <div className="h-full flex justify-center w-screen mx-auto p-10">
      <div className="bg-teal-300 p-6 w-full h-4/5 mt-20 rounded-lg shadow-lg">
        <h2 className="text-teal-800 text-2xl font-bold mb-4">
          Room Id {roomId}
        </h2>
        <div className="space-y-4 my-2">
          {Object.values(peers).map((peer, i) => {
            const isYou = Object.keys(playerData)[i] === name;
            return (
              <VideoPlayer
                you={isYou}
                key={i}
                isAdmin={i === 0}
                stream={isYou ? stream : peer.stream}
                name={Object.keys(playerData)[i]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AudioControls;