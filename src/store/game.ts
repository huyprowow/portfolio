import { IGameSlice, ReactStyleStateSetter } from '@/@types/store/IGameSlice'
import { EGameMode } from '@/constant/enum'
import { StateCreator } from 'zustand'
export const createGameSlice: StateCreator<IGameSlice> = (set) => ({
  game: {
    mode: EGameMode.Follow,
  },
  setGameMode: (modeOrSetterFn: ReactStyleStateSetter<EGameMode>) => {
    set((state) => {
      if (typeof modeOrSetterFn === 'function') {
        return { game: { ...state.game, mode: modeOrSetterFn(state.game.mode) } }
      }
      return { game: { ...state.game, mode: modeOrSetterFn } }
    })
  },
})
