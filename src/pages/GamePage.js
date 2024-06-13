import React, { useContext } from "react";
// import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";
import EquipmentBar from "../three/UIComponents/EquipmentBar";

const GamePage = () => {
  // const { id } = useParams();
  const { ws, roomId, isAdmin, myData, playerData } = useContext(RoomContext);

  const startNextRound = () => {
    ws.emit("start-round", { roomId });
  };

  return (
    <>
      {/* <SettingsTab show={show} handleShow={handleShow} /> */}
      <div className="h-screen w-screen absolute">
        <EquipmentBar />
      </div>
      <div className="h-screen w-screen">
        <MainCanvas />
      </div>
      {isAdmin && <button onClick={startNextRound}>Start Next Round</button>}
      <button
        className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
        onClick={() => {
          console.log(myData);
          console.log(playerData);
        }}
      >
        Log My Data
      </button>
    </>
  );
};

export default GamePage;
