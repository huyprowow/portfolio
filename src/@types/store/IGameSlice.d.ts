import { EGameMode } from '@/constant/enum'

// accept argument of type T or a callback using previous state of type T
type ReactStyleStateSetter<T> = T | ((prev: T) => T);

interface IGameSlice {
  game: {
    mode: EGameMode
  }
  setGameMode: (modeOrSetterFn: ReactStyleStateSetter<EGameMode>) => void
  ui: {
    isOpenSetting: boolean
  }
  setIsOpenSetting: (isOpenSetting: boolean) => void
}
