import React, { useContext, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import { useSelector } from "react-redux";
import { Map } from "../components/Map";
import PlayerMapper from "../components/PlayerMapper";
import LightingMapper from "../components/LightingMapper";
import pdataobj from "../../tempData/tempPlayerData.json";
import data from "../../tempData/tempMeData.json";
import { Socket } from "socket.io-client";
import { RoomContext } from "../../contexts/socketContext";

const Scene = ({ turn, playerTurn }) => {
  const { camera, scene } = useThree();
  const pointerLockRef = useRef(null);
  const locked = useRef(false);
  const { ws, username , roomId } = useContext(RoomContext);
  const playerData = useSelector((state) => state.otherPlayerData);
  const data = useSelector((state) => state.myPlayerData);
  // const playerData = pdataobj["5"];
  const [myRotation, setMyRotation] = useState([0, 0, 0]);

  useEffect(() => {
    camera.position.set(...data.cameraOffset);
    camera.near = 0.01;
    camera.lookAt(new THREE.Vector3(0, 2.1, 0));

    window.addEventListener("keydown", (e) => {
      if (e.key === "x") {
        pointerLockRef.current.unlock();
      }
    });

    // Cleanup event listeners
    return () => {
      window.removeEventListener("keydown", () => {});
    };
  }, [camera, scene, data.cameraOffset]);

  useFrame(() => {
    const cr = [camera.rotation.x, camera.rotation.y, camera.rotation.z];
    if (cr !== myRotation) {
      ws.emit("rotate", { rotation: cr, username: data.username , roomId: roomId });
    }
  });

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
