import React, { useEffect, useRef, useState } from "react";


const VideoPlayer = ({ stream, name, isAdmin, you }) => {
  const [muted, setMute] = useState(true);
  const videoRef = useRef(null);
  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <div className="flex items-center p-4 space-x-4 border-b border-gray-200">
      <video
        ref={videoRef}
        muted={muted}
        autoPlay
        className="w-1/4 h-auto -z-10"
      ></video>
      <div className="flex items-center justify-between flex-1">
        <h2 className="text-xl font-semibold">
          {!you ? name : "You"} {isAdmin && "(Admin)"}
        </h2>
        <button
          className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={() => {
            stream.getAudioTracks()[0].enabled = muted;
            setMute(!muted);
          }}
        >
          {!muted ? <img src="" alt="" /> : "Unmute"}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
