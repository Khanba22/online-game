import React, { useEffect, useRef, useState } from "react";

const VideoPlayer = ({ stream, name , isAdmin ,you }) => {
  const [muted, setMute] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <>
      <video ref={videoRef} muted={muted} autoPlay></video>
      <div className="container">
        <h2>{!you?name:"You"} {isAdmin && "(Admin)"}</h2>
        <button
          onClick={() => {
            stream.getAudioTracks()[0].enabled = muted
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
