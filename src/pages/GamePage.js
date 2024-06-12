import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";

const GamePage = () => {
  const { id } = useParams();
  const { ws, me, stream, peers, setName, name, roomId, isAdmin } =
    useContext(RoomContext);

  const [show, setShow] = useState(false);

  const startNextRound = () => {
    ws.emit("start-round", { roomId });
  };

  useEffect(() => {
    ws.on("round-started", ({ bulletArr }) => {
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
    });
  }, [ws]);

  const handleShow = () => {
    setShow(!show);
  };

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
