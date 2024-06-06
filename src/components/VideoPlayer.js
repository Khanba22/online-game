import React, { useEffect, useRef, useState } from "react";
import { microphone, muteMic, speaker, speakerMute } from "../assets/index";

const VideoPlayer = ({ stream, name, isAdmin, you }) => {
  const [muted, setMute] = useState(true);
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(10); // Change initial volume to be in the range 0-10

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 10;
    setVolume(newVolume * 10); // Store volume in the range 0-10
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 10; // Set volume in the range 0-1 for the video element
    }
  }, [volume]);

  return (
    <div className="flex items-center p-4 space-x-4 border-b border-gray-200">
      <video
        ref={videoRef}
        muted={muted || you}
        autoPlay
        className="w-1/4 h-auto -z-10"
      ></video>
      <div className="flex items-center justify-between flex-1">
        <h2 className="text-xl font-semibold">
          {!you ? name : "You"} {isAdmin && "(Admin)"}
        </h2>
        <input
          type="range"
          value={volume}
          min={0}
          max={10}
          step={1}
          onChange={handleVolumeChange}
        />
        <button
          className="p-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={() => {
            stream.getAudioTracks()[0].enabled = muted;
            setMute(!muted);
          }}
        >
          <div className="h-6 aspect-square">
            {!you ? (
              <img src={muted ? microphone : muteMic} alt="Microphone Icon" />
            ) : (
              <img src={muted ? speaker : speakerMute} alt="Speaker Icon" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
