import React, { useContext, useEffect } from "react";
import { RoomContext } from "../contexts/socketContext";
import MainCanvas from "../three/Pages/MainCanvas";
import GameUI from "../three/UI/GameUI";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment, reduceMyLife } from "../redux/PlayerDataReducer";
import { reduceLife, usePlayerEquipment } from "../redux/AllPlayerReducer";
import {
  removeBulletArr,
  setBulletArr,
  updateGameTurn,
} from "../redux/GameConfig";
import { toast } from "react-toastify";
// import playerData from "../tempData/tempPlayerData.json";
// import data from "../tempData/tempMeData.json";

const GamePage = () => {
  const { ws, roomId, isAdmin } = useContext(RoomContext);
  const dispatch = useDispatch();
  const { turn, playerTurn } = useSelector((state) => state.gameConfig);
  const playerData = useSelector(state=>state.otherPlayerData)
  const data = useSelector(state=>state.myPlayerData)
  const { username, lives } = data;

  // Helper function to play sound
  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  // Handle player being shot
  const shotPlayer = ({
    shooter,
    isBulletLive,
    victim,
    livesTaken,
    currentTurn,
    playerTurn,
  }) => {
    playSound(
      isBulletLive ? "/sounds/gun_shoot.mp3" : "/sounds/fakeBullet.mp3"
    );
    toast.info(isBulletLive ? "Bullet Was Live" : "Bullet Was Fake");

    dispatch({ type: `${removeBulletArr}` });
    dispatch({
      type: `${updateGameTurn}`,
      payload: { playerTurn, turn: currentTurn },
    });

    if (victim === username) {
      dispatch({
        type: `${reduceMyLife}`,
        payload: { liveCount: livesTaken },
      });
    }

    dispatch({
      type: `${reduceLife}`,
      payload: { user: victim, liveCount: livesTaken },
    });
  };

  // Countdown function for round start
  const countdown = async (seconds, live, fakes) => {
    for (let i = seconds; i >= 0; i--) {
      if (i > 0) {
        toast.info(`Round Starting In ${i}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        toast.info(`Live Bullets: ${live}, Fake Bullets: ${fakes}`);
      }
    }
  };

  // Start a new round
  const roundStart = async (data) => {
    console.log("Received round-started event with data:", data);
    
    const { bulletArr, equipments, live, fakes, turn, playerTurn } = data;
  
    if (!equipments) {
      console.error("Error: Equipments is undefined on client!");
      return;
    }
  
    playSound("/sounds/countdown.mp3");
    console.log(equipments);
    await countdown(3, live, fakes);
  
    dispatch({
      type: `${updateGameTurn}`,
      payload: { turn, playerTurn },
    });
  
    dispatch({
      type: `${setBulletArr}`,
      payload: { bulletArr },
    });
    console.log(`Adding Equipments to ${username}`)
    dispatch({
      type: `${addEquipment}`,
      payload: { equipment: equipments[username] },
    });
  };
  

  // Handle round over
  const roundOver = () => {
    toast.info("Round Over");
    setTimeout(() => toast.info("Starting Next Round"), 1000);
  };

  // Handle equipment usage
  const usedEquipment = ({ user, equipment }) => {
    if (equipment === "heals") {
      dispatch({
        type: `${usePlayerEquipment}`,
        payload: { user, equipmentType: equipment },
      });
    }
    toast.info(`${user} Activated ${equipment}`);
  };

  useEffect(() => {
    ws.on("player-shot", shotPlayer);
    ws.on("round-started", roundStart);
    ws.on("round-over", roundOver);
    ws.on("used-equipment", usedEquipment);

    return () => {
      ws.off("player-shot", shotPlayer);
      ws.off("round-started", roundStart);
      ws.off("round-over", roundOver);
      ws.off("used-equipment", usedEquipment);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNextRound = () => {
    ws.emit("start-round", { roomId });
  };

  return (
    <>
      <GameUI turn={turn} playerTurn={playerTurn} lives={lives} round={0} />
      <MainCanvas turn={turn} playerTurn={playerTurn} />
      {isAdmin && (
        <button
          className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-300"
          onClick={startNextRound}
        >
          Start Next Round
        </button>
      )}
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        onClick={() => console.log(playerData)}
      >
        Log My Data
      </button>
      <h1>Current Turn: {turn}</h1>
    </>
  );
};

export default GamePage;
