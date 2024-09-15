import { createCharacterAnimationSlice } from './characterAnimation';
import { createCharacterSlice } from './character'
import { create } from 'zustand'
import { createCameraSwapSlice } from './cameraSwap'
export const useBoundStore = create<ICameraSwapSlice & ICharacterSlice & ICharacterAnimationSlice>()((...a) => ({
  ...createCameraSwapSlice(...a),
  ...createCharacterSlice(...a),
  ...createCharacterAnimationSlice(...a),
}))
