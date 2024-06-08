import { PointerLockControls } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";

const Controls = ({
  sphereRef,
  position,
  camera,
  selector,
  setEnable,
  setShow,
  setPlayerPos,
}) => {
  const controlRef = useRef();
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  const handleChange = () => {
    // Implement your onChange logic here
  };

  const handleUnlock = () => {
    setEnable(false);
    setShow(true);
    setTimeout(() => {
      setEnable(true);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        setMoveForward(true);
        break;
      case "ArrowDown":
      case "KeyS":
        setMoveBackward(true);
        break;
      case "ArrowLeft":
      case "KeyA":
        setMoveLeft(true);
        break;
      case "ArrowRight":
      case "KeyD":
        setMoveRight(true);
        break;
      case "Space":
        console.log(sphereRef.current.position)
        console.log(camera.position)
        if (sphereRef.current) {
          sphereRef.current.position.x = camera.position.x
          sphereRef.current.position.y = camera.position.y
          sphereRef.current.position.z = camera.position.z
        }
        setPlayerPos(camera.position);
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (e) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        setMoveForward(false);
        break;
      case "ArrowDown":
      case "KeyS":
        setMoveBackward(false);
        break;
      case "ArrowLeft":
      case "KeyA":
        setMoveLeft(false);
        break;
      case "ArrowRight":
      case "KeyD":
        setMoveRight(false);
        break;
      case "Space":
        setPlayerPos(controlRef.current.position);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const controls = controlRef.current;

    if (!controls) return;

    const handleLock = () => {
      console.log("Pointer locked");
    };

    controls.addEventListener("lock", handleLock);
    controls.addEventListener("unlock", handleUnlock);

    return () => {
      controls.removeEventListener("lock", handleLock);
      controls.removeEventListener("unlock", handleUnlock);
    };
  }, [controlRef]);

  useFrame(() => {
    if (controlRef.current) {
      const velocity = new THREE.Vector3();

      if (moveForward) velocity.z -= 0.1;
      if (moveBackward) velocity.z += 0.1;
      if (moveLeft) velocity.x -= 0.1;
      if (moveRight) velocity.x += 0.1;

      controlRef.current.getObject().translateX(velocity.x);
      controlRef.current.getObject().translateZ(velocity.z);
    }
  });

  return (
    <PointerLockControls
      position={position}
      camera={camera}
      selector={selector}
      ref={controlRef}
      onChange={handleChange}
      onUnlock={handleUnlock}
    />
  );
};

export default Controls;
