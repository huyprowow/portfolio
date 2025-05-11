import { createCharacterAnimationSlice } from './characterAnimation'
import { createCharacterSlice } from './character'
import { create } from 'zustand'
import { createCameraSlice, ICameraSlice } from './camera'
export const useBoundStore = create<ICharacterSlice & ICharacterAnimationSlice & ICameraSlice>()((...a) => ({
  ...createCharacterSlice(...a),
  ...createCharacterAnimationSlice(...a),
  ...createCameraSlice(...a),
}))
