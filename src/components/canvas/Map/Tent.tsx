import { Assets } from '@/helpers/assetMap'
import { useLoader } from '@react-three/fiber'
import React from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useGLTF } from '@react-three/drei'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import { toInteractionGroups } from '@/helpers/collisionGroups'
import { useBoundStore } from '@/store/store'
import { BoxTriggerZone } from '../Debug/BoxTriggerZone'

export const Tent = () => {
  const { nodes, materials } = useGLTF(Assets.TENT)
  console.log({
    nodes,
    materials,
  })
  const playerRef = useBoundStore((state) => state.playerRef)
  console.log({ playerRef })
  const setInHouse = useBoundStore((state) => state.setInHouse)
  const onEnter = () => {
    console.log('🏠 Vào ')
    setInHouse(true)
  }
  const onExit = () => {
    console.log('🚪 Rời ')
    setInHouse(false)
  }
  return (
    <>
      <RigidBody type='fixed' colliders='trimesh'>
        <group dispose={null} position={[50, 0, 20]} rotation={[0, -Math.PI / 2, 0]}>
          <group scale={0.18}>
            <group>
              <mesh castShadow receiveShadow geometry={nodes['01_01_0'].geometry} material={materials.material} />
              <mesh castShadow receiveShadow geometry={nodes['01_02_0'].geometry} material={materials.material_1} />
              <mesh castShadow receiveShadow geometry={nodes['01_03_0'].geometry} material={materials.material_2} />
            </group>
          </group>
        </group>
      </RigidBody>
      <BoxTriggerZone
        size={[50, 40,60]}
        center={[50, 20, 20]}
        playerRef={playerRef}
        onEnter={onEnter}
        onExit={onExit}
        debug={true} // bật hộp vùng để nhìn
      />
    </>
  )
}

useGLTF.preload(Assets.TENT)
