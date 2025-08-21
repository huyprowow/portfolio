import { createCharacterAnimationSlice } from './characterAnimation'
import { createCharacterSlice } from './character'
import { create } from 'zustand'
import { createCameraSlice, ICameraSlice } from './camera'
import { createGameSlice } from './game'
import { createRendererSlice } from './renderer'
import { createDialogueAndCutSceneSlice } from './dialogueAndCutScene'
export const useBoundStore = create<
  ICharacterSlice & ICharacterAnimationSlice & ICameraSlice & IGameSlice & IRendererSlice & IDialogueAndCutSceneSlice
>()((...a) => ({
  ...createCharacterSlice(...a),
  ...createCharacterAnimationSlice(...a),
  ...createCameraSlice(...a),
  ...createGameSlice(...a),
  ...createRendererSlice(...a),
  ...createDialogueAndCutSceneSlice(...a),
}))
