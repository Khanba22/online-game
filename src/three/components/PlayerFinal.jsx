import React, { useEffect, useRef, useState } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations, Icosahedron } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

export function PlayerFinal(props) {
  const group = useRef();
  const { scene, animations } = useGLTF("/models/playerFinal/playerFinal.gltf");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  const userData = props.userData;
  const { isMe, isMyTurn } = props;
  const innerRef = useRef(null);

  useFrame(() => {
    if (isMyTurn) {
      actions["normal_view"].stop();
      actions["shooting_view"].play();
    } else {
      actions["shooting_view"].stop();
      actions["normal_view"].play();
    }
  });

  const pos = props.position ? props.position : [0, 0, 0];

  return (
    <group
      ref={group}
      {...props}
      position={[pos[0], pos[1] - 0.35, pos[2]]}
      scale={1.7}
      dispose={null}
    >
      <group userData={userData} name="Scene">
        <group userData={userData} name="metarig">
          <primitive object={nodes.spine} />
          <group userData={userData} name="Object_2018">
            <skinnedMesh
              frustumCulled={false}
              name="Object_0018"
              geometry={nodes.Object_0018.geometry}
              material={materials.Glock_Mat4}
              skeleton={nodes.Object_0018.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name="Object_0018_2"
              geometry={nodes.Object_0018_2.geometry}
              material={materials.Wolf3D_Body}
              skeleton={nodes.Object_0018_2.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name="Object_0018_1"
              geometry={nodes.Object_0018_1.geometry}
              material={materials.Wolf3D_Outfit_Top}
              skeleton={nodes.Object_0018_1.skeleton}
            />

            <skinnedMesh
              frustumCulled={false}
              name="Object_0018_3"
              geometry={nodes.Object_0018_3.geometry}
              material={materials.Wolf3D_Outfit_Bottom}
              skeleton={nodes.Object_0018_3.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name="Object_0018_5"
              geometry={nodes.Object_0018_5.geometry}
              material={materials.Wolf3D_Outfit_Footwear}
              skeleton={nodes.Object_0018_5.skeleton}
            />
            {!props.isMe ? (
              <>
                <skinnedMesh
                  frustumCulled={false}
                  name="Object_0018_4"
                  geometry={nodes.Object_0018_4.geometry}
                  material={materials.Wolf3D_Hair}
                  skeleton={nodes.Object_0018_4.skeleton}
                />
                <skinnedMesh
                  frustumCulled={false}
                  name="Object_0018_6"
                  geometry={nodes.Object_0018_6.geometry}
                  material={materials.Wolf3D_Skin}
                  skeleton={nodes.Object_0018_6.skeleton}
                />
                <skinnedMesh
                  frustumCulled={false}
                  name="Object_0018_7"
                  geometry={nodes.Object_0018_7.geometry}
                  material={materials.Wolf3D_Eye}
                  skeleton={nodes.Object_0018_7.skeleton}
                />
              </>
            ) : null}
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/playerFinal/playerFinal.gltf");
