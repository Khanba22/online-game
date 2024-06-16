import { Box, Icosahedron } from "@react-three/drei";
import React from "react";

const PlayerComponent = ({ player }) => {
  return (
    <>
      {!player.lives <= 0 ? (
        <>
          <Box position={player.position} userData={player} args={[1, 1, 1]}>
            <meshStandardMaterial attach="material" color={player.color} />
          </Box>
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
