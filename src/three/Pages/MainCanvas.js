import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import { useSelector } from "react-redux";
import { Map } from "../components/Map";
import * as THREE from "three";
import PlayerMapper from "../components/PlayerMapper";

const pointLightData = [
  {
    position: [2.76, 2, 0.1],
    intensity: 1.6,
    power: 10,
    decay: 1,
    castShadow: true,
    color: "#FFDD99",
  },
  { position: [4, 4.4, -2.4], intensity: 0.6, castShadow: true },
  {
    position: [1, 4.5, 6.3],
    intensity: 0.6,
    castShadow: true,
    color: "#FFEECC",
  },
  { position: [0, 3.5, 0], intensity: 0.9, color: "#FFEECC" },
  { position: [5.5, 3, 6.5], intensity: 0.4, color: "#505050" },
  { position: [-5.5, 3, 6.5], intensity: 0.4, color: "#505050" },
  { position: [5.5, 3, -6.5], intensity: 0.4, color: "#505050" },
  { position: [-5.5, 3, -6.5], intensity: 0.4, color: "#505050" },
];

const Scene = ({ turn }) => {
  const { camera } = useThree();
  const data = useSelector((state) => state.myPlayerData);
  const playerData = useSelector((state) => state.otherPlayerData);
  const myRef = useRef(null);
  const pointerLockRef = useRef(null);
  const { position } = data;
  const locked = useRef(false);
  useEffect(() => {
    camera.lookAt(new THREE.Vector3(0, 1, 0));
  }, []);

  const tempData = [
    { live: 5, position: [3.3, 0.19, 0.0] },
    { live: 5, position: [0.9890437907365466, 0.19, 3.241785515479182] },
    { live: 5, position: [-2.5940437907365466, 0.19, 1.878651166377898] },
    { live: 5, position: [1.1940437907365475, 0.19, -3.178651166377897] },
    { live: 5, position: [-3.0417855154791825, 0.19, -1.9890437907365458] },
  ];

  useFrame(() => {
    if (position) {
      // Adjust the camera position based on player data
      camera.position.set(position[0], position[1] + 4, position[2]);
    } else {
      // Default camera position
      // camera.position.set(-1.4, 3, -2);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      console.log(e.key);
      if (e.key === "x") {
        pointerLockRef.current.unlock();
      }
    });
  }, []);

  return (
    <>
      <ambientLight intensity={1} />
      {pointLightData.map((light, index) => (
        <pointLight
          key={index}
          position={light.position}
          intensity={light.intensity}
          power={light.power}
          decay={light.decay}
          castShadow={light.castShadow}
          color={light.color}
        />
      ))}
      <PlayerMapper playerData={Object.values(playerData)} />
      <Map position={[0, -1.4, 0]} myRef={myRef} />
      <RaycasterComponent
        isLocked={locked}
        turn={turn}
        camera={camera}
        playerData={playerData}
      />
      <PointerLockControls
        ref={pointerLockRef}
        onLock={() => {
          locked.current = true;
        }}
        onUnlock={() => {
          locked.current = false;
        }}
      />
      {/* <OrbitControls /> */}
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
