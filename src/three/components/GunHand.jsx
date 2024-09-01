import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "react-three-fiber";
import { Vector3 } from "three";

export function GunHand(props) {
  const gunRef = useRef(null);
  const { nodes, materials } = useGLTF("/models/gunHand/gunHand.gltf");
  const { camera } = props;
  const { cameraOffset } = props;
  const newOffset = [cameraOffset[0], cameraOffset[1] - 0.4, cameraOffset[2]];

  useFrame(() => {
    gunRef.current.rotation.copy(camera.rotation)
  });

  return (
    <group
      ref={gunRef}
      {...props}
      position={newOffset}
      scale={1.7}
      dispose={null}
    >
      <group frustumCulled={false} position={[0, 0, 0]}>
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
