import { useControls } from 'leva'
import { Box } from '@react-three/drei'
import { AxesHelper } from 'three'

export function DebugUI() {
  const { boxColor, boxSize, showAxes } = useControls('Debug Controls', {
    boxColor: '#ff69b4',
    boxSize: { value: 1, min: 0.1, max: 5, step: 0.1 },
    showAxes: true,
  })

  return (
    <>
      <Box position={[-8, 9, 7]} args={[boxSize, boxSize, boxSize]}>
        <meshStandardMaterial color={boxColor} wireframe />
      </Box>
      {showAxes && <primitive object={new AxesHelper(2)} position={[-8, 9, 7]} />}
    </>
  )
}
