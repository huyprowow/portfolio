import { Plane } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import React from 'react'
import * as THREE from 'three'
import { Assets } from '@/helpers/assetMap'
import { toInteractionGroups } from '@/helpers/collisionGroups'
const Ground = () => {
  const texture = useLoader(THREE.TextureLoader, Assets.GRASS_TEXTURE)
  //  texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
  if (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(100, 100)
    texture.anisotropy = 16
  }
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

  const groundMaterial = new THREE.MeshStandardMaterial({ map: texture })


  return (
    <RigidBody type='fixed' restitution={0.2} friction={0} scale={[1000, 0.2, 1000]}

    >
      <mesh geometry={boxGeometry} material={groundMaterial} position={[0, -0.1, 0]} receiveShadow />
      <CuboidCollider args={[2, 0.1, 2 * length]} position={[0, -0.1, 0]} restitution={0.2} friction={1} />
    </RigidBody>
  )
}

export default Ground
