import React, { useState } from "react";
import AudioControls from "./AudioControls";
import { cross, setting } from "../assets";

const SettingsTab = () => {
  const [show, setShow] = useState(false);

  const toggleShow = () => {
    setShow((prevShow) => !prevShow); // Use functional update to toggle state
  };

  return (
    <>
      <button
        onClick={toggleShow}
        className="btn-primary absolute right-40 top-10 z-50 h-10 aspect-square"
      >
        <img src={show ? cross : setting} alt="Settings toggle" />
      </button>
      <div className="h-full w-full absolute overflow-clip z-10 flex items-center justify-center ">
        <div className={`h-full w-full ${!show && "translate-x-full"} backdrop-blur`}>
          <AudioControls />
        </div>
      </div>
    </>
  );
};

export default SettingsTab;
