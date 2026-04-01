import { DialogTrigger } from '@/components/ui/dialog'
import { IoSettingsOutline } from 'react-icons/io5'

const Setting = () => {
  return (
    <div className='setting'>
      <DialogTrigger 
      // asChild
      >
        <div className='pointer-events-auto cursor-pointer  '>
          <IoSettingsOutline className='text-white text-2xl bold ' />
        </div>
      </DialogTrigger>
    </div>
  )
}

export default Setting
