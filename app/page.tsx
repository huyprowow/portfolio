'use client'

import RenderStats from '@/helpers/components/Stats/RenderStats'
import dynamic from 'next/dynamic'
import { Physics } from '@react-three/rapier'
import { Center, Cloud, GizmoHelper, GizmoViewport, Sky } from '@react-three/drei'
import { useLoadingAssets } from '@/templates/hooks/useLoading'
import { usePageVisible } from '@/templates/hooks/usePageVisible'
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
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

export default function Page() {
  const loading =useLoadingAssets();
   const visible = usePageVisible()
  return (
    <>
      <View orbit className='relative h-full sm:w-full'>
        <Physics debug gravity={[0, -9.8, 0]} timeStep='vary' paused={!visible || loading}>
          <Common />
          <RenderStats />
          <GizmoHelper
            alignment='bottom-right' // widget alignment within scene
            margin={[80, 80]} // widget margins (X, Y)
            // onUpdate={/* called during camera animation  */}
            // onTarget={/* return current camera target (e.g. from orbit controls) to center animation */}
            // renderPriority={/* use renderPriority to prevent the helper from disappearing if there is another useFrame(..., 1)*/}
          >
            <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor='black' />
            {/* alternative: <GizmoViewcube /> */}
          </GizmoHelper>
          {/**random <Cloud/> in sky */}
          {/* {Array.from({ length: 4 }).map((_, index) => (
            <Cloud
              key={index}
              segments={20}
              volume={1000}
              scale={Math.random() * 10 + 10}
              fade={100}
              position={[Math.random() * 500 - 300, Math.random() * 10 + 400, Math.random() * 500 - 300]}
            />
          ))} */}
          <Sky />
          <Ground />
          <Room />
          <Character />
        </Physics>
      </View>
    </>
  )
}
