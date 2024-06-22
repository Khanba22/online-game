/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 roooooooooooommmm1.gltf 
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Map(props) {
  const { nodes, materials } = useGLTF('/models/map/roooooooooooommmm1.gltf')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Cube001.geometry} material={materials.floor} />
      <mesh geometry={nodes.Cube001_1.geometry} material={materials.wall} />
      <mesh geometry={nodes.Cube001_2.geometry} material={materials.tile} />
      <mesh geometry={nodes.Cube001_3.geometry} material={materials.wood} />
      <mesh geometry={nodes.Cube001_4.geometry} material={materials['CW-Nickel-matte']} />
      <mesh geometry={nodes.Cube001_5.geometry} material={materials.lambert2} />
      <mesh geometry={nodes.Cube001_6.geometry} material={materials.Door} />
      <mesh geometry={nodes.Cube001_7.geometry} material={materials.None} />
      <mesh geometry={nodes.Cube001_8.geometry} material={materials.Paint} />
      <mesh geometry={nodes.Cube001_9.geometry} material={materials.base} />
      <mesh geometry={nodes.Cube001_10.geometry} material={materials.green} />
      <mesh geometry={nodes.Cube001_11.geometry} material={materials.blue} />
      <mesh geometry={nodes.Cube001_12.geometry} material={materials.red} />
      <mesh geometry={nodes.Cube001_13.geometry} material={materials.yellow} />
      <mesh geometry={nodes.Cube001_14.geometry} material={materials.rod} />
      <mesh geometry={nodes.Cube001_15.geometry} material={materials.plane} />
      <mesh geometry={nodes.Cube001_16.geometry} material={materials.Material} />
      <mesh geometry={nodes.Cube001_17.geometry} material={materials.ClockCase} />
      <mesh geometry={nodes.Cube001_18.geometry} material={materials.Clockface} />
      <mesh geometry={nodes.Cube001_19.geometry} material={materials.Glass} />
      <mesh geometry={nodes.Cube001_20.geometry} material={materials.MoonDial} />
      <mesh geometry={nodes.Cube001_21.geometry} material={materials.old_bulb_light_mat} />
      <mesh geometry={nodes.Cube001_22.geometry} material={materials.old_retro_light_mat} />
      <mesh geometry={nodes.Cube001_23.geometry} material={materials.old_wire_filament_mat} />
      <mesh geometry={nodes.Cube001_24.geometry} material={materials.Wood} />
    </group>
  )
}

useGLTF.preload('/models/map/roooooooooooommmm1.gltf')