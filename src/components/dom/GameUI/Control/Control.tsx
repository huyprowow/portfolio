import { useKeyboardControls } from '@react-three/drei'
import React from 'react'
import './Control.scss'
import { mobileAndTabletCheck } from '@/helpers/mobileAndTabletCheck'
import { useBoundStore } from '@/store/store'
import { EGameMode } from '@/constant/enum'
import { GiBroadsword } from 'react-icons/gi'
import { GiSwordman } from 'react-icons/gi'
import { GiSwordsEmblem } from 'react-icons/gi'
import { logToGroup } from '@/helpers/logToGroup'
import { LOG_GROUP } from '@/constant/logGroup'
const Control = () => {
  const forward = useKeyboardControls((state) => state.forward)
  const back = useKeyboardControls((state) => state.back)
  const left = useKeyboardControls((state) => state.left)
  const right = useKeyboardControls((state) => state.right)
  const jump = useKeyboardControls((state) => state.jump)
  const attack = useKeyboardControls((state) => state.attack)
  const buff = useKeyboardControls((state) => state.buff)
  const block = useKeyboardControls((state) => state.block)
  const interact = useKeyboardControls((state) => state.interact)
  const isMb = mobileAndTabletCheck()
  const gameMode = useBoundStore((state) => state.game.mode)
  const interacting = useBoundStore((state) => state.interacting)
  const isInteractZone = useBoundStore((state) => state.isInteractZone)
  const handleTouchStart = ({ eventInitDict }: { eventInitDict: { key: string; code: string } }) => {
    logToGroup(LOG_GROUP.CONTROL, 'start touch')
    window.dispatchEvent(new KeyboardEvent('keydown', eventInitDict))
  }
  const handleTouchEnd = ({ eventInitDict }: { eventInitDict: { key: string; code: string } }) => {
    logToGroup(LOG_GROUP.CONTROL, 'end touch')
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', eventInitDict))
    }, 0)
  }
  const dialogue = useBoundStore((state) => state.dialogue)
  const setting = useBoundStore((state) => state.setting)
  logToGroup(LOG_GROUP.CONTROL, 'interact', interact)

  return (
    <div
      className='controls'
      style={{
        zIndex: 9999,
      }}
    >
      <div className='left-section'>
        {/* {(setting.control.hide === true && !isMb) && ( */}
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

        <div className='mode'>
          {isInteractZone && !interacting && (
            <button className={`key round ${interact ? 'active' : ''}`}>
              <span
                className='text-base relative top-1'
                onTouchStart={() => {
                  handleTouchStart({
                    eventInitDict: { key: 'x', code: 'KeyX' },
                  })
                  handleTouchEnd({
                    eventInitDict: { key: 'x', code: 'KeyX' },
                  })
                }}
              >
                X
              </span>
              <sub className='text-xs '>interact</sub>
            </button>
          )}
          {!isMb && (
            <button className={`key round ${gameMode === EGameMode.Follow ? 'active' : ''}`}>
              <span className='text-base relative top-1'>F</span>
              <sub className='text-xs '>{gameMode}</sub>
            </button>
          )}
        </div>
        {/* )} */}
      </div>

      {dialogue ? (
        <div className='flex items-center justify-center'>
          <div
            className='dialogue text-sm md:text-base lg:text-2xl  max-w-[300px] md:max-w-[500px] lg:max-w-[700px] mx-auto min-h-[60px]
         fixed bottom-[170px] sm:static sm:bottom-auto'
          >
            <span className='actor bold bg-white text-orange-500 rounded-md p-1 m-1 bg-opacity-75'>
              {dialogue.actor}:
              {/* sajdsjdjsd */}
            </span>{' '}
            <span className='text bold break-all whitespace-pre-wrap leading-relaxed'>
              {dialogue.text}
              {/* sajdsjdjsddcggddddddddddddd
                  cccccccccccccccccccccdddd
              snbbbbbbbbbbbbbbbbbbbbbbbbb bbbbbbbbbbbbbbbbbbbbbbbbbbbb */}
            </span>
          </div>
        </div>
      ) : null}
      <div className='skill'>
        <div className='raw'>
          <button
            className={`key round ${buff ? 'active' : ''} skill-top`}
            onTouchStart={() =>
              handleTouchStart({
                eventInitDict: { key: 'U', code: 'KeyU' },
              })
            }
            onTouchEnd={() =>
              handleTouchEnd({
                eventInitDict: { key: 'U', code: 'KeyU' },
              })
            }
          >
            <GiSwordman className='text-2xl relative top-1 ' />
            <sub className='text-xs'>U</sub>
          </button>
        </div>
        <div className='raw'>
          <button
            className={`key round  ${attack ? 'active' : ''} skill-main`}
            onTouchStart={() =>
              handleTouchStart({
                eventInitDict: { key: 'j', code: 'KeyJ' },
              })
            }
            onTouchEnd={() =>
              handleTouchEnd({
                eventInitDict: { key: 'j', code: 'KeyJ' },
              })
            }
          >
            <GiBroadsword className='text-2xl relative top-1 ' />
            <sub className='text-xs'>J</sub>
          </button>
        </div>
        <div className='raw'>
          <button
            className={`key round  ${block ? 'active' : ''} skill-bottom`}
            onTouchStart={() =>
              handleTouchStart({
                eventInitDict: { key: 'k', code: 'KeyK' },
              })
            }
            onTouchEnd={() =>
              handleTouchEnd({
                eventInitDict: { key: 'k', code: 'KeyK' },
              })
            }
          >
            <GiSwordsEmblem className='text-2xl relative top-1 ' />
            <sub className='text-xs'>K</sub>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Control
