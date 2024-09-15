'use client'

import React, { useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three-stdlib'
import { Assets } from '@/helpers/assetMap'
import { CONSTANTS } from '@/helpers/constants'
import { RigidBody } from '@react-three/rapier'
import { useGLTF, useHelper } from '@react-three/drei'
import * as THREE from 'three'
const Room = () => {
  const room = useLoader(GLTFLoader, Assets.ROOM)
  const roomRef = useRef(null)
  // useHelper(roomRef.current, THREE.AxesHelper, {
  //   size: 100,
  // })
  room.scene.scale.setScalar(CONSTANTS.ROOM_SCALE)

  return (
    <>
      <axesHelper args={[500]} />
      <RigidBody
        type='fixed'
        // colliders='hull'
        colliders='trimesh'
        restitution={0}
        friction={0}
      >
        <primitive object={room.scene} ref={roomRef} />
      </RigidBody>
    </>
  )
}
export default Room
useLoader.preload(GLTFLoader, Assets.ROOM)
