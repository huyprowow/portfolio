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
import cameraSetting from '@/settings/df_camera_setting.json'
import { calculateCombineMask } from '@/helpers/calculateCombineMask'
import useSetting from '@/hooks/useSetting'
import { useDebugMode } from '@/hooks/useDebugMode'
import characterSetting from '@/settings/df_character_setting.json'
import mapSetting from '@/settings/df_map_setting.json'

interface CameraProps {
  player: React.RefObject<RapierRigidBody>
}

const Camera = ({ player }: CameraProps) => {
  const [smoothCameraPosition] = useState(() => new THREE.Vector3(0, 0, 0))
  const [smoothCameraTarget] = useState(() => new THREE.Vector3(0, 0, 0))
  const tmpCameraPosition = useRef(new THREE.Vector3())
  const tmpCameraTarget = useRef(new THREE.Vector3())
  const height = cameraSetting.height.default
  const cameraDistance = cameraSetting.distance.default
  const gameMode = useBoundStore((state) => state.game.mode)
  const { collision_group } = useSetting()

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
  const mouseSensitivity: { yaw: number; pitch: number } = cameraSetting.mouseSensitivity
  const touchSensitivity: { yaw: number; pitch: number } = cameraSetting.touchSensitivity

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
      // console.log({
      //   yaw,
      //   pitch,
      //   movementX: e.movementX,
      //   movementY: e.movementY,
      // })
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [gameMode, mouseSensitivity])

  const { camera, scene } = useThree()
  const setFollowCameraFunc = useBoundStore((state) => state.setFollowCameraFunc)
  const isDebugMode = useDebugMode()
  // TODO: groud y level should be dynamic based on the map
  // For now, we assume a flat terrain at y = 0
  // const terrainY = 0 // Set this to your map's terrain Y level
  const { rapier, world } = useRapier()
  function getTerrainYWithRapier(playerPosition: { x: number; y: number; z: number } = { x: 0, y: 1, z: 0 }) {
    // Start high above the camera's X/Z
    let maxTimeOfImpact = mapSetting.maxTerrainHeight
    // if (inHouse) {
    //   maxTimeOfImpact = characterSetting.collision.radius * 2
    // }
    const rayOrigin = {
      x: playerPosition.x,
      y: playerPosition.y,
      z: playerPosition.z,
    }
    const rayDir = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(rayOrigin, rayDir)
    // Cast the ray down, max distance 2000 units
    const hit = world.castRay(ray, maxTimeOfImpact, true)

    if (isDebugMode) {
      const debugRay = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(rayOrigin.x, rayOrigin.y, rayOrigin.z),
          new THREE.Vector3(rayOrigin.x, rayOrigin.y - maxTimeOfImpact, rayOrigin.z),
        ]),
        new THREE.LineBasicMaterial({ color: 0xff0000 }),
      )
      scene.add(debugRay)
      setTimeout(() => {
        scene.remove(debugRay)
      }, 1000)
    }

    if (hit && hit.timeOfImpact !== undefined) {
      // Get the intersection point
      return rayOrigin.y + rayDir.y * hit.timeOfImpact
    }
    return -Infinity // or a sensible default
  }

  function getCeilingYWithRapier(playerPosition: { x: number; y: number; z: number } = { x: 0, y: 1, z: 0 }) {
    let maxTimeOfImpact = 1000
    const rayOrigin = {
      x: playerPosition.x,
      y: playerPosition.y + characterSetting.collision.halfHeight * 2 + characterSetting.collision.radius * 2 + 0.01,
      z: playerPosition.z,
    }
    const rayDir = { x: 0, y: 1, z: 0 }
    const ray = new rapier.Ray(rayOrigin, rayDir)
    const hit = world.castRay(ray, maxTimeOfImpact, true)

    if (isDebugMode) {
      const debugRay = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(rayOrigin.x, rayOrigin.y, rayOrigin.z),
          new THREE.Vector3(rayOrigin.x, rayOrigin.y + maxTimeOfImpact, rayOrigin.z),
        ]),
        new THREE.LineBasicMaterial({ color: 0xff0000 }),
      )
      scene.add(debugRay)
      setTimeout(() => {
        scene.remove(debugRay)
      }, 1000)
    }
    if (hit && hit.timeOfImpact !== undefined) {
      return rayOrigin.y + rayDir.y * hit.timeOfImpact
    }
    return Infinity // or a sensible default
  }

  const inHouse = useBoundStore((state) => state.inHouse)

  //logic for camera follow player
  const followCamera = useCallback(
    (delta: number) => {
      // console.log('followCamera')
      if (!player.current) return
      const playerPosition = player.current.translation()

      // Spherical coordinates for orbit
      const radius = inHouse ? cameraSetting.distance.inHouse : cameraDistance
      let y = playerPosition.y + height + radius * Math.sin(pitch)
      const x = playerPosition.x + radius * Math.sin(yaw) * Math.cos(pitch)
      const z = playerPosition.z + radius * Math.cos(yaw) * Math.cos(pitch)

      // if (y < terrainY + 1) y = terrainY + 1 // "+ 1" keeps camera slightly above terrain

      const terrainY = getTerrainYWithRapier(playerPosition)
      const ceilingY = getCeilingYWithRapier(playerPosition)
      const minY = terrainY + 0.01
      const maxY = ceilingY - 0.01
        
      // console.log({
      //   ceilingY,
      //   terrainY,
      //   y,
      // })
      if (y < minY) y = minY
      if (y > maxY) y = maxY

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
      const lerpMultiplier = 5
      smoothCameraPosition.lerp(cameraPosition, lerpMultiplier * delta)
      smoothCameraTarget.lerp(cameraTarget, lerpMultiplier * delta)

      camera.position.copy(smoothCameraPosition)
      camera.lookAt(smoothCameraTarget)
    },
    [player, camera, smoothCameraPosition, smoothCameraTarget, yaw, pitch, cameraDistance, height, inHouse],
  )

  //Register followCamera in store
  useEffect(() => {
    setFollowCameraFunc(followCamera)
    return () => setFollowCameraFunc(null) // Cleanup
  }, [followCamera, setFollowCameraFunc])

  const setGameMode = useBoundStore((state) => state.setGameMode)

  // //set game mode to follow
  useEffect(() => {
    if (isMb) {
      setGameMode(EGameMode.Follow)
    }
  }, [])

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
