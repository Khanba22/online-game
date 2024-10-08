import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Map(props) {
  const { nodes, materials } = useGLTF('/models/map/map.gltf')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Cube666.geometry} material={materials.wall} />
      <mesh geometry={nodes.Cube666_1.geometry} material={materials.old_bulb_light_mat} />
      <mesh geometry={nodes.Cube666_2.geometry} material={materials.old_retro_light_mat} />
      <mesh geometry={nodes.Cube666_3.geometry} material={materials.Glass} />
      <mesh geometry={nodes.Cube666_4.geometry} material={materials.old_wire_filament_mat} />
      <mesh geometry={nodes.Cube666_5.geometry} material={materials.Wood} />
      <mesh geometry={nodes.Cube666_6.geometry} material={materials.floor} />
      <mesh geometry={nodes.Cube666_7.geometry} material={materials.wood} />
      <mesh geometry={nodes.Cube666_8.geometry} material={materials['CW-Nickel-matte']} />
      <mesh geometry={nodes.Cube666_9.geometry} material={materials.Door} />
      <mesh geometry={nodes.Cube666_10.geometry} material={materials.None} />
      <mesh geometry={nodes.Cube666_11.geometry} material={materials.Paint} />
      <mesh geometry={nodes.Cube666_12.geometry} material={materials.red} />
      <mesh geometry={nodes.Cube666_13.geometry} material={materials.rod} />
      <mesh geometry={nodes.Cube666_14.geometry} material={materials.blue} />
      <mesh geometry={nodes.Cube666_15.geometry} material={materials.base} />
      <mesh geometry={nodes.Cube666_16.geometry} material={materials.plane} />
      <mesh geometry={nodes.Cube666_17.geometry} material={materials.green} />
      <mesh geometry={nodes.Cube666_18.geometry} material={materials.yellow} />
      <mesh geometry={nodes.Cube666_19.geometry} material={materials.Material} />
      <mesh geometry={nodes.Cube666_20.geometry} material={materials.ClockCase} />
      <mesh geometry={nodes.Cube666_21.geometry} material={materials.Clockface} />
      <mesh geometry={nodes.Cube666_22.geometry} material={materials.MoonDial} />
    </group>
  )
}

useGLTF.preload('/map.gltf')
