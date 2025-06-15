import { Physics } from '@react-three/rapier'
import { GizmoHelper, GizmoViewport, Sky, Stats } from '@react-three/drei'
import { useLoadingAssets } from '../templates/hooks/useLoading'
import { usePageVisible } from '../hooks/usePageVisible'
import { SceneView, SceneCommon } from '../components/canvas/View'
import { useDebugMode } from '../hooks/useDebugMode'
import { Controls } from '../helpers/constants'
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { Perf } from 'r3f-perf'
import { DebugUI } from '../components/canvas/Debug/DebugUI'
import Camera from '../components/canvas/Character/Camera/Camera'
import Room from '../components/canvas/Map/Room'
import Ground from '../components/canvas/Map/Ground'
import { useControls } from 'leva'
import Character from '@/components/canvas/Character/Character'
import UI from '@/components/dom/UI'
import Campfire from '@/components/canvas/Map/Campfire'
import { Tent } from '@/components/canvas/Map/Tent'
import WoodBlock from '@/components/canvas/Map/WoodBlock'

const startDebug = () => {
  const hash = window.location.hash
  if (!hash) {
    window.location.hash = '#debug'
  }
}

export default function Home() {
  const loading = useLoadingAssets()
  const visible = usePageVisible()
  const isDebugMode = useDebugMode()

  const [{ orbit }, setOrbit] = useControls('Camera', () => ({
    orbit: false,
  }))

  useEffect(() => {
    if (!isDebugMode) {
      startDebug()
    }
  }, [isDebugMode])

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.jump, keys: ['Space'] },
      { name: Controls.changeCamera, keys: ['KeyC'] },
      { name: Controls.changeMode, keys: ['KeyF'] },
    ],
    [],
  )

  return (
    <>
      <DebugUI />
      <KeyboardControls map={map}>
        <UI />
        <SceneView className='relative h-full sm:w-full' orbit={orbit}>
          <SceneCommon color='#000000' />
          <Sky />
          {/* <Camera /> */}
          <Physics debug={isDebugMode} gravity={[0, -9.8, 0]} timeStep='vary' paused={!visible || loading}>
            <Ground />
            <Campfire />
            <Tent />
            <WoodBlock />
            {/* <Room /> */}
            <Character orbit={orbit} />

            {isDebugMode && (
              <>
                <Perf position='top-left' />
                <GizmoHelper alignment='bottom-right' margin={[80, 80]}>
                  <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor='black' />
                </GizmoHelper>
              </>
            )}
          </Physics>
        </SceneView>
      </KeyboardControls>
    </>
  )
}
