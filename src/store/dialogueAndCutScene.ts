import { StateCreator } from 'zustand'

export const createDialogueAndCutSceneSlice: StateCreator<IDialogueAndCutSceneSlice> = (set) => ({
  dialogue: null,
  setDialogue: (dialogue) =>
    set((state) => ({
      dialogue: dialogue === null ? null : { ...state.dialogue, ...dialogue },
    })),
})
