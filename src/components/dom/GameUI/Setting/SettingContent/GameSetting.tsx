import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBoundStore } from '@/store/store'
import { useEffect, useState } from 'react'

const dataAnimationSelect = [
  {
    animationValue: 'Idle',
    animationList: [
      { value: '1', name: '1' },
      { value: '2', name: '2' },
    ],
    defaultValue: '1',
  },
  {
    animationValue: 'Walk',
    animationList: [
      { value: '1', name: '1' },
      { value: '2', name: '2' },
    ],
    defaultValue: '1',
  },
  {
    animationValue: 'Run',
    animationList: [
      { value: '1', name: '1' },
      { value: '2', name: '2' },
    ],
    defaultValue: '1',
  },
  {
    animationValue: 'Jump',
    animationList: [
      { value: '1', name: '1' },
      { value: '2', name: '2' },
    ],
    defaultValue: '1',
  },
  {
    animationValue: 'Attack',
    animationList: [
      { value: '1', name: '1' },
      { value: '2', name: '2' },
    ],
    defaultValue: '1',
  },
  {
    animationValue: 'Kick',
    animationList: [
      { value: '1', name: '1' },
      { value: '2', name: '2' },
    ],
    defaultValue: '1',
  },
  {
    animationValue: 'Block',
    animationList: [
      { value: '1', name: '1' },
      { value: '2', name: '2' },
    ],
    defaultValue: '1',
  },
  {
    animationValue: 'Power Up',
    animationList: [
      { value: '1', name: '1' },
      { value: '2', name: '2' },
    ],
    defaultValue: '1',
  },
]

const AnimationSelect = ({
  animationList,
  animationValue,
  defaultValue,
}: {
  animationList: {
    value: string
    name: string
  }[]
  animationValue: string
  defaultValue: string
}) => {
  return (
    <div className='flex flex-row gap-2  pb-2'>
      <p className='w-1/2'>{animationValue}</p>
      <div className='w-1/2'>
        <Select>
          <SelectTrigger defaultValue={defaultValue}>
            <SelectValue placeholder={animationValue} />
          </SelectTrigger>
          <SelectContent>
            {animationList.map((item, index) => (
              <SelectItem value={item.value} key={index}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
const GameSetting = () => {
  const { gl } = useBoundStore((state) => state.renderer)
  const [gpuInfo, setGpuInfo] = useState<{ vendor: string; renderer: string } | null>(null)
  useEffect(() => {
    if (gl) {
      const context = gl.getContext()
      const debugInfo = context.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const vendor = context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        const renderer = context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        setGpuInfo({ vendor, renderer })
      }
    }
  }, [gl])
  return (
    <>
      <div>
        <b>GPU Info</b>
        <div className='flex flex-row gap-2  pb-2'>
          <div className='pl-2 w-1/2'>Browser Renderer</div>
          <p className=' w-1/2 text-center'>{gpuInfo?.renderer ?? '...'}</p>
        </div>
        <b>Player animation</b>
        <div className='p-2'>
          {dataAnimationSelect.map((item, index) => (
            <AnimationSelect
              animationList={item.animationList}
              animationValue={item.animationValue}
              defaultValue={item.defaultValue}
              key={index}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default GameSetting
