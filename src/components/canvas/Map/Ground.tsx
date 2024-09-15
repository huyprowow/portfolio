import { Plane } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import React from 'react'
import * as THREE from 'three'
import { Assets } from '@/helpers/assetMap'
const Ground = () => {
  const texture = useLoader(THREE.TextureLoader, Assets.GRASS_TEXTURE)
  //  texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
  if (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(100, 100)
    texture.anisotropy = 16
  }
  return (
    <RigidBody type='fixed' colliders='cuboid' restitution={0} friction={0}>
      <Plane args={[1000, 1000]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial attach='material' map={texture} />
      </Plane>
    </RigidBody>
  )
}

export default Ground
