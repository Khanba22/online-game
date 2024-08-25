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
import LightingMapper from "../components/LightingMapper";
import pdataobj from "../../tempData/tempPlayerData.json";
import data from "../../tempData/tempMeData.json";

const Scene = ({ turn }) => {
  const { camera } = useThree();
  // const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
  // const data = useSelector((state) => state.myPlayerData);
  // const playerData = useSelector((state) => state.otherPlayerData);
  const playerData = pdataobj["5"];
  const myRef = useRef(null);
  const pointerLockRef = useRef(null);
  const { cameraOffset } = data;
  const locked = useRef(false);
  useEffect(() => {
    camera.position.set(...cameraOffset);
    camera.near = 0.01
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <LightingMapper />
      <PlayerMapper turn={turn} playerData={Object.values(playerData)} />
      <Map position={[0, -1.4, 0]} myRef={myRef} />
      <RaycasterComponent
        isLocked={locked}
        turn={turn}
        camera={camera}
        playerData={playerData}
      />
      <PointerLockControls
        maxPolarAngle={(Math.PI / 2) + 0.6}
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
