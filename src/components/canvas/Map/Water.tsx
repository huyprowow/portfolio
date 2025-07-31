import React, { useMemo } from 'react'
import * as THREE from 'three'
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla'
import waterVertexShader from '@/_shaders/water/vertex.glsl'
import waterFragmentShader from '@/_shaders/water/fragment.glsl'
import dfMapSetting from '@/settings/df_map_setting.json'
import { useFrame, useLoader } from '@react-three/fiber'
import { Assets } from '@/helpers/assetMap'

const Water = () => {
  const scaleMap = dfMapSetting.scaleTerrain

  const waterNoiseTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.NOISE.WATER_NOISE)

  //Water Surface geometry
  const waterSurfaceGeometry = useMemo(() => {
    const waterSfG = new THREE.PlaneGeometry(10, 10, 100, 100)
    waterSfG.rotateX(-Math.PI * 0.5)
    return waterSfG
  }, [])

  //Water Surface material
  const waterSurfaceMaterial = useMemo(() => {
    const waterSfM = new CustomShaderMaterialVanilla({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uWaterNoiseTexture: new THREE.Uniform(waterNoiseTexture),
        uTime: new THREE.Uniform(0),
      },
      baseMaterial: THREE.MeshPhysicalMaterial,
      // roughness: 0,
      // transmission: 1,
      roughness: 0.2, // some surface irregularity
      metalness: 0.0, // water isn't metallic
      transmission: 1.0, // fully transmissive (for transparency)
      reflectivity: 0.6, // decent reflections on surface
      clearcoat: 1.0, // glossy coat for water shine
      clearcoatRoughness: 0.1, // small imperfections in gloss
    })

    return waterSfM
  }, [])

  useFrame((state) => {
    waterSurfaceMaterial.uniforms.uTime.value = state.clock.getElapsedTime()
  })
  return (
    <mesh
      geometry={waterSurfaceGeometry}
      material={waterSurfaceMaterial}
      position={[
        dfMapSetting.object.water.startPosition.x,
        dfMapSetting.object.water.startPosition.y,
        dfMapSetting.object.water.startPosition.z,
      ]}
      scale={scaleMap}
    ></mesh>
  )
}

export default Water
