interface ICharacterSlice {
  character: object | null
  setCharacter: Function
  playerRef: RefObject<RapierRigidBody> | null
  setPlayerRef: (ref: RefObject<RapierRigidBody>) => void
  isInteractZone: boolean
  setIsInteractZone: (isInteractZone: boolean) => void
  interacting : IInteract| null
  setInteracting: (interacting:IInteract|null) => void

}
