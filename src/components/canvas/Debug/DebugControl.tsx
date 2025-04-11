import { Leva, useControls } from 'leva'
import { Stats } from '@react-three/drei'
export function DebugControls() {
  const { showStats } = useControls('Debug', {
    showStats: true,
  })

  return (
    <>
      <Leva />
      {showStats && <Stats className='stats' />}
    </>
  )
}
