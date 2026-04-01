import * as THREE from 'three'
import { StateCreator } from 'zustand'
import dfMapSetting from '@/settings/df_map_setting.json'

function composeWaterMatrixFromSettings(): THREE.Matrix4 {
  const m = new THREE.Matrix4()
  const p = dfMapSetting.object.water.startPosition
  const s = dfMapSetting.scaleTerrain
  m.compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion(), new THREE.Vector3(s, s, s))
  return m
}

export const createWaterMatrixSlice: StateCreator<IWaterMatrixSlice> = (set, get) => {
  const initial = composeWaterMatrixFromSettings()
  const initialInv = initial.clone().invert()
  return {
    waterWorldMatrix: initial,
    waterWorldInverse: initialInv,
    syncWaterWorldFromObject: (obj: THREE.Object3D) => {
      const m = get().waterWorldMatrix
      const inv = get().waterWorldInverse
      m.copy(obj.matrixWorld)
      inv.copy(m).invert()
    },
  }
}
