interface IRendererSlice {
  renderer: {
    gl: WebGLRenderer | null
  }
  setGl: (gl: WebGLRenderer) => void
}