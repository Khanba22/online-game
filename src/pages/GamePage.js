import React, { useContext, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";
import EquipmentBar from "../three/UIComponents/EquipmentBar";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment, reduceMyLife } from "../redux/PlayerDataReducer";
import { reduceLife, usePlayerEquipment } from "../redux/AllPlayerReducer";
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
  const { turn, playerTurn } = gameConfig;
  const data = useSelector((state) => state.myPlayerData);
  const { username, lives } = data;
  const playerData = useSelector((state) => state.otherPlayerData)

  const shotPlayer = ({
    shooter,
    isBulletLive,
    victim,
    livesTaken,
    currentTurn,
    playerTurn,
  }) => {
    const sound = isBulletLive
      ? "/sounds/gun_shoot.mp3"
      : "/sounds/fakeBullet.mp3";
    const audio = new Audio(sound);
    audio.play();
    toast.info(`${isBulletLive ? "Bullet Was Live" : "Bullet Was Fake"}`);
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

  const roundOver = () => {
    toast.info("Round Over");
    setTimeout(() => {
      toast.info("Starting Next Round");
    }, 1000);
  };

  const usedEquipment = ({ user, equipment }) => {
    if (equipment === "heals") {
      console.log(playerData[user] , "Equipment Used")
      dispatch({
        type: `${usePlayerEquipment}`,
        payload: {
          user: user,
          equipmentType: equipment,
        },
      });
      console.log()
    }
    toast.info(`${user} Activated ${equipment}`);
  };

  useEffect(() => {
    ws.on("player-shot", shotPlayer);
    ws.on("round-started", roundStart);
    ws.on("round-over", roundOver);
    ws.on("used-equipment", usedEquipment);
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
          console.log(playerData);
        }}
      >
        Log My Data
      </button>
      <h1>Current Turn {turn}</h1>
    </>
  );
};

export default GamePage;
