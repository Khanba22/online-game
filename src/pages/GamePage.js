import React, { useContext, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";
import EquipmentBar from "../three/UIComponents/EquipmentBar";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment, reduceMyLife } from "../redux/PlayerDataReducer";
import { reduceLife } from "../redux/AllPlayerReducer";
import {
  removeBulletArr,
  setBulletArr,
  updateGameTurn,
} from "../redux/GameConfig";
import { toast } from "react-toastify";
import GameUI from "../three/UI/GameUI";

const GamePage = () => {
  // const { id } = useParams();
  const { ws, roomId, isAdmin } = useContext(RoomContext);
  const dispatch = useDispatch();
  const gameConfig = useSelector((state) => state.gameConfig);
  const { turn, bulletArr, playerTurn } = gameConfig;
  const data = useSelector((state) => state.myPlayerData);
  const { username, lives } = data;

  const shotPlayer = ({
    shooter,
    victim,
    livesTaken,
    currentTurn,
    playerTurn,
  }) => {
    const sound =
      livesTaken !== 0 ? "/sounds/gun_shoot.mp3" : "/sounds/fakeBullet.mp3";
    const audio = new Audio(sound);
    audio.play();
    console.log(livesTaken);
    toast.info(`${livesTaken !== 0 ? "Bullet Was Live" : "Bullet Was Fake"}`);
    dispatch({
      type: `${removeBulletArr}`,
    });
    dispatch({
      type: `${updateGameTurn}`,
      payload: {
        playerTurn: playerTurn,
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
  const roundStart = ({
    bulletArr,
    equipments,
    live,
    fakes,
    turn,
    playerTurn,
  }) => {
    const audio = new Audio("/sounds/countdown.mp3"); // Create an audio object
    setTimeout(() => {
      audio.play();
    }, 1000);
    var index = 3;
    console.log(playerTurn , "PLayer Turn in Round start")
    const interVal = setInterval(() => {
      if (index !== 0) {
        toast.info(`Round Starting In ${index}`);
      }
      if (index === 0) {
        clearInterval(interVal);
        toast.info(
          `Starting Next Round, Live Bullets : ${live} , Fake Bullets : ${fakes}`
        );
      }
      index--;
    }, 1000);
    dispatch({
      type: `${updateGameTurn}`,
      payload: {
        turn,
        playerTurn,
      },
    });
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
      <GameUI turn={turn} playerTurn={playerTurn} lives={lives} round={0} />
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
