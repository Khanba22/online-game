import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "react-three-fiber";

export function GunHand(props) {
  const gunRef = useRef(null);
  const { nodes, materials } = useGLTF("/models/gunHand/gunHand.gltf");
  const { camera } = props;
  const { cameraOffset } = props;
  const newOffset = [cameraOffset[0], cameraOffset[1] - 0.4, cameraOffset[2]];
  const rightMouseDown = useRef(false);
  const innerGun = useRef(null);

  useEffect(() => {
    if (!props.isMe) {
      return;
    }
    window.addEventListener("mousedown", (event) => {
      // Check if the right mouse button is pressed
      if (event.button === 2) {
        rightMouseDown.current = true;
      }

      // Check if the left mouse button is pressed while the right button is held
      if (event.button === 0 && rightMouseDown.current) {
        performAction();
      }
    });

    window.addEventListener("mouseup", (event) => {
      // Reset the right mouse button state when it's released
      if (event.button === 2) {
        rightMouseDown.current = false;
      }
    });

    window.addEventListener("contextmenu", (event) => {
      // Prevent the context menu from showing up on right-click
      if (rightMouseDown.current) {
        event.preventDefault();
      }
    });

    function performAction() {
      console.log("Left click while holding right click detected!");
      // Your action here
    }
  }, []);

  useFrame(() => {
    gunRef.current.rotation.copy(camera.rotation);
    if (innerGun.current) {
      if (rightMouseDown.current) {
        innerGun.current.rotation.set(Math.PI / 2 + 0.05, 0, 0);
        innerGun.current.position.set(0, -0.3, -0.4);
      } else {
        innerGun.current.rotation.set(0, 0, 0);
        innerGun.current.position.set(0, 0, 0);
      }
    }
  });

  return (
    <group
      ref={gunRef}
      {...props}
      position={newOffset}
      scale={1.4}
      dispose={null}
    >
      <group ref={innerGun} frustumCulled={false}>
        <mesh
          frustumCulled={false}
          geometry={nodes.Object_0108.geometry}
          material={materials.Wolf3D_Body}
        />
        <mesh
          frustumCulled={false}
          geometry={nodes.Object_0108_1.geometry}
          material={materials.Glock_Mat4}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/models/gunHand/gunHand.gltf");
