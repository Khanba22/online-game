import React, { Suspense } from "react";
import { Chair } from "./Chair";
import { PlayerFinal } from "./PlayerFinal";
import { useSelector } from "react-redux";
import { GunHand } from "./GunHand";
import { useGLTF, useAnimations, Icosahedron } from "@react-three/drei";

const PlayerMapper = ({ playerData, turn, camera, username }) => {
  const { playerTurn } = useSelector((state) => state.gameConfig);
  return (
    <Suspense fallback={null}>
      {playerData.map((player, i) => {
        const isMe = player.username === username;
        const isMyTurn = player.username === playerTurn
        return <>
          <Icosahedron position={player.cameraOffset} scale={0.1} />
          {isMyTurn && isMe ? (
            <GunHand
              userData={{ ...player }}
              camera={camera}
              isMe={isMe}
              key={`player${i}`}
              {...player}
            />
          ) : (
            <PlayerFinal
              userData={{ ...player }}
              camera={camera}
              isMe={isMe}
              key={`player${i}`}
              {...player}
              isMyTurn={isMyTurn}
            />
          )}
          <Chair key={`chair${i}`} userData={{ ...player }} {...player} />
        </>;
      })}
    </Suspense>
  );
};

export default PlayerMapper;
