import { StateCreator } from 'zustand'
export const createCharacterSlice: StateCreator<ICharacterSlice> = (set) => ({
  character: null,
  setCharacter: (character: object) => set(() => ({ character })),
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),
  isInteractZone: false,
  setIsInteractZone: (isInteractZone: boolean) => set({ isInteractZone }),
  interacting: null,
  setInteracting: (interacting: IInteract|null) => set({ interacting }),
})
