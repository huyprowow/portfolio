import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import './SettingDialog.scss'
import '@/styles/index.scss'
import SettingContent from './SettingContent/SettingContent'
export const SettingDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        {!open && children}
        <DialogContent
          className='DialogContent glass-effect '
          style={{
            zIndex: 10000,
            borderRadius: '0px',
          }}
          hideOverlay
          aria-describedby={
            undefined
          }
        >
          <DialogTitle className='sr-only'>Setting</DialogTitle>
          <SettingContent />
        </DialogContent>
      </form>
    </Dialog>
  )
}
