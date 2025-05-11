'use client'

import { forwardRef, Suspense, useEffect, useImperativeHandle, useRef } from 'react'
import {
  AccumulativeShadows,
  OrbitControls,
  PerspectiveCamera,
  PointerLockControls,
  RandomizedLight,
  View as ViewImpl,
} from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { useFrame, useThree } from '@react-three/fiber'
import { useBoundStore } from '@/store/store'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { ReactNode } from 'react'

interface CommonProps {
  color?: string
}

export function SceneCommon({ color = '#000000' }: CommonProps) {
  // const vec = new THREE.Vector3()
  // const target = new THREE.Vector3(0, 0, 0)
  // const character = useBoundStore((state) => state.character)

  // useFrame((state) => {
  //   if (!character || !('getWorldPosition' in character)) return
  //   target.lerp((character as THREE.Object3D).getWorldPosition(vec), 0.02)
  //   state.camera.lookAt(target)
  // })

  return (
    <Suspense fallback={null}>
      {color && <color attach='background' args={[color]} />}
      <ambientLight intensity={2} />
      <pointLight position={[20, 30, 10]} intensity={3} decay={0.2} />
      <pointLight position={[-10, -10, -10]} color='blue' intensity={3} decay={0.2} />
      <AccumulativeShadows temporal frames={100} scale={10}>
        <RandomizedLight amount={8} position={[5, 5, -10]} />
      </AccumulativeShadows>
    </Suspense>
  )
}

interface ViewProps {
  children: ReactNode
  orbit?: boolean
  className?: string
  target?: THREE.Vector3
}

const OrbitView = ({ target }: { target?: THREE.Vector3 }) => {
  const camera = useThree((state) => state.camera)

  // Get the camera's current target
  const cameraTarget = target ? target.clone() : new THREE.Vector3()
  camera.getWorldDirection(cameraTarget)
  cameraTarget.multiplyScalar(10).add(camera.position)

  return <OrbitControls camera={camera} target={cameraTarget} />
}

export function SceneView({ children, orbit = false, className = '', target }: ViewProps) {
  return (
    <Canvas className={className}>
      {orbit ? <OrbitView target={target} /> : null}
      {children}
    </Canvas>
  )
}
