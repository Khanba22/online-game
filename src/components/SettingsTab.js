import React, { useState } from "react";
import AudioControls from "./AudioControls";

const SettingsTab = () => {
  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(!show);
  };

  return (
    <>
      <button
        onClick={handleShow}
        className="btn-primary absolute right-40 top-10 z-20"
      >
        Show
      </button>
      <div
        className={`h-full w-full absolute z-10 flex items-center justify-center backdrop-blur ${
          !show ? "hidden" : ""
        }`}
      >
        <AudioControls />
      </div>
    </>
  );
};

export default SettingsTab;
