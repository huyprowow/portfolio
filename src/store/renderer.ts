import { create, StateCreator } from 'zustand'

export const createRendererSlice: StateCreator<IRendererSlice> = (set) => ({
  renderer: {
    gl: null,
  },
  setGl: (gl) => set((state) => ({ renderer: { ...state.renderer, gl } })),
})
