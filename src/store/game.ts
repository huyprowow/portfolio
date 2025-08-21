import { IGameSlice, ReactStyleStateSetter } from '@/@types/store/IGameSlice'
import { EGameMode } from '@/constant/enum'
import { StateCreator } from 'zustand'
import dfGameSetting from '@/settings/df_game_setting.json'
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
  setting: {
    audio: {
      mute: !localStorage.getItem('df-game-setting-audio-mute')
        ? dfGameSetting.audio.mute
        : localStorage.getItem('df-game-setting-audio-mute') === 'true'
          ? true
          : false,
    },
    control: {
      hide: !localStorage.getItem('df-game-setting-control-hide')
        ? dfGameSetting.control.hide
        : localStorage.getItem('df-game-setting-control-hide') === 'true'
          ? true
          : false,
    },
  },
  setSettingAudioMute: (mute: boolean) => {
    set((state) => ({ setting: { ...state.setting, audio: { ...state.setting.audio, mute } } }))
  },
  setSettingControlHide: (hide: boolean) => {
    set((state) => ({ setting: { ...state.setting, control: { ...state.setting.control, hide } } }))
  },
})
