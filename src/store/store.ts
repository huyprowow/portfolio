import { createCharacterAnimationSlice } from './characterAnimation'
import { createCharacterSlice } from './character'
import { create } from 'zustand'
import { createCameraSlice, ICameraSlice } from './camera'
import { createGameSlice } from './game'
import { createRendererSlice } from './renderer'
import { createDialogueAndCutSceneSlice } from './dialogueAndCutScene'
import { IGameSlice } from '@/@types/store/IGameSlice'
import { createWaterMatrixSlice } from './waterMatrix'

export const useBoundStore = create<
  ICharacterSlice &
    ICharacterAnimationSlice &
    ICameraSlice &
    IGameSlice &
    IRendererSlice &
    IDialogueAndCutSceneSlice &
    IWaterMatrixSlice
>()((...a) => ({
  ...createCharacterSlice(...a),
  ...createCharacterAnimationSlice(...a),
  ...createCameraSlice(...a),
  ...createGameSlice(...a),
  ...createRendererSlice(...a),
  ...createDialogueAndCutSceneSlice(...a),
  ...createWaterMatrixSlice(...a),
}))
