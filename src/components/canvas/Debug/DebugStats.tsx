import { useFrame } from '@react-three/fiber'
import { useState, useEffect } from 'react'

type StatsCallback = (fps: number, frameTime: number) => void

export function DebugStats({ onStatsUpdate }: { onStatsUpdate: StatsCallback }) {
  useFrame((_, delta) => {
    const fps = Math.round(1 / delta)
    const frameTime = Math.round(delta * 1000)
    onStatsUpdate(fps, frameTime)
  })

  return null
}

export function DebugOverlay({ fps, frameTime }: { fps: number; frameTime: number }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000,
      }}
    >
      <div>FPS: {fps}</div>
      <div>Frame Time: {frameTime}ms</div>
    </div>
  )
}
