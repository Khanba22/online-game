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
import playerData from "../../tempData/tempPlayerData.json"
import data from "../../tempData/tempMeData.json"

const Scene = ({ turn }) => {
  const { camera } = useThree();
  // const data = useSelector((state) => state.myPlayerData);
  // const playerData = useSelector((state) => state.otherPlayerData);
  const myRef = useRef(null);
  const pointerLockRef = useRef(null);
  const { position } = data;
  const locked = useRef(false);
  useEffect(() => {
    camera.lookAt(new THREE.Vector3(0, 1, 0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useFrame(() => {
  //   if (position) {
  //     // Adjust the camera position based on player data
  //     camera.position.set(position[0], position[1] + 4, position[2]);
  //   } else {
  //     // Default camera position
  //     // camera.position.set(-1.4, 3, -2);
  //   }
  // });

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
      <LightingMapper/>
      <PlayerMapper playerData={Object.values(playerData)} />
      <Map position={[0, -1.4, 0]} myRef={myRef} />
      <RaycasterComponent
        isLocked={locked}
        turn={turn}
        camera={camera}
        playerData={playerData}
      />
      {/* <PointerLockControls
        ref={pointerLockRef}
        onLock={() => {
          locked.current = true;
        }}
        onUnlock={() => {
          locked.current = false;
        }}
      /> */}
      <OrbitControls />
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
