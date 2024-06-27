import React, { useContext, useEffect } from "react";
// import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";
import EquipmentBar from "../three/UIComponents/EquipmentBar";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment, reduceMyLife } from "../redux/PlayerDataReducer";
import { reduceLife } from "../redux/AllPlayerReducer";
import {
  removeBullet,
  setBulletArr,
  updateGameTurn,
} from "../redux/GameConfig";
import { toast } from "react-toastify";

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
      type: `${removeBullet}`,
    });
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
    var index = 3;
    var liveCount = 0;
    bulletArr.forEach((bullet) => {
      if (bullet) {
        liveCount += 1;
      }
    });
    const interVal = setInterval(() => {
      if (index !== 0) {
        toast.info(`Round Starting In ${index}`);
      }
      if (index === 0) {
        clearInterval(interVal);
        toast.info(
          `Starting Next Round, Live Bullets : ${liveCount} , Fake Bullets : ${
            bulletArr.length - liveCount
          }`
        );
      }
      index--;
    }, 1000);

    dispatch({
      type: `${setBulletArr}`,
      payload: {
        bulletArr: bulletArr,
      },
    });
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
      <EquipmentBar />
      <MainCanvas turn={turn} />
      {isAdmin && <button onClick={startNextRound}>Start Next Round</button>}
      <button
        className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
        onClick={() => {
          console.log({ ...data, ...gameConfig });
        }}
      >
        Log My Data
      </button>
      <h1>Current Turn {turn}</h1>
    </>
  );
};

export default GamePage;
