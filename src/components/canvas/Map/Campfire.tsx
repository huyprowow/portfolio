import { Assets } from '@/helpers/assetMap'
import { useFrame, useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import smokeVertexShader from '@/_shaders/smoke/vertex.glsl'
import smokeFragmentShader from '@/_shaders/smoke/fragment.glsl'
import { useEffect, useMemo } from 'react'
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla'
import dfMapSetting from '@/settings/df_map_setting.json'

const Smoke = () => {
  //geometry
  const smokeGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1, 1, 16, 64)
    return geometry
  }, [])

  //Perlin texture
  const perlinTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.NOISE.PERLIN)
  perlinTexture.wrapS = THREE.RepeatWrapping
  perlinTexture.wrapT = THREE.RepeatWrapping

  //material
  const smokeMaterial = useMemo(() => {
    return new CustomShaderMaterialVanilla({
      vertexShader: smokeVertexShader,
      fragmentShader: smokeFragmentShader,
      baseMaterial: THREE.MeshStandardMaterial,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
      },
      transparent: true,
      side: THREE.DoubleSide,
      // wireframe: true
      depthWrite: false, // Disable depth write to allow transparency occlusion
    })
  }, [perlinTexture])

  useFrame((state) => {
    smokeMaterial.uniforms.uTime.value = state.clock.getElapsedTime()
  })

  useEffect(() => {
    return () => {
      smokeMaterial.dispose()
      smokeGeometry.dispose()
      perlinTexture.dispose()
    }
  }, [smokeMaterial])

  return (
    <mesh
      geometry={smokeGeometry}
      material={smokeMaterial}
      position={[
        dfMapSetting.object.campfire.smoke.startPosition.x,
        dfMapSetting.object.campfire.smoke.startPosition.y,
        dfMapSetting.object.campfire.smoke.startPosition.z,
      ]}
      scale={[
        dfMapSetting.object.campfire.smoke.defaultScale.x,
        dfMapSetting.object.campfire.smoke.defaultScale.y,
        dfMapSetting.object.campfire.smoke.defaultScale.z,
      ]}
    />
  )
}

const Campfire = () => {
  const scene = useLoader(GLTFLoader, Assets.CAMPFIRE)

  return (
    <>
      <RigidBody type='fixed' colliders='hull'>
        <primitive
          object={scene.scene}
          position={[
            dfMapSetting.object.campfire.startPosition.x,
            dfMapSetting.object.campfire.startPosition.y,
            dfMapSetting.object.campfire.startPosition.z,
          ]}
          scale={0.05}
        />
      </RigidBody>
      <Smoke />
    </>
  )
}

export default Campfire
useLoader.preload(GLTFLoader, Assets.CAMPFIRE)
