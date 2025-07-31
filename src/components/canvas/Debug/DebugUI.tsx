import { useDebugMode } from '@/hooks/useDebugMode'
import { GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
import { Spector } from 'spectorjs'

export function DebugUI() {
  const isDebugMode = useDebugMode()
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
