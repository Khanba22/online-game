import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PointerLockControls,
  // OrbitControls,
} from "@react-three/drei";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import { useSelector } from "react-redux";
import PlayerComponent from "../components/PlayerComponent";
import { Map } from "../components/Map";
import * as THREE from "three";

const Scene = ({ turn }) => {
  const { camera } = useThree();
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader(sound);

  const data = useSelector((state) => state.myPlayerData);
  const playerData = useSelector((state) => state.otherPlayerData);
  const myRef = useRef(null);

  const { position } = data;

  useFrame(() => {
    if (position) {
      // Adjust the camera position based on player data
      camera.position.set(position[0], position[1] + 1.5, position[2]);
    } else {
      // Default camera position
      // camera.position.set(-1.4, 3, -2);
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight
        position={[2.76, 2, 0.1]}
        intensity={1.6}
        power={10}
        decay={1}
        castShadow
        color={"#FFDD99"}
      />
      <pointLight intensity={0.6} castShadow position={[4, 4.4, -2.4]} />
      {/* <Icosahedron scale={0.1} position={[1, 4.5, 6.3]} /> */}
      <pointLight
        intensity={0.6}
        castShadow
        position={[1, 4.5, 6.3]}
        color={"#FFEECC"}
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
      {Object.keys(playerData).map((key,id) => {
        const player = playerData[key];
        return (
          <>
            <PlayerComponent id = {id} playerData={player} />
          </>
        );
      })}
      <Map position={[0, -1.4, 0]} myRef={myRef} />
      <RaycasterComponent
        sound={sound}
        turn={turn}
        camera={camera}
        audioLoader={audioLoader}
        playerData={playerData}
      />
      {/* <OrbitControls zoom0={0} position0={[10, 10, 10]} ref={myRef} /> */}
      <PointerLockControls />
    </>
  );
};

const MainCanvas = ({ turn }) => {
  return (
    <div className="h-screen w-full">
      <Canvas>
        <color attach={"background"} args={["black"]} />
        <Scene turn={turn} />
      </Canvas>
      <Crosshair />
    </div>
  );
};

export default MainCanvas;
