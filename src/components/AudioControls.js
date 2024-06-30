import React, { useContext } from "react";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";
import { useSelector } from "react-redux";

const AudioControls = () => {
  const { roomId, peers, myPeerId, usernameRef , adminRef } = useContext(RoomContext);
  const playerData = useSelector((state) => state.otherPlayerData);
  return (
    <div className="h-full flex justify-center w-screen mx-auto p-10">
      <div className="bg-teal-300 p-6 w-full h-4/5 mt-20 rounded-lg shadow-lg">
        <h2 className="text-teal-800 text-2xl font-bold mb-4">
          Room Id {roomId}
        </h2>
        <div className="space-y-4 my-2">
          {Object.keys(peers).map((peerId, i) => {
            const isYou = peerId === myPeerId;
            const admin = Object.keys(playerData)[0];
            const myName = peers[peerId].username === "You"?usernameRef.current:peers[peerId].username;
            console.log(admin, myName, i);
            adminRef.current = admin === myName
            return (
              <VideoPlayer
                you={isYou}
                key={i}
                isAdmin={admin === myName}
                stream={peers[peerId].stream}
                username={peers[peerId].username}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
