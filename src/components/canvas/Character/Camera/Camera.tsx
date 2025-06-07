import { EGameMode } from '@/constant/enum'
import { Controls } from '@/helpers/constants'
import useDebugControl, { CameraOptions } from '@/hooks/useDebugControl'
import { useBoundStore } from '@/store/store'
import { OrbitControls, PerspectiveCamera, PointerLockControls, useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { RapierRigidBody, useRapier } from '@react-three/rapier'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface CameraProps {
  player: React.RefObject<RapierRigidBody>
}

const Camera = ({ player }: CameraProps) => {
  const [smoothCameraPosition] = useState(() => new THREE.Vector3(0, 0, 0))
  const [smoothCameraTarget] = useState(() => new THREE.Vector3(0, 0, 0))
  const tmpCameraPosition = useRef(new THREE.Vector3())
  const tmpCameraTarget = useRef(new THREE.Vector3())
  const height = 10
  const cameraDistance = 35
  useEffect(() => {
    if (player.current) {
      const rot = player.current.rotation()
      const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w))
      setYaw(euler.y + Math.PI) // Behind player
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * * Yaw
   * Definition: Horizontal rotation (left/right), usually around the Y axis.
   * Range: Usually unbounded (can rotate 360°), but you can wrap it to [0, 2π] or [-π, π] for convenience.
   *
   *  * Pitch
   * Definition: Vertical rotation (up/down), usually around the X axis.
   * Range: Clamped to avoid flipping the camera over the top or bottom.
   */
  const [yaw, setYaw] = useState(Math.PI) // Start in behind the player
  const [pitch, setPitch] = useState(0)
  const mouseSensitivity = {
    yaw: 0.002,
    pitch: 0.002,
  }

  /***
   * way to update yaw and pitch
   *
   */
  const minPitch = -Math.PI / 2 + 0.1
  const maxPitch = Math.PI / 2 - 0.1
  useEffect(() => {
    let dragging = false
    let lastX = 0
    let lastY = 0
    const onMouseDown = (e: MouseEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
    }
    const onMouseUp = () => (dragging = false)
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return
      const deltaX = e.clientX - lastX
      const deltaY = e.clientY - lastY
      setYaw((prev) => prev - deltaX * mouseSensitivity.yaw) // adjust sensitivity as needed
      setPitch((prev) => {
        const next = prev - deltaY * mouseSensitivity.pitch // adjust sensitivity as needed
        return Math.max(minPitch, Math.min(maxPitch, next))
      })
      lastX = e.clientX
      lastY = e.clientY
    }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const { camera } = useThree()
  const setFollowCameraFunc = useBoundStore((state) => state.setFollowCameraFunc)

  // TODO: groud y level should be dynamic based on the map
  // For now, we assume a flat ground at y = 0
  const groundY = 0 // Set this to your map's ground Y level
  // const { rapier, world } = useRapier()
  // function getHighestYWithRapier(x: number, z: number) {
  //   // Start high above the camera's X/Z
  //   const rayOrigin = { x, y: 1000, z }
  //   const rayDir = { x: 0, y: -1, z: 0 }
  //   const ray = new rapier.Ray(rayOrigin, rayDir)
  //   // Cast the ray down, max distance 2000 units
  //   const hit = world.castRay(ray, 2000, true)
  //   if (hit && hit.timeOfImpact !== undefined) {
  //     // Get the intersection point
  //     return rayOrigin.y + rayDir.y * hit.timeOfImpact
  //   }
  //   return -Infinity // or a sensible default
  // }

// TODO: implement recentering camera when player is moving
  
  const followCamera = useCallback(
    (delta: number) => {
      // console.log('followCamera')
      if (!player.current) return
      const playerPosition = player.current.translation()

      // Spherical coordinates for orbit
      const radius = cameraDistance
      let y = playerPosition.y + height + radius * Math.sin(pitch)
      const x = playerPosition.x + radius * Math.sin(yaw) * Math.cos(pitch)
      const z = playerPosition.z + radius * Math.cos(yaw) * Math.cos(pitch)

      if (y < groundY + 1) y = groundY + 1 // "+ 1" keeps camera slightly above ground

      // const terrainY = getHighestYWithRapier(x, z)
      // if (y < terrainY + 1) y = terrainY + 1

      const sphericalPosition = new THREE.Vector3(x, y, z)

      const cameraPosition = tmpCameraPosition.current
      cameraPosition.copy(sphericalPosition)

      const cameraTarget = tmpCameraTarget.current
      cameraTarget.copy(playerPosition)
      cameraTarget.y += height

      // console.log({
      //   playerPosition,
      //   cameraPosition,
      //   cameraTarget,
      // })
      smoothCameraPosition.lerp(cameraPosition, 5 * delta)
      smoothCameraTarget.lerp(cameraTarget, 5 * delta)

      camera.position.copy(smoothCameraPosition)
      camera.lookAt(smoothCameraTarget)
    },
    [player, camera, smoothCameraPosition, smoothCameraTarget, yaw, pitch, cameraDistance, height],
  )

  const gameMode = useBoundStore((state) => state.game.mode)
  //Register followCamera in store
  useEffect(() => {
    setFollowCameraFunc(followCamera)
    return () => setFollowCameraFunc(null) // Cleanup
  }, [followCamera, setFollowCameraFunc])

  useEffect(() => {
    if (gameMode === EGameMode.Follow) {
      //hiden cursor
      document.body.style.cursor = 'none'
    } else {
      document.body.style.cursor = 'default'
    }
  }, [gameMode])

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={75}
        // rotation={[0, Math.PI, 0]}
        // position={[
        //   //-5, 15, -10.5
        //   // -5, 15, -25,
        //   -5,
        //   15,
        //   -25, // Adjusted for better view
        // ]}
      >
        {/* <PointerLockControls
        addEventListener={undefined}
        hasEventListener={undefined}
        removeEventListener={undefined}
        dispatchEvent={undefined}
        /> */}
      </PerspectiveCamera>
    </>
  )
}

export default Camera
