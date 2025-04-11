'use client'

import { Physics } from '@react-three/rapier'
import { Sky, Stats } from '@react-three/drei'
import dynamic from 'next/dynamic'
import { useLoadingAssets } from '@/templates/hooks/useLoading'
import { usePageVisible } from '@/hooks/usePageVisible'
import { View } from '@/components/canvas/View'
import { useDebugMode } from '@/hooks/useDebugMode'
import { Controls } from '@/helpers/constants'
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { useMemo } from 'react'
import { Perf } from 'r3f-perf'
import { DebugControls } from '@/components/canvas/Debug/DebugControl'

const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })
const Character = dynamic(() => import('@/components/canvas/Character/Character').then((mod) => mod.default), {
  ssr: false,
})
const Room = dynamic(() => import('@/components/canvas/Map/Room').then((mod) => mod.default), {
  ssr: false,
})
const Ground = dynamic(() => import('@/components/canvas/Map/Ground').then((mod) => mod.default), {
  ssr: false,
})
// This component is used inside the Canvas/R3F context

export default function Page() {
  const loading = useLoadingAssets()
  const visible = usePageVisible()
  const isDebugMode = useDebugMode()

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.jump, keys: ['Space'] },
      { name: Controls.changeCamera, keys: ['KeyC'] },
    ],
    [],
  )

  return (
    <>
      {isDebugMode && <DebugControls />}

      <View orbit className='relative h-full sm:w-full'>
        <Physics debug={isDebugMode} gravity={[0, -9.8, 0]} timeStep='vary' paused={!visible || loading}>
          <Common color='#000000' />
          <Sky />
          <Ground />
          <Room />
          <KeyboardControls map={map}>
            <Character />
          </KeyboardControls>
          {/* Performance monitor needs to be inside Canvas but still properly positioned */}
          {isDebugMode && <Perf position='top-left' />}
        </Physics>
      </View>
    </>
  )
}
