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
import { useFrame } from '@react-three/fiber'
import { useBoundStore } from '@/store/store'
import * as THREE from 'three'

export const Common = ({ color }) => {
  const vec = new THREE.Vector3()
  const target = new THREE.Vector3(0, 0, 0)
  const character = useBoundStore((state) => state.character)
  // useFrame((state) => {
  // if(character===null) return;
  // target.lerp(character.getWorldPosition(vec), 0.02)
  // state.camera.lookAt(target)
  // })
  return (
    <Suspense fallback={null}>
      {color && <color attach='background' args={[color]} />}
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 30, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color='blue' />
      <AccumulativeShadows temporal frames={100} scale={10}>
        <RandomizedLight amount={8} position={[5, 5, -10]} />
      </AccumulativeShadows>
    </Suspense>
  )
}

const View = forwardRef(({ children, orbit, ...props }, ref) => {
  const localRef = useRef(null)
  const cameraIndex = useBoundStore((state) => state.cameraIndex)

  useImperativeHandle(ref, () => localRef.current)

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>
          {children}

          {
            orbit && cameraIndex === 0 && <OrbitControls makeDefault />
            // : <PointerLockControls />
          }
        </ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }
