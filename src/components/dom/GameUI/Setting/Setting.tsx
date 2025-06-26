import { DialogTrigger } from '@/components/ui/dialog'
import { IoSettingsOutline } from 'react-icons/io5'

const Setting = () => {
  return (
    <div className='setting'>
      <DialogTrigger 
      // asChild
      >
        <div className='pointer-events-auto cursor-pointer  '>
          <IoSettingsOutline className='text-white text-2xl bold absolute right-2  top-1/2 ' />
        </div>
      </DialogTrigger>
    </div>
  )
}

export default Setting
