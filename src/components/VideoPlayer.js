import React, { useEffect, useRef, useState } from "react";

const VideoPlayer = ({ stream, name , isAdmin }) => {
  const [muted, setMute] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <>
      <video ref={videoRef} muted={muted} autoPlay></video>
      <div className="container">
        <h2>{name} {isAdmin && "Admin"}</h2>
        <button
          onClick={() => {
            setMute(!muted);
          }}
        >
          {!muted ? "Mute" : "Unmute"}
        </button>
      </div>
    </>
  );
};

export default VideoPlayer;
