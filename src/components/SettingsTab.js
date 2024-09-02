import React, { useState } from "react";
import AudioControls from "./AudioControls";
import { cross, setting } from "../assets";

const SettingsTab = ({ show, handleShow }) => {
  return (
    <>
      <button
        onClick={handleShow}
        className="btn-primary absolute right-40 top-10 z-50 h-10 aspect-square"
      >
        <img src={show ? cross : setting} alt="" />
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
