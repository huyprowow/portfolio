import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import { useDebugMode } from '@/hooks/useDebugMode'
import { ETriggerMode } from '@/constant/enum'

type Props = {
  size: [number, number, number]
  center: [number, number, number]
  playerRef: React.RefObject<RapierRigidBody>
  onEnter?: () => void
  onExit?: () => void
  debug?: boolean
  color?: string
  mode?: ETriggerMode
}

export const BoxTriggerZone = ({ size, center, playerRef, onEnter, onExit, debug = false, color = 'blue',mode=ETriggerMode._3D}: Props) => {
  const wasInside = useRef(false)
  const box = useRef(new THREE.Box3())
  const isDebugMode = useDebugMode()

  // Update Box3 mỗi frame (nếu cần anim hoặc move)
  useEffect(() => {
    const s = new THREE.Vector3(...size)
    const c = new THREE.Vector3(...center)
    const half = s.clone().multiplyScalar(0.5)
    box.current.set(c.clone().sub(half), c.clone().add(half))
  }, [size, center])

  useFrame(() => {
    if (!playerRef.current) return

    const playerPos = new THREE.Vector3(
      playerRef.current.translation().x,
      playerRef.current.translation().y,
      playerRef.current.translation().z,
    )

    let isInside = false
    if (mode === ETriggerMode.XZ) {
      const min = box.current.min
      const max = box.current.max
      isInside = playerPos.x >= min.x && playerPos.x <= max.x && playerPos.z >= min.z && playerPos.z <= max.z
    } else {
      isInside = box.current.containsPoint(playerPos)
    }
    if (!wasInside.current && isInside) {
      wasInside.current = true
      onEnter?.()
    }

    if (wasInside.current && !isInside) {
      wasInside.current = false
      onExit?.()
    }
  })

  if (!debug || !isDebugMode) return null

  return (
    <mesh position={center}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
    </mesh>
  )
}
