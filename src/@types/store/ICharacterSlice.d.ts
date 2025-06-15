interface ICharacterSlice {
  character: object | null
  setCharacter: Function
  playerRef: RefObject<RapierRigidBody> | null
  setPlayerRef: (ref: RefObject<RapierRigidBody>) => void
}
