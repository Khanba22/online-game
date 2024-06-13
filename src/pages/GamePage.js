import React, { useContext, useEffect } from "react";
// import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";
import EquipmentBar from "../three/UIComponents/EquipmentBar";

const GamePage = () => {
  // const { id } = useParams();
  const { ws, roomId, isAdmin } = useContext(RoomContext);

  const startNextRound = () => {
    ws.emit("start-round", { roomId });
  };



  return (
    <>
      {/* <SettingsTab show={show} handleShow={handleShow} /> */}
      <div className="h-screen w-screen absolute">
        <EquipmentBar/>
      </div>
      <div className="h-screen w-screen">
        <MainCanvas />
      </div>
      {isAdmin && <button onClick={startNextRound}>Start Next Round</button>}
    </>
  );
};

export default GamePage;
