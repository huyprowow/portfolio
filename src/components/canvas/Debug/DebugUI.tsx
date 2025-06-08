import { useDebugMode } from '@/hooks/useDebugMode'
import { GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
export function DebugUI() {
  const isDebugMode = useDebugMode()

  return (
    <Leva
      hidden={!isDebugMode}
      //  collapsed={false}
    />
  )
}
