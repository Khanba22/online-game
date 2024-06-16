import React, { useContext, useEffect } from "react";
// import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";
import EquipmentBar from "../three/UIComponents/EquipmentBar";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment, reduceMyLife } from "../redux/PlayerDataReducer";
import { reduceLife } from "../redux/AllPlayerReducer";
import { updateGameTurn } from "../redux/GameConfig";

const GamePage = () => {
  // const { id } = useParams();
  const { ws, roomId, isAdmin } = useContext(RoomContext);
  const dispatch = useDispatch();
  const gameConfig = useSelector((state) => state.gameConfig);
  const { turn } = gameConfig;
  const data = useSelector((state) => state.myPlayerData);
  // const playerData = useSelector((state) => state.otherPlayerData);
  const { username } = data;

  const shotPlayer = ({ shooter, victim, livesTaken, currentTurn }) => {

    dispatch({
      type: `${updateGameTurn}`,
      payload: {
        turn: currentTurn,
      },
    });
    if (victim === username) {
      dispatch({
        type: `${reduceMyLife}`,
        payload: {
          liveCount: livesTaken,
        },
      });
    }
    dispatch({
      type: `${reduceLife}`,
      payload: {
        user: victim,
        liveCount: livesTaken,
      },
    });
  };
  const roundStart = ({ bulletArr, equipments }) => {
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
    dispatch({
      type: `${addEquipment}`,
      payload: {
        equipment: equipments[username],
      },
    });
  };

  useEffect(() => {
    ws.on("player-shot", shotPlayer);
    ws.on("round-started", roundStart);

    return () => {
      ws.off("round-started", roundStart);
      ws.off("player-shot", shotPlayer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <MainCanvas turn={turn} />
      </div>
      {isAdmin && <button onClick={startNextRound}>Start Next Round</button>}
      <button
        className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
        onClick={() => {
          console.log({...data,...gameConfig});
        }}
      >
        Log My Data
      </button>
      <h1>Current Turn {turn}</h1>
    </>
  );
};

export default GamePage;
