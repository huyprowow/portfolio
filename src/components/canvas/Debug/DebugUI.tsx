import { useDebugMode } from '@/hooks/useDebugMode'
import { useBoundStore } from '@/store/store'
import { GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
import { useEffect, useRef } from 'react'
import { Spector } from 'spectorjs'

export function DebugUI() {
  const isDebugMode = useDebugMode()
  const isOpenSetting = useBoundStore((state) => state.ui.isOpenSetting)

  if (isDebugMode) {
    const spector = new Spector()
    spector.displayUI()
  }
  

  return (
    <Leva
      hidden={!isDebugMode}
      //  collapsed={false}
    />
  )
}
