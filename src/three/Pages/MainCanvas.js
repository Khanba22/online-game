import React, { useContext, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import "./styles.css"; // Import the styles for the crosshair
import RaycasterComponent from "../components/RayCaster";
import Crosshair from "../components/Crosshair";
import { useDispatch, useSelector } from "react-redux";
import PlayerComponent from "../components/PlayerComponent";
import { Map } from "../components/Map";
import * as THREE from "three";
import { RoomContext } from "../../contexts/socketContext";
import { useEquipment } from "../../redux/PlayerDataReducer";
import { usePlayerEquipment } from "../../redux/AllPlayerReducer";
import { toast } from "react-toastify";

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
  const dispatch = useDispatch();
  const { ws, roomId } = useContext(RoomContext);
  const { equipment, username } = data;
  const { position } = data;
  const locked = useRef(false);
  useEffect(() => {
    camera.rotateOnAxis(new THREE.Vector3(0, 0, 1));
    camera.aspect = 2;
    camera.lookAt(new THREE.Vector3(0, 1, 0));
  }, []);

  useFrame(() => {
    if (position) {
      // Adjust the camera position based on player data
      camera.position.set(position[0], position[1] + 1.5, position[2]);
    } else {
      // Default camera position
      // camera.position.set(-1.4, 3, -2);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        pointerLockRef.current.unlock()
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
      {Object.keys(playerData).map((key, id) => {
        const player = playerData[key];
        return <PlayerComponent key={id} id={id} playerData={player} />;
      })}
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
