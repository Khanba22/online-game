import React, { useContext, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls, Box, Icosahedron } from "@react-three/drei";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import tempData from "../../tempData.json"
import { RoomContext } from "../../contexts/socketContext";

const Scene = () => {
  const { playerData , setPlayerData } = useContext(RoomContext);
  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />
      {playerData.map((player,index) => {
        if (player.lives === 0) {
          return <Box key={index} position={player.position} userData={player} args={[1, 1, 1]}>
            <meshStandardMaterial attach="material" color="white" />
          </Box>;
        } else {
          return (
            <Box key={index} position={player.position} userData={player} args={[1, 1, 1]}>
              <meshStandardMaterial attach="material" color={player.color} />
            </Box>
          );
        }
      })}
      <Icosahedron
        userData={{ lives: 10 }}
        position={[0, 5, -5]}
        args={[1, 1, 1]}
      >
        <meshStandardMaterial attach="material" color="orange" />
      </Icosahedron>
      <RaycasterComponent playerData = {playerData} setPlayerData = {setPlayerData} />
      <PointerLockControls />
    </>
  );
};

const MainCanvas = () => {
  return (
    <div className="h-screen w-screen">
      <Canvas>
        <Scene />
      </Canvas>
      <Crosshair />
    </div>
  );
};

export default MainCanvas ;
