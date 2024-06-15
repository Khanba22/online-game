import React, { useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PointerLockControls,
  Box,
  Icosahedron,
} from "@react-three/drei";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import { RoomContext } from "../../contexts/socketContext";
import { useSelector } from "react-redux";

const Scene = () => {

 

  const { playerData, setPlayerData } = useContext(RoomContext);
  const { camera } = useThree();
  const data = useSelector((state) => state.myPlayerData);
  const { position } = data;
  useFrame(()=>{
    camera.position.set(...position)
  })
  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />
      {Object.keys(playerData).map((key, index) => {
        const player = playerData[key];
        if (player.lives === 0) {
          return (
            <Box
              key={index}
              position={player.position}
              userData={player}
              args={[1, 1, 1]}
            >
              <meshStandardMaterial attach="material" color="white" />
            </Box>
          );
        } else {
          return (
            <Box
              key={index}
              position={player.position}
              userData={player}
              args={[1, 1, 1]}
            >
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
      <RaycasterComponent
        camera={camera}
        playerData={playerData}
        setPlayerData={setPlayerData}
      />
      <PointerLockControls position={position} camera={camera} />
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

export default MainCanvas;
