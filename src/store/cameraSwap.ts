import { StateCreator } from 'zustand'
export const createCameraSwapSlice: StateCreator<ICameraSwapSlice> = (set) => ({
  cameraIndex: 0,
  setCameraIndex: (index: number) => set((state) => ({ cameraIndex: index })),
})
