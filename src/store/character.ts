import { StateCreator } from 'zustand';
export const createCharacterSlice: StateCreator<ICharacterSlice> = (set) => ({
  character: null,
  setCharacter: (character: object) => set((state) => ({ character })),
})

