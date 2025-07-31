import { Physics } from '@react-three/rapier'
import { GizmoHelper, GizmoViewport, Sky, Stats } from '@react-three/drei'
import { useLoadingAssets } from '../hooks/useLoading'
import { usePageVisible } from '../hooks/usePageVisible'
import { SceneView, SceneCommon } from '../components/canvas/View'
import { useDebugMode } from '../hooks/useDebugMode'
import { Controls } from '../helpers/constants'
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { Perf } from 'r3f-perf'
import { DebugUI } from '../components/canvas/Debug/DebugUI'
import { useControls } from 'leva'
import Character from '@/components/canvas/Character/Character'
import UI from '@/components/dom/UI'
import Map from '@/components/canvas/Map/Map'
import dfGameSetting from '@/settings/df_game_setting.json'
import useAudio from '@/hooks/useAudio'
import Tutorial from '@/components/dom/Tutorial'
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
    console.log(import.meta.env.VITE_DEBUG_MODE)

    if (import.meta.env.VITE_DEBUG_MODE === 'true' && !isDebugMode) {
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
  const { bgm } = useAudio()
  useEffect(() => {
    if (dfGameSetting.audio.mute) return
    const bgmName = dfGameSetting.audio.bgm.default.name
    const currentBgm = bgm.filter((item) => item.key === bgmName)[0]
    currentBgm.value.currentTime = 0
    currentBgm.value.loop = true
    currentBgm.value.volume = dfGameSetting.audio.bgm.default.volume
    currentBgm.value.play()
  }, [bgm])

  return (
    <>
      <DebugUI />
      <KeyboardControls map={map}>
        <Tutorial />
        <UI />
        <SceneView className='relative h-full sm:w-full' orbit={orbit}>
          <SceneCommon color='#000000' />
          <Sky />
          <Physics debug={isDebugMode} gravity={[0, -9.8, 0]} timeStep='vary' paused={!visible || loading}>
            <Map />
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
