import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Box, Icosahedron } from "@react-three/drei";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import { useSelector } from "react-redux";
import PlayerComponent from "../components/PlayerComponent";



const Scene = () => {
  const { camera } = useThree();
  const data = useSelector((state) => state.myPlayerData);
  const playerData = useSelector((state) => state.otherPlayerData);
  const { position } = data;

  useFrame(() => {
    camera.position.set(...position);
  });

  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />
      {Object.keys(playerData).map((key) => {
        const player = playerData[key];
        return <PlayerComponent key={key} player={player} />;
      })}
      <Icosahedron
        userData={{ lives: 10 }}
        position={[0, 5, -5]}
        args={[1, 1, 1]}
      >
        <meshStandardMaterial attach="material" color="orange" />
      </Icosahedron>
      <RaycasterComponent camera={camera} playerData={playerData} />
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

export default MainCanvas;
