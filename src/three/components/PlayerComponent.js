import { Box, Icosahedron } from "@react-three/drei";
import React from "react";
import { Player } from "./Player";
import { Chair } from "./Chair";

const PlayerComponent = ({ player }) => {
  return (
    <>
      {!player.lives <= 0 ? (
        <>
          <Player
            position={player.position}
            rotation={player.angle}
            userData={player}
            args={[1, 1, 1]}
          >
            <meshStandardMaterial attach="material" color={player.color} />
          </Player>
        </>
      ) : (
        <>
          <Icosahedron
            position={player.position}
            userData={player}
            args={[1, 1, 1]}
          >
            <meshStandardMaterial attach="material" color={player.color} />
          </Icosahedron>
        </>
      )}
    </>
  );
};

export default PlayerComponent;
