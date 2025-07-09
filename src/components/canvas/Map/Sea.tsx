import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import seaVertexShader from '@/_shaders/sea/vertex.glsl'
import seaFragmentShader from '@/_shaders/sea/fragment.glsl'
import seaCsmVertexShader from '@/_shaders/sea/csm_Ver.glsl'
import seaCsmFragmentShader from '@/_shaders/sea/csm_Frag.glsl'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import dfMapSetting from '@/settings/df_map_setting.json'
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla'

const levaConfig = {
  uBigWavesElevation: { value: 0.2, min: 0, max: 1, step: 0.001 },
  uBigWavesFrequency: {
    value: {
      x: 4,
      y: 1.5,
    },
    min: 0,
    max: 10,
    step: 0.001,
  },
  uBigWavesSpeed: { value: 0.75, min: 0, max: 4, step: 0.001 },
  uSmallWavesElevation: { value: 0.15, min: 0, max: 1, step: 0.001 },
  uSmallWavesFrequency: { value: 3, min: 0, max: 30, step: 0.001 },
  uSmallWavesSpeed: { value: 0.2, min: 0, max: 4, step: 0.001 },
  uSmallWavesIterations: { value: 4, min: 1, max: 5, step: 1 },
  uDepthColor: { value: '#009dff' },
  uSurfaceColor: { value: '#8ab7ff' },
}

const Sea = () => {
  const {
    uBigWavesElevation,
    uBigWavesFrequency,
    uBigWavesSpeed,
    uSmallWavesElevation,
    uSmallWavesFrequency,
    uSmallWavesSpeed,
    uSmallWavesIterations,
    uDepthColor,
    uSurfaceColor,
  } = useControls('Sea', levaConfig)

  const uniforms = useRef({
    uTime: new THREE.Uniform(0),

    // Big waves
    uBigWavesElevation: new THREE.Uniform(uBigWavesElevation),
    uBigWavesFrequency: new THREE.Uniform(new THREE.Vector2(uBigWavesFrequency.x, uBigWavesFrequency.y)),
    uBigWavesSpeed: new THREE.Uniform(uBigWavesSpeed),

    // Small waves
    uSmallWavesElevation: new THREE.Uniform(uSmallWavesElevation),
    uSmallWavesFrequency: new THREE.Uniform(uSmallWavesFrequency),
    uSmallWavesSpeed: new THREE.Uniform(uSmallWavesSpeed),
    uSmallWavesIterations: new THREE.Uniform(uSmallWavesIterations),

    //depth and surface color
    uDepthColor: new THREE.Uniform(new THREE.Color(uDepthColor)),
    uSurfaceColor: new THREE.Uniform(new THREE.Color(uSurfaceColor)),
    uColorOffset: new THREE.Uniform(0.08),
    uColorMultiplier: new THREE.Uniform(6),
  })

  const seaGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, 512, 512)
    geo.rotateX(-Math.PI * 0.5)
    return geo
  }, [])
  // Material
  const seaMaterial = useMemo(() => {
    // const material = new THREE.ShaderMaterial({
    //   vertexShader: seaVertexShader,
    //   fragmentShader: seaFragmentShader,
    //   uniforms: uniforms.current,
    //   // wireframe:true
    // })

    const material = new CustomShaderMaterialVanilla({
      vertexShader: seaCsmVertexShader,
      fragmentShader: seaCsmFragmentShader,
      uniforms: uniforms.current,
      baseMaterial: THREE.MeshStandardMaterial,
    })
    return material
  }, [uniforms.current, seaVertexShader, seaFragmentShader])

  useEffect(() => {
    uniforms.current.uBigWavesElevation.value = uBigWavesElevation
    uniforms.current.uBigWavesFrequency.value = new THREE.Vector2(uBigWavesFrequency.x, uBigWavesFrequency.y)
    uniforms.current.uBigWavesSpeed.value = uBigWavesSpeed
    uniforms.current.uSmallWavesElevation.value = uSmallWavesElevation
    uniforms.current.uSmallWavesFrequency.value = uSmallWavesFrequency
    uniforms.current.uSmallWavesSpeed.value = uSmallWavesSpeed
    uniforms.current.uSmallWavesIterations.value = uSmallWavesIterations
    uniforms.current.uDepthColor.value.set(uDepthColor)
    uniforms.current.uSurfaceColor.value.set(uSurfaceColor)
  }, [
    uBigWavesElevation,
    uBigWavesFrequency,
    uBigWavesSpeed,
    uSmallWavesElevation,
    uSmallWavesFrequency,
    uSmallWavesSpeed,
    uSmallWavesIterations,
    uDepthColor,
    uSurfaceColor,
  ])

  useFrame((state) => {
    uniforms.current.uTime.value = state.clock.getElapsedTime()
  })

  return (
    <mesh
      geometry={seaGeometry}
      material={seaMaterial}
      // position={[0, -10, 0]}
      position={[0, -10, 0]}
      receiveShadow
      scale={dfMapSetting.scaleSea}
    />
  )
}

export default Sea
