import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useBoundStore } from '@/store/store'
import { useEffect, useState } from 'react'
import dfGameSetting from '@/settings/df_game_setting.json'

const AudioSetting = () => {
  const setting = useBoundStore((state) => state.setting)
  const setSettingAudioMute = useBoundStore((state) => state.setSettingAudioMute)
  useEffect(() => {
    const muteItem = localStorage.getItem('df-game-setting-audio-mute')
    if (!muteItem) {
      localStorage.setItem('df-game-setting-audio-mute', dfGameSetting.audio.mute.toString())
    }
  }, [])

  const toggleMute = () => {
    const muteItem = localStorage.getItem('df-game-setting-audio-mute')
    if (muteItem === 'true') {
      setSettingAudioMute(false)
      localStorage.setItem('df-game-setting-audio-mute', 'false')
    } else {
      setSettingAudioMute(true)
      localStorage.setItem('df-game-setting-audio-mute', 'true')
    }
  }
  return (
    <div className='flex flex-col gap-2 h-full'>
      <div className='flex flex-row gap-2'>
        <b className='w-1/3'>Mute</b>
        <div className='w-2/3'>
          <Switch checked={setting.audio.mute} onCheckedChange={toggleMute} />
        </div>
      </div>
      <div className='flex flex-row gap-2'>
        <b className='w-1/3'>BGM</b>
        <Slider className='w-2/3' />
      </div>
      <div className='flex flex-row gap-2'>
        <b className='w-1/3'>SFX</b>
        <Slider className='w-2/3' />
      </div>
      <div className='flex flex-row gap-2'>
        <b className='w-1/3'>Volume</b>
        <Slider className='w-2/3' />
      </div>
    </div>
  )
}

export default AudioSetting
