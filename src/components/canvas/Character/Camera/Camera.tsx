import { EGameMode } from '@/constant/enum'
import { Controls } from '@/helpers/constants'
import { mobileAndTabletCheck } from '@/helpers/mobileAndTabletCheck'
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
  const height = 14
  const cameraDistance = 26
  const gameMode = useBoundStore((state) => state.game.mode)

  // setting camera behind player first time
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
    yaw: 0.0005,
    pitch: 0.00025,
  }
  const touchSensitivity = {
    yaw: 0.088,
    pitch: 0.033,
  }

  /***
   * way to update yaw and pitch
   *
   */
  const minPitch = -Math.PI / 2 + 0.2
  const maxPitch = Math.PI / 2 - 0.1
  const isMb = mobileAndTabletCheck()

  //mb camera control
  useEffect(() => {
    if (!isMb) return
    let lastTouchX: number | null = null
    let lastTouchY: number | null = null

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX
        lastTouchY = e.touches[0].clientY
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && lastTouchX !== null && lastTouchY !== null && gameMode === EGameMode.Follow) {
        const touch = e.touches[0]
        const deltaX = touch.clientX - lastTouchX
        const deltaY = touch.clientY - lastTouchY
        setYaw((prev) => prev - deltaX * touchSensitivity.yaw)
        setPitch((prev) => {
          const next = prev + deltaY * touchSensitivity.pitch
          return Math.max(minPitch, Math.min(maxPitch, next))
        })
        lastTouchX = touch.clientX
        lastTouchY = touch.clientY
      }
    }

    const onTouchEnd = () => {
      lastTouchX = null
      lastTouchY = null
    }

    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [gameMode, touchSensitivity])

  // request pointer lock for desktop
  useEffect(() => {
    if (isMb) return
    // When entering Follow mode, request pointer lock
    if (gameMode === EGameMode.Follow) {
      // Try to request pointer lock
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock()
      }
    } else {
      // Exit pointer lock if leaving Follow mode
      if (document.pointerLockElement === document.body) {
        document.exitPointerLock()
      }
    }
  }, [gameMode])

  //set game mode to normal when pointer lock is lost (change tab or something)
  useEffect(() => {
    const onPointerLockChange = () => {
      if (document.pointerLockElement !== document.body) {
        // Pointer lock is lost!
        console.log('Pointer lock lost')
        setGameMode(EGameMode.Normal)
        // You can set a state here to show a "Click to resume" overlay, pause the game, etc.
      } else {
        // Pointer lock is active
        console.log('Pointer lock active')
      }
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange)
    }
  }, [])

  //pc camera control
  useEffect(() => {
    if (isMb) return
    // Handler for mouse movement using pointer lock
    const onMouseMove = (e: MouseEvent) => {
      if (gameMode !== EGameMode.Follow) return
      setYaw((prev) => prev - e.movementX * mouseSensitivity.yaw)
      setPitch((prev) => {
        const next = prev + e.movementY * mouseSensitivity.pitch //invert y movement
        return Math.max(minPitch, Math.min(maxPitch, next))
      })
      console.log({
        yaw,
        pitch,
        movementX: e.movementX,
        movementY: e.movementY,
      })
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [gameMode, mouseSensitivity])

  const { camera } = useThree()
  const setFollowCameraFunc = useBoundStore((state) => state.setFollowCameraFunc)

  // TODO: groud y level should be dynamic based on the map
  // For now, we assume a flat ground at y = 0
  // const groundY = 0 // Set this to your map's ground Y level
  const { rapier, world } = useRapier()
  function getHighestYWithRapier(x: number, z: number) {
    // Start high above the camera's X/Z
    const rayOrigin = { x, y: 1000, z }
    const rayDir = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(rayOrigin, rayDir)
    // Cast the ray down, max distance 2000 units
    const hit = world.castRay(ray, 2000, true)
    if (hit && hit.timeOfImpact !== undefined) {
      // Get the intersection point
      return rayOrigin.y + rayDir.y * hit.timeOfImpact
    }
    return -Infinity // or a sensible default
  }

  //logic for camera follow player
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

      // if (y < groundY + 1) y = groundY + 1 // "+ 1" keeps camera slightly above ground

      const terrainY = getHighestYWithRapier(x, z)
      if (y < terrainY + 1) y = terrainY + 1

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

  //Register followCamera in store
  useEffect(() => {
    setFollowCameraFunc(followCamera)
    return () => setFollowCameraFunc(null) // Cleanup
  }, [followCamera, setFollowCameraFunc])

  const setGameMode = useBoundStore((state) => state.setGameMode)

  // //set game mode to follow
  // useEffect(() => {
  //   if (isMb) {
  //     setGameMode(EGameMode.Follow)
  //   }
  // }, [])

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
