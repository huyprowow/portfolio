import React, { useEffect } from 'react'
import Control from './GameUI/Control/Control'
import Setting from './GameUI/Setting/Setting'
import { useBoundStore } from '@/store/store'
import { useKeyboardControls } from '@react-three/drei'
import { EGameMode } from '@/constant/enum'
import { SettingDialog } from './GameUI/Setting/SettingDialog'

const UI = () => {
  const gameMode = useBoundStore((state) => state.game.mode)
  const setGameMode = useBoundStore((state) => state.setGameMode)
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const changeMode = getKeys().changeMode
  useEffect(() => {
    // Subscribe to changeMode key
    const unsubscribe = subscribeKeys(
      (state) => state.changeMode,
      (pressed) => {
        if (pressed) {
          setGameMode(gameMode === EGameMode.Normal ? EGameMode.Follow : EGameMode.Normal)
        }
      },
    )
    return () => unsubscribe()
  }, [changeMode, gameMode, setGameMode, subscribeKeys])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10000,
      }}
    >
      <Control />
      <SettingDialog >
        <Setting />
      </SettingDialog>
    </div>
  )
}

export default UI
