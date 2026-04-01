interface IWaterMatrixSlice {
  waterWorldMatrix: import('three').Matrix4
  waterWorldInverse: import('three').Matrix4
  syncWaterWorldFromObject: (obj: import('three').Object3D) => void
}
