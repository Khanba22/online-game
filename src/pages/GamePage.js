import React, { useContext, useEffect } from "react";
// import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";

const GamePage = () => {
  // const { id } = useParams();
  const { ws, roomId, isAdmin } = useContext(RoomContext);

  const startNextRound = () => {
    ws.emit("start-round", { roomId });
  };

  useEffect(() => {
    ws.on("round-started", ({ bulletArr, equipments }) => {
      var liveCount = 0;
      bulletArr.forEach((bullet) => {
        if (bullet) {
          liveCount += 1;
        }
      });
      console.log(
        `No Of Bullets : ${
          bulletArr.length
        }, Live Rounds : ${liveCount}, Fake Rounds : ${
          bulletArr.length - liveCount
        }`
      );
      console.log(equipments);
    });
  }, [ws]);

  return (
    <>
      {/* <SettingsTab show={show} handleShow={handleShow} /> */}

      <div className="h-screen w-screen">
        <MainCanvas />
      </div>
      {isAdmin && <button onClick={startNextRound}>Start Next Round</button>}
    </>
  );
};

export default GamePage;
