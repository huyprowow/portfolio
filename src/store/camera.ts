import { StateCreator } from 'zustand'

export interface ICameraSlice {
  followCameraFunc: ((deltaTime: number) => void) | null
  setFollowCameraFunc: (followCameraFunc: ((deltaTime: number) => void) | null) => void
}

export const createCameraSlice: StateCreator<ICameraSlice> = (set) => ({
  followCameraFunc: null,
  setFollowCameraFunc: (followCameraFunc) => set({ followCameraFunc }),
})
