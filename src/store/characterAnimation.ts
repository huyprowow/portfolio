import { StateCreator } from 'zustand'
export const createCharacterAnimationSlice: StateCreator<ICharacterAnimationSlice> = (set) => ({
  currentAnimation: 'Idle',
  setCurrentAnimation: (animation: string) => set((state) => ({ currentAnimation: animation })),
})
