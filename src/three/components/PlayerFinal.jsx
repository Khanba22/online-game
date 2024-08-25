import React from "react";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

export function PlayerFinal(props) {
  const group = React.useRef();
  const { scene, animations } = useGLTF("/models/playerFinal/playerFinal.gltf");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const rotation = props.rotation || [0, 0, 0];
  const rotateAngle = [rotation[0], rotation[1] - Math.PI, rotation[2]];
  const { actions } = useAnimations(animations, group);

  // Determine which animation to play based on the `turn` prop
  React.useEffect(() => {
    if (props.turn !== 0) {
      actions["normal_view"].play();
      actions["shooting_view"].stop();
    } else {
      actions["shooting_view"].play();
      actions["normal_view"].stop();
    }
  }, [props.turn, actions]);

  return (
    <group
      ref={group}
      {...props}
      rotation={rotateAngle}
      scale={1.7}
      dispose={null}
    >
      <group name="Scene">
        <group name="metarig">
          <primitive object={nodes.spine} />
          <primitive object={nodes.neutral_bone} />
          <group name="Object_2018">
            <skinnedMesh
              frustumCulled = {false}
              name="Object_0018"
              geometry={nodes.Object_0018.geometry}
              material={materials.Glock_Mat4}
              skeleton={nodes.Object_0018.skeleton}
            />
            <skinnedMesh
              name="Object_0018_1"
              geometry={nodes.Object_0018_1.geometry}
              material={materials.Wolf3D_Outfit_Top}
              skeleton={nodes.Object_0018_1.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name="Object_0018_2"
              geometry={nodes.Object_0018_2.geometry}
              material={materials.Wolf3D_Body}
              skeleton={nodes.Object_0018_2.skeleton}
            />
            <skinnedMesh
              name="Object_0018_3"
              geometry={nodes.Object_0018_3.geometry}
              material={materials.Wolf3D_Outfit_Bottom}
              skeleton={nodes.Object_0018_3.skeleton}
            />

            <skinnedMesh
              name="Object_0018_5"
              geometry={nodes.Object_0018_5.geometry}
              material={materials.Wolf3D_Outfit_Footwear}
              skeleton={nodes.Object_0018_5.skeleton}
            />
            {props.turn !== 0 ? (
              <>
                <skinnedMesh
                  name="Object_0018_4"
                  geometry={nodes.Object_0018_4.geometry}
                  material={materials.Wolf3D_Hair}
                  skeleton={nodes.Object_0018_4.skeleton}
                />
                <skinnedMesh
                  name="Object_0018_6"
                  geometry={nodes.Object_0018_6.geometry}
                  material={materials.Wolf3D_Skin}
                  skeleton={nodes.Object_0018_6.skeleton}
                />
                <skinnedMesh
                  name="Object_0018_7"
                  geometry={nodes.Object_0018_7.geometry}
                  material={materials.Wolf3D_Eye}
                  skeleton={nodes.Object_0018_7.skeleton}
                />
              </>
            ) : (
              <></>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/playerFinal/playerFinal.gltf");
