import { Slider } from '@/components/ui/slider'
import React, { useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { useBoundStore } from '@/store/store'
import dfGameSetting from '@/settings/df_game_setting.json'

const ControlSetting = () => {
  const setting = useBoundStore((state) => state.setting)
  const setSettingControlHide = useBoundStore((state) => state.setSettingControlHide)
  useEffect(() => {
    const hideItem = localStorage.getItem('df-game-setting-control-hide')
    if (!hideItem) {
      localStorage.setItem('df-game-setting-control-hide', dfGameSetting.control.hide.toString())
    }
  }, [])

  const toggleHide = () => {
    const hideItem = localStorage.getItem('df-game-setting-control-hide')
    if (hideItem === 'true') {
      setSettingControlHide(false)
      localStorage.setItem('df-game-setting-control-hide', 'false')
    } else {
      setSettingControlHide(true)
      localStorage.setItem('df-game-setting-control-hide', 'true')
    }
  }
  return (
    <div>
      <div className='flex flex-row gap-2 h-full'>
        <b className='w-1/3'>Mouse sensitivity</b>
        <Slider className='w-2/3' />
      </div>
      <div className='flex flex-row gap-2 h-full'>
        <b className='w-1/3'>Hidden Control</b>
        <div className='w-2/3'>
          <Switch checked={setting.control.hide} onCheckedChange={toggleHide} />
        </div>
      </div>
    </div>
  )
}

export default ControlSetting
