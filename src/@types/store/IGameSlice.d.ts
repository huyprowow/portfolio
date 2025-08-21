import { EGameMode } from '@/constant/enum'

// accept argument of type T or a callback using previous state of type T
type ReactStyleStateSetter<T> = T | ((prev: T) => T)

interface IGameSlice {
  game: {
    mode: EGameMode
  }
  setGameMode: (modeOrSetterFn: ReactStyleStateSetter<EGameMode>) => void
  ui: {
    isOpenSetting: boolean
  }
  setIsOpenSetting: (isOpenSetting: boolean) => void

  setting: {
    audio: {
      mute: boolean
    }
    control: {
      hide: boolean
    }
  }
  setSettingAudioMute: (mute: boolean) => void
  setSettingControlHide: (hide: boolean) => void
}
