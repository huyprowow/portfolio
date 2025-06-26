import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const GraphicSetting = () => {
  return (
    <div className='flex flex-col gap-2 h-full'>
      <div className='flex flex-row gap-2'>
        <b className='w-1/3'>Lighting</b>
        <Slider className='w-2/3' />
      </div>
      <div className='flex flex-row gap-2'>
        <b className='w-1/3'>Bloom</b>
        <div className='w-2/3'>
          <Switch />
        </div>
      </div>
    </div>
  )
}

export default GraphicSetting
