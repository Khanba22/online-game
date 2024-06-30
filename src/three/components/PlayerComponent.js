import { Icosahedron } from "@react-three/drei";
import React, { useRef } from "react";
import { Player } from "./Player";
import { Chair } from "./Chair";
import { useFrame } from "react-three-fiber";

const PlayerComponent = ({ playerData, id }) => {
  const player = playerData;

  return (
    <>
      {player.lives > 0 ? (
        <>
          <Player
            position={player.position}
            rotation={player.angle}
            userData={player}
          >
            <meshStandardMaterial attach="material" color={player.color} />
          </Player>
          <Chair
            position={player.position}
            rotation={player.angle}
            userData={player}
            args={[1, 1, 1]}
          >
            <meshStandardMaterial attach="material" color={player.color} />
          </Chair>
        </>
      ) : (
        <Icosahedron
          position={player.position}
          userData={player}
          args={[1, 1, 1]}
        >
          <meshStandardMaterial attach="material" color={player.color} />
        </Icosahedron>
      )}
    </>
  );
};

export default PlayerComponent;
