import { IGameSlice, ReactStyleStateSetter } from '@/@types/store/IGameSlice'
import { EGameMode } from '@/constant/enum'
import { SettingsIcon } from 'lucide-react'
import { StateCreator } from 'zustand'
export const createGameSlice: StateCreator<IGameSlice> = (set) => ({
  game: {
    mode: EGameMode.Normal,
  },
  setGameMode: (modeOrSetterFn: ReactStyleStateSetter<EGameMode>) => {
    set((state) => {
      if (typeof modeOrSetterFn === 'function') {
        return { game: { ...state.game, mode: modeOrSetterFn(state.game.mode) } }
      }
      return { game: { ...state.game, mode: modeOrSetterFn } }
    })
  },

  ui: {
    isOpenSetting: false,
  },
  setIsOpenSetting: (isOpenSetting: boolean) => {
    set((state) => ({ ui: { ...state.ui, isOpenSetting: isOpenSetting } }))
  },
})
