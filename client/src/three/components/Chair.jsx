import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Chair(props) {
  const { nodes, materials } = useGLTF('/models/chair/chair.gltf')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_74.geometry} material={materials.lambert2} rotation={[Math.PI, 0, Math.PI]} scale={2} />
    </group>
  )
}

useGLTF.preload('/models/chair/chair.gltf')
