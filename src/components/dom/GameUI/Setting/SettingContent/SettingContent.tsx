import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import '@/styles/index.scss'
import GameSetting from './GameSetting'
import ControlSetting from './ControlSetting'
import GraphicSetting from './GraphicSetting'
import AudioSetting from './AudioSetting'
import DeveloperSetting from './DeveloperSetting'

const SettingContent = () => {
  return (
    <div className='gap-6 h-full'>
      <Tabs defaultValue='game' className='h-full'>
        <div className='flex justify-center'>
          <TabsList className='max-w-sm glass-effect'>
            <TabsTrigger value='game'>Game</TabsTrigger>
            <TabsTrigger value='control'>Control</TabsTrigger>
            <TabsTrigger value='audio'>Audio</TabsTrigger>
            <TabsTrigger value='graphic'>Graphic</TabsTrigger>
            <TabsTrigger value='developer'>Developer</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='game' className='p-2 h-full'>
          <GameSetting  />
        </TabsContent>
        <TabsContent value='control' className='p-2 h-full'>
          <ControlSetting />
        </TabsContent>
        <TabsContent value='graphic' className='p-2 h-full'>
          <GraphicSetting />
        </TabsContent>
        <TabsContent value='audio' className='p-2 h-full'>
          <AudioSetting />
        </TabsContent>
        <TabsContent value='developer' className='p-2 h-full'>
          <DeveloperSetting />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingContent
