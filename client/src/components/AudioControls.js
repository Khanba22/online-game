import React, { useContext } from "react";
import { RoomContext } from "../contexts/socketContext";
import VideoPlayer from "../components/VideoPlayer";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AudioControls = () => {
  const { roomId, peers, myPeerId, usernameRef, adminRef } =
    useContext(RoomContext);
  const playerData = useSelector((state) => state.otherPlayerData);
  return (
    <div className="h-full text-white flex justify-center w-full mx-auto">
      <div className="p-6 w-4/6 h-4/5 mt-20 rounded-lg shadow-lg">
        <h1 className="text-4xl py-10 font-bold text-center">Room</h1>
        <h2 className="text-xl my-10 text-center">
          {roomId}{" "}
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              toast.success("Copied To Clipboard");
            }}
          >
            copy
          </button>
        </h2>
        <div className="space-y-4 my-2">
          {Object.keys(peers).map((peerId, i) => {
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
          })}
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
