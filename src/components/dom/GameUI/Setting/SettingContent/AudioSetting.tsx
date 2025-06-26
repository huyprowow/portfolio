import { Slider } from '@/components/ui/slider'

const AudioSetting = () => {
  return (
    <div className='flex flex-col gap-2 h-full'>
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
