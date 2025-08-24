import { Linkedin, Github, Mail } from 'lucide-react'

const DeveloperSetting = () => {
  return (
    <div className='h-full'>
      <div
        className='flex flex-col grow '
        style={{
          height: 'calc(100% - 100px)',
        }}
      >
        <b>Version update details</b>
        <div className='p-2 m-2 glass-effect h-full'>
          <p>v0.0.1_demo</p>
          abc xyz
        </div>
      </div>
      <div className='h-100px'>
        <b>Developer info</b>
        <div className='p-2 m-2 glass-effect  flex flex-row gap-2 justify-between'>
          <div className='flex flex-row gap-2'>
            {/* <Linkedin />|<Github />| */}
            <a href='mailto:huyprowow@gmail.com'>
              <Mail />
            </a>
          </div>
          <div>Bùi Quang Huy @ 2025</div>
        </div>
      </div>
    </div>
  )
}

export default DeveloperSetting
