interface IDialogueAndCutSceneSlice {
  dialogue: null | {
    actor: string
    text: string
    bubbleText: string
    timeToHide: number
  }
  setDialogue: (dialogue: {
    actor: string
    text: string
    bubbleText: string
    timeToHide: number
  }) => void
}
