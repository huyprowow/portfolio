import { createCharacterAnimationSlice } from './characterAnimation'
import { createCharacterSlice } from './character'
import { create } from 'zustand'
import { createCameraSlice, ICameraSlice } from './camera'
import { createGameSlice } from './game'
import { IGameSlice } from '@/@types/store/IGameSlice'
import { createRendererSlice } from './renderer'
export const useBoundStore = create<ICharacterSlice & ICharacterAnimationSlice & ICameraSlice & IGameSlice & IRendererSlice>()(
  (...a) => ({
    ...createCharacterSlice(...a),
    ...createCharacterAnimationSlice(...a),
    ...createCameraSlice(...a),
    ...createGameSlice(...a),
    ...createRendererSlice(...a),
  }),
)
