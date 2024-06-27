import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PointerLockControls,
  Box,
  Icosahedron,
  useGLTF,
  OrbitControls,
} from "@react-three/drei";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import { useSelector } from "react-redux";
import PlayerComponent from "../components/PlayerComponent";
import { Map } from "../components/Map";
import { Chair } from "../components/Chair";

const Scene = ({ turn }) => {
  const { camera, scene } = useThree();
  const data = useSelector((state) => state.myPlayerData);
  const playerData = useSelector((state) => state.otherPlayerData);
  const { position } = data;
  const myRef = useRef(null);

  useFrame(() => {
    if (position) {
      // Adjust the camera position based on player data
      // camera.position.set(position[0], position[1] + 1.5, position[2]);
    } else {
      // Default camera position
      // camera.position.set(-1.4, 3, -2);
    }
  });

  return (
    <>
      <ambientLight intensity={3} color={"#404040"} />
      <pointLight
        position={[0.76, 4, 0.1]}
        intensity={1}
        power={100}
        decay={1}
        castShadow
        color={"#FFDD99"}
      />
      <pointLight position={[0, 3.5, 0]} intensity={0.9} color={"#FFEECC"} />
      <pointLight position={[5.5, 3, 6.5]} intensity={0.4} color={"#505050"} />
      <pointLight position={[-5.5, 3, 6.5]} intensity={0.4} color={"#505050"} />
      <pointLight position={[5.5, 3, -6.5]} intensity={0.4} color={"#505050"} />
      <pointLight
        position={[-5.5, 3, -6.5]}
        intensity={0.4}
        color={"#505050"}
      />
      {Object.keys(playerData).map((key) => {
        const player = playerData[key];
        return (
          <>
            <PlayerComponent key={key} player={player} />
            <Chair
              position={player.position}
              rotation={player.angle}
              userData={player}
              args={[1, 1, 1]}
            >
              <meshStandardMaterial attach="material" color={player.color} />
            </Chair>
          </>
        );
      })}
      <Map myRef={myRef} />
      <RaycasterComponent turn={turn} camera={camera} playerData={playerData} />
      <OrbitControls zoom0={0} position0={[10, 10, 10]} ref={myRef} />
    </>
  );
};

const MainCanvas = ({ turn }) => {
  return (
    <div className="h-screen w-full">
      <Canvas>
        <Scene turn={turn} />
      </Canvas>
      <Crosshair />
    </div>
  );
};

export default MainCanvas;
