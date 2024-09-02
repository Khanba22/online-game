import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import { useSelector } from "react-redux";
import { Map } from "../components/Map";
import PlayerMapper from "../components/PlayerMapper";
import LightingMapper from "../components/LightingMapper";
// import pdataobj from "../../tempData/tempPlayerData.json";
// import data from "../../tempData/tempMeData.json";

const Scene = ({ turn, playerTurn }) => {
  const { camera, scene } = useThree();
  const pointerLockRef = useRef(null);
  const locked = useRef(false);
  const axesHelperRef = useRef(null); // Reference for the axes helper
  const playerData = useSelector(state=>state.otherPlayerData)
  const data = useSelector(state=>state.myPlayerData)
  // const playerData = pdataobj["5"];

  // Set up camera and add axes helper
  useEffect(() => {
    camera.position.set(...data.cameraOffset);
    camera.near = 0.01;
    camera.lookAt(new THREE.Vector3(0, 2.1, 0));

    // Add AxesHelper to the scen

    window.addEventListener("keydown", (e) => {
      if (e.key === "x") {
        pointerLockRef.current.unlock();
      }
    });

    // Cleanup event listeners
    return () => {
      window.removeEventListener("keydown", () => {});
    };
  }, [camera, scene]);

  return (
    <>
      <LightingMapper />
      <PlayerMapper
        username={data.username}
        camera={camera}
        turn={turn}
        playerTurn={playerTurn}
        playerData={Object.values(playerData)}
      />
      <Map position={[0, -1.4, 0]} myRef={useRef(null)} />
      <RaycasterComponent
        isLocked={locked}
        turn={turn}
        camera={camera}
        playerData={playerData}
      />
      <PointerLockControls
        maxPolarAngle={Math.PI / 2 + 0.6}
        minPolarAngle={Math.PI / 2 - 0.3}
        ref={pointerLockRef}
        onLock={() => {
          locked.current = true;
        }}
        onUnlock={() => {
          locked.current = false;
        }}
      />
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
