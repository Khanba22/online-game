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

const Scene = ({ turn }) => {
  const { camera, scene } = useThree();
  const data = useSelector((state) => state.myPlayerData);
  const playerData = useSelector((state) => state.otherPlayerData);
  const { position } = data;
  const myRef = useRef(null);

  useFrame(() => {
    if (position) {
      // camera.position.set(position[0], position[1] + 1.5, position[2]);
    } else {
      // camera.position.set(-1.4, 3, -2);
    }
    // camera.position.set(...position);
    // console.log(myRef.current.position0)
  });

  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />
      {Object.keys(playerData).map((key) => {
        const player = playerData[key];
        return <PlayerComponent key={key} player={player} />;
      })}
      <Map />
      <Icosahedron
        userData={{ lives: 10 }}
        position={[-1.4, 1.5, -2]}
        args={[1, 1, 1]}
        scale={0.6}
      >
        <meshStandardMaterial attach="material" color="orange" />
      </Icosahedron>

      <RaycasterComponent turn={turn} camera={camera} playerData={playerData} />
      {/* <PointerLockControls /> */}
      <OrbitControls zoom0={0} position0={[10,10,10]} ref={myRef}/>
    </>
  );
};

const MainCanvas = ({ turn }) => {
  return (
    <div className="h-screen w-screen">
      <Canvas>
        <Scene turn={turn} />
      </Canvas>
      <Crosshair />
    </div>
  );
};

export default MainCanvas;
