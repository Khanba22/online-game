// src/App.js
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls, Plane, SpotLight } from "@react-three/drei";
import * as THREE from "three";

const SphereWithPosition = ({ position, color }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Scene = ({ cameraPosition, setShow, setEnable }) => {
  const spheres = [
    { position: [5, 0, 0], color: "pink" },
    { position: [1.545, 4.755, 0], color: "blue" },
    { position: [-4.045, 2.938, 0], color: "green" },
    { position: [-4.045, -2.938, 0], color: "yellow" },
    { position: [1.545, -4.755, 0], color: "purple" },
    { position: [0, 1, 5], color: "orange" },
  ];

  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2]
    );
  });

  return (
    <>
      <PointerLockControls
        onUnlock={() => {
          setEnable(false);
          setShow(true);
          setTimeout(() => {
            setEnable(true);
          }, 1500);
        }}
        selector="#buttonControl"
      />
      <ambientLight intensity={0.8} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.3}
        penumbra={0.5}
        intensity={2} // Increase spotlight intensity
        castShadow
      />
      <directionalLight
        position={[-5, 5, 5]}
        intensity={1.5} // Add a directional light
        castShadow
      />
      <Plane
        position={[0, -1, 0]}
        args={[100, 100]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color={"brown"} />
      </Plane>
      {spheres.map((sphere, index) => (
        <SphereWithPosition
          key={index}
          position={sphere.position}
          color={sphere.color}
        />
      ))}
    </>
  );
};

const App = () => {
  const [cameraPosition, setCameraPosition] = useState([1.545, 4.755, 0]);
  const [show, setShow] = useState(true);
  const [enable, setEnable] = useState(true);

  return (
    <>
      {show && (
        <div>
          <button
            disabled={!enable}
            // enable={enable}
            className="absolute w-screen h-screen bg-slate-500"
            style={{ zIndex: "5" }}
            id="buttonControl"
            onClick={() => {
              // setEnable(false);
              setShow(false);
            }}
          >
           {
            enable?" Click To Continue":""
           }
          </button>
        </div>
      )}
      <Canvas style={{ height: "100vh" }}>
        <Scene
          setEnable={setEnable}
          setShow={setShow}
          show={show}
          cameraPosition={cameraPosition}
        />
      </Canvas>
    </>
  );
};

export default App;
