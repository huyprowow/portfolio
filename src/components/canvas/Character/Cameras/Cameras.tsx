import { Controls } from '@/helpers/constants'
import { useBoundStore } from '@/store/store'
import { OrbitControls, PerspectiveCamera, useKeyboardControls } from '@react-three/drei'
import { useCallback, useEffect } from 'react'

const Cameras = () => {
  const cameraIndex = useBoundStore((state) => state.cameraIndex)
  const setCameraIndex = useBoundStore((state) => state.setCameraIndex)

  const { changeCamera }: any = useKeyboardControls<Controls>((state: any) => state)
  const onKeyup = useCallback(
    ({ key }: KeyboardEvent) => {
      if (changeCamera) {
        setCameraIndex(cameraIndex === 0 ? 1 : 0)
      }
    },
    [cameraIndex, changeCamera, setCameraIndex],
  )
  useEffect(() => {
    window.addEventListener('keyup', onKeyup, { passive: true })
    return () => {
      window.removeEventListener('keyup', onKeyup)
    }
  }, [onKeyup])
  return cameraIndex === 0 ? (
    <PerspectiveCamera makeDefault={cameraIndex === 0} fov={400} position={[-120, 120, 70]} />
  ) : (
    <PerspectiveCamera makeDefault={cameraIndex === 1} fov={75} rotation={[0, Math.PI, 0]} position={[-5, 15, -10.5]}>
      {/* <PointerLockControls
        addEventListener={undefined}
        hasEventListener={undefined}
        removeEventListener={undefined}
        dispatchEvent={undefined}
      /> */}
      <OrbitControls />
    </PerspectiveCamera>
  )
}

export default Cameras
