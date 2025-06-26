import { useKeyboardControls } from '@react-three/drei'
import React from 'react'
import './Control.scss'
import { mobileAndTabletCheck } from '@/helpers/mobileAndTabletCheck'
import { useBoundStore } from '@/store/store'
import { EGameMode } from '@/constant/enum'

const Control = () => {
  const forward = useKeyboardControls((state) => state.forward)
  const back = useKeyboardControls((state) => state.back)
  const left = useKeyboardControls((state) => state.left)
  const right = useKeyboardControls((state) => state.right)
  const jump = useKeyboardControls((state) => state.jump)
  const isMb = mobileAndTabletCheck()
  const gameMode = useBoundStore((state) => state.game.mode)
  const handleTouchStart = ({ eventInitDict }: { eventInitDict: { key: string; code: string } }) => {
    console.log('start touch')
    window.dispatchEvent(new KeyboardEvent('keydown', eventInitDict))
  }
  const handleTouchEnd = ({ eventInitDict }: { eventInitDict: { key: string; code: string } }) => {
    console.log('end touch')
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', eventInitDict))
    }, 0)
  }
  return (
      <div className='controls' style={{
        zIndex: 9999
      }}>
        <div className='move'>
          <div className='raw'>
            <button
              className={`key ${forward ? 'active' : ''}`}
              onTouchStart={() =>
                handleTouchStart({
                  eventInitDict: { key: 'w', code: 'KeyW' },
                })
              }
              onTouchEnd={() =>
                handleTouchEnd({
                  eventInitDict: { key: 'w', code: 'KeyW' },
                })
              }
            >
              W
            </button>
          </div>
          <div className='raw'>
            <button
              className={`key ${left ? 'active' : ''}`}
              onTouchStart={() =>
                handleTouchStart({
                  eventInitDict: { key: 'a', code: 'KeyA' },
                })
              }
              onTouchEnd={() =>
                handleTouchEnd({
                  eventInitDict: { key: 'a', code: 'KeyA' },
                })
              }
            >
              A
            </button>
            <button
              className={`key ${back ? 'active' : ''}`}
              onTouchStart={() =>
                handleTouchStart({
                  eventInitDict: { key: 's', code: 'KeyS' },
                })
              }
              onTouchEnd={() =>
                handleTouchEnd({
                  eventInitDict: { key: 's', code: 'KeyS' },
                })
              }
            >
              S
            </button>
            <button
              className={`key ${right ? 'active' : ''}`}
              onTouchStart={() =>
                handleTouchStart({
                  eventInitDict: { key: 'd', code: 'KeyD' },
                })
              }
              onTouchEnd={() =>
                handleTouchEnd({
                  eventInitDict: { key: 'd', code: 'KeyD' },
                })
              }
            >
              D
            </button>
          </div>
          <div className='raw'>
            <button
              className={`key large ${jump ? 'active' : ''}`}
              onTouchStart={() =>
                handleTouchStart({
                  eventInitDict: { key: ' ', code: 'Space' },
                })
              }
              onTouchEnd={() =>
                handleTouchEnd({
                  eventInitDict: { key: ' ', code: 'Space' },
                })
              }
            >
              Space
            </button>
          </div>
        </div>
        {!isMb && (
          <div className='mode'>
            <button className={`key round flex flex-col ${gameMode === EGameMode.Follow ? 'active' : ''}`}>
              <span className='text-base relative top-1'>F</span>
              <sub className='text-xs '>{gameMode}</sub>
            </button>
          </div>
        )}
      </div>
  )
}

export default Control
