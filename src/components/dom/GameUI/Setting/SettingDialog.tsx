import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import './SettingDialog.scss'
import '@/styles/index.scss'
import SettingContent from './SettingContent/SettingContent'
import { useBoundStore } from '@/store/store'
export const SettingDialog = ({ children }: { children: React.ReactNode }) => {
  const setIsOpenSetting = useBoundStore((state) => state.setIsOpenSetting)
  const isOpenSetting = useBoundStore((state) => state.ui.isOpenSetting)
  return (
    <Dialog open={isOpenSetting} onOpenChange={setIsOpenSetting}>
      <form>
        {!isOpenSetting && children}
        <DialogContent
          className='DialogContent glass-effect '
          style={{
            zIndex: 100000,
            borderRadius: '0px',
          }}
          hideOverlay
          aria-describedby={undefined}
        >
          <DialogTitle className='sr-only'>Setting</DialogTitle>
          <SettingContent />
        </DialogContent>
      </form>
    </Dialog>
  )
}
