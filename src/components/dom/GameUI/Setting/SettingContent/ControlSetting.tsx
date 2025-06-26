import { Slider } from '@/components/ui/slider'
import React from 'react'

const ControlSetting = () => {
  return (
    <div>
      <div className='flex flex-row gap-2 h-full'>
        <b className='w-1/3'>Mouse sensitivity</b>
        <Slider className='w-2/3' />
      </div>
    </div>
  )
}

export default ControlSetting
