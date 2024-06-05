import React, { useEffect, useRef, useState } from "react";

const VideoPlayer = ({ stream }) => {
  const [muted, setMute] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <>
      <video ref={videoRef} muted={muted} autoPlay></video>
      <button onClick={()=>{setMute(!muted)}}>{!muted?"Mute":"Unmute"}</button>
    </>
  );
};

export default VideoPlayer;
