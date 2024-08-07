import React, { useRef, useEffect, Suspense } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

const Player = ({
  position,
  rotation,
  username,
  lives,
  isShielded,
  hasDoubleDamage,
  hasDoubleTurn,
  color,
  canLookBullet,
}) => {
  const group = useRef();
  const { scene, animations } = useGLTF("/models/player/player.gltf");
  const { actions } = useAnimations(animations, group);
  const rotateAngle = [rotation[0], rotation[1] - Math.PI, rotation[2]];
  useEffect(() => {
    if (actions) {
      Object.keys(actions).forEach((key) => {
        actions[key]?.play();
      });
    }
    console.log("Player loaded at position:", position);
  }, [actions, position]);

  const clonedScene = clone(scene); // Clone the scene to create unique instances
  const userData = {
    username,
    lives,
    isShielded,
    hasDoubleDamage,
    hasDoubleTurn,
    color,
    canLookBullet,
  };
  return (
    <group
      userData={userData}
      ref={group}
      dispose={null}
      position={position}
      rotation={rotateAngle}
      scale={1.5}
    >
      {clonedScene.children.map((child) => (
        <primitive userData={userData} key={child.uuid} object={child} />
      ))}
    </group>
  );
};

const PlayerMapper = ({ playerData }) => {
  console.log(playerData);
  return (
    <Suspense fallback={null}>
      {playerData.map((player, i) => (
        <Player key={`player${i}`} {...player} />
      ))}
    </Suspense>
  );
};

export default PlayerMapper;
