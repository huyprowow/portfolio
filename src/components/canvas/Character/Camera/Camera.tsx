import { Controls } from '@/helpers/constants'
import useDebugControl, { CameraOptions } from '@/hooks/useDebugControl'
import { useBoundStore } from '@/store/store'
import { OrbitControls, PerspectiveCamera, PointerLockControls, useKeyboardControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface CameraProps {
  player: React.RefObject<RapierRigidBody>
}
const Camera = ({ player }: CameraProps) => {
  const [smoothCameraPosition] = useState(() => new THREE.Vector3(0, 15, -25))
  const [smoothCameraTarget] = useState(() => new THREE.Vector3(0, 15, -25))
  const tmpCameraPosition = useRef(new THREE.Vector3())
  const tmpCameraTarget = useRef(new THREE.Vector3())

  const { camera } = useThree()
  const setFollowCameraFunc = useBoundStore((state) => state.setFollowCameraFunc)
  
  const followCamera = useCallback(
    (delta: number) => {
      // console.log('followCamera')
      if (!player.current) return
      const playerPosition = player.current.translation()

      const cameraPosition = tmpCameraPosition.current
      cameraPosition.copy(playerPosition)

      const cameraTarget = tmpCameraTarget.current
      cameraTarget.copy(playerPosition)
      // console.log({
      //   playerPosition,
      //   cameraPosition,
      //   cameraTarget,
      // })

      cameraPosition.x -= 5
      cameraPosition.y += 15
      cameraPosition.z -= 25

      cameraTarget.x -= 5
      cameraTarget.y += 15
      cameraTarget.z += 5

      smoothCameraPosition.lerp(cameraPosition, 5 * delta)
      smoothCameraTarget.lerp(cameraTarget, 5 * delta)

      camera.position.copy(smoothCameraPosition)
      camera.lookAt(smoothCameraTarget)
    },
    [player, camera, smoothCameraPosition, smoothCameraTarget],
  )

  // Register followCamera in store
  useEffect(() => {
    setFollowCameraFunc(followCamera)
    return () => setFollowCameraFunc(null) // Cleanup
  }, [followCamera, setFollowCameraFunc])

  return (
    <PerspectiveCamera
      makeDefault
      fov={75}
      rotation={[0, Math.PI, 0]}
      position={[
        //-5, 15, -10.5
        // -5, 15, -25,
        -5, 15, -25 // Adjusted for better view
      ]}
    >
      {/* <PointerLockControls
        addEventListener={undefined}
        hasEventListener={undefined}
        removeEventListener={undefined}
        dispatchEvent={undefined}
      /> */}
    </PerspectiveCamera>
  )
}

export default Camera
