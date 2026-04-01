import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer, wrapEffect } from '@react-three/postprocessing'
import { ToneMappingEffect, ToneMappingMode } from 'postprocessing'
import dfMapSetting from '@/settings/df_map_setting.json'
import { Assets } from '@/helpers/assetMap'
import { UnderwaterPlaneEffect } from './UnderwaterPlaneEffect'
import { useBoundStore } from '@/store/store'

const Underwater = wrapEffect(UnderwaterPlaneEffect)
const ToneMapping = wrapEffect(ToneMappingEffect)

export default function PostProcess() {
  const { camera, clock } = useThree()
  const effectRef = useRef<UnderwaterPlaneEffect>(null)

  const waterNoiseTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.NOISE.WATER_NOISE)
  waterNoiseTexture.minFilter = THREE.LinearFilter
  waterNoiseTexture.magFilter = THREE.LinearFilter

  useFrame(() => {
    const e = effectRef.current
    if (!e) return
    e.syncCameraMatrices(camera)
    const { waterWorldMatrix, waterWorldInverse } = useBoundStore.getState()
    e.syncWater(waterWorldMatrix, waterWorldInverse, clock.elapsedTime)
  })

  return (
    <EffectComposer depthBuffer multisampling={8}>
      <Underwater
        ref={effectRef}
        blendBand={0.45}
        underwaterTintStrength={0.52}
        waterNoiseTexture={waterNoiseTexture}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
