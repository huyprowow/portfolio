import { useControls } from 'leva'
export const CameraOptions = {
  TPS: 0,
  FPS: 1,
  DEBUG: 2,
}

const useDebugControl = () => {
  const values = useControls({
    cameraMode: {
      options: CameraOptions,
      value: CameraOptions.TPS,
      label: 'Camera Mode',
    },
  })

  return values
}

export default useDebugControl
