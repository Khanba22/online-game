import React, { Suspense } from "react";
import { Chair } from "./Chair";
import { PlayerFinal } from "./PlayerFinal";
import { useSelector } from "react-redux";
import { GunHand } from "./GunHand";

const PlayerMapper = ({ playerData, turn, camera, username }) => {
  const { playerTurn } = useSelector((state) => state.gameConfig);
  return (
    <Suspense fallback={null}>
      {playerData.map((player, i) => (
        <>
          {i !== 0 ? (
            <PlayerFinal
              userData={{ ...player }}
              camera={camera}
              isMe={username === player.username}
              key={`player${i}`}
              {...player}
              isMyTurn={playerTurn === player.username}
            />
          ) : (
            <GunHand
              userData={{ ...player }}
              camera={camera}
              isMe={username === player.username}
              key={`player${i}`}
              {...player}
              isMyTurn={playerTurn === player.username}
            />
          )}
          <Chair key={`chair${i}`} userData={{ ...player }} {...player} />
        </>
      ))}
    </Suspense>
  );
};

export default PlayerMapper;
