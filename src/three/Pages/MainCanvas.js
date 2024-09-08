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
import { RoomContext } from "../../contexts/socketContext";

const Scene = ({ turn, playerTurn }) => {
  const pointerLockRef = useRef(null);
  const locked = useRef(false);
  const { camera, scene } = useThree();
  const { ws, roomId } = useContext(RoomContext);
  const playerData = useSelector((state) => state.otherPlayerData);
  const myData = useSelector((state) => state.myPlayerData);
  const [myRotation, setMyRotation] = useState([0, 0, 0]);

  useEffect(() => {
    camera.position.set(...myData.cameraOffset);
    camera.near = 0.01;
    camera.lookAt(new THREE.Vector3(0, 2.1, 0));

    const handleKeyDown = (e) => {
      if (e.key === "x") {
        pointerLockRef.current.unlock();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [camera, scene, myData.cameraOffset]);

  useFrame(() => {
    const cameraRotation = [camera.rotation.x, camera.rotation.y, camera.rotation.z];
    if (cameraRotation !== myRotation) {
      ws.emit("rotate", { rotation: cameraRotation, username: myData.username, roomId });
      setMyRotation(cameraRotation);
    }
  });

  return (
    <>
      <LightingMapper />
      <PlayerMapper
        username={myData.username}
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
        maxPolarAngle={Math.PI / 2 + 0.2}
        minPolarAngle={Math.PI / 2  - 0.1}
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

const MainCanvas = ({ turn, playerTurn }) => {
  return (
    <div className="h-screen w-full">
      <Canvas>
        <color attach={"background"} args={["black"]} />
        <Scene turn={turn} playerTurn={playerTurn} />
      </Canvas>
      <Crosshair />
    </div>
  );
};

export default MainCanvas;
