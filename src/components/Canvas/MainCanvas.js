import React, { useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Plane } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import Controls from "./Controls";
import * as THREE from "three";
const SphereWithPosition = ({ color, sphereRef, position }) => {
  return (
    <mesh ref={sphereRef} position={position}>
      <sphereGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Scene = ({ setShow, setEnable }) => {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 0, 0));
  const sphereRef = useRef(null);
  const { camera } = useThree();

  return (
    <>
      <axesHelper args={[100, 100, 100]} />
      <Controls
        sphereRef={sphereRef}
        setPlayerPos={setPlayerPos}
        setEnable={setEnable}
        setShow={setShow}
        position={[10, 10, 10]}
        camera={camera}
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
      <Physics gravity={[0, -10, 0]}>
        <RigidBody colliders="ball">
          <SphereWithPosition
            position={[10, 10, 10]}
            sphereRef={sphereRef}
            color={"Yellow"}
          />
        </RigidBody>

        <RigidBody type="fixed" colliders="trimesh">
          <Plane
            position={[0, 0, 0]}
            args={[100, 100]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color={"brown"} />
          </Plane>
        </RigidBody>
      </Physics>
    </>
  );
};

const App = () => {
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
            {enable ? " Click To Continue" : ""}
          </button>
        </div>
      )}
      <Canvas style={{ height: "100vh" }}>
        <Scene setEnable={setEnable} setShow={setShow} show={show} />
      </Canvas>
    </>
  );
};

export default App;
