import { Assets } from '@/helpers/assetMap'
import { useFrame, useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import smokeVertexShader from '@/_shaders/smoke/vertex.glsl'
import smokeFragmentShader from '@/_shaders/smoke/fragment.glsl'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla'
import dfMapSetting from '@/settings/df_map_setting.json'
import fireVertexShader from '@/_shaders/fire/vertex.glsl'
import fireFragmentShader from '@/_shaders/fire/fragment.glsl'

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

const Fire = () => {
  const ref = useRef<THREE.Mesh>(null)

  const fireGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    // const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8, 1, true)
    return geometry
  }, [])

  const fireTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.FIRE)
  fireTexture.magFilter = fireTexture.minFilter = THREE.LinearFilter
  fireTexture.wrapS = fireTexture.wrapT = THREE.ClampToEdgeWrapping

  const uniforms = useRef({
    uTime: new THREE.Uniform(0),
    uFireTex: new THREE.Uniform<THREE.Texture>(fireTexture),
    uColor: new THREE.Uniform<THREE.Color>(new THREE.Color(0xeeeeee)),
    uSeed: new THREE.Uniform(Math.random() * 19.19),
    uInvModelMatrix: new THREE.Uniform<THREE.Matrix4>(new THREE.Matrix4()),
    uScale: new THREE.Uniform(new THREE.Vector3(1, 1, 1)),
    uNoiseScale: new THREE.Uniform(new THREE.Vector4(1, 2, 1, 0.3)),
    uMagnitude: new THREE.Uniform(2.5),
    uLacunarity: new THREE.Uniform(3.0),
    uGain: new THREE.Uniform(0.6),
  })

  const fireMaterial = useMemo(() => {
    const material = new CustomShaderMaterialVanilla({
      vertexShader: fireVertexShader,
      fragmentShader: fireFragmentShader,
      baseMaterial: THREE.MeshStandardMaterial,
      uniforms: uniforms.current,
      defines: {
        ITERATIONS: 20,
        OCTIVES: 3,
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    return material
  }, [])
  useFrame((state) => {
    if (!ref.current) return
    uniforms.current.uTime.value = state.clock.getElapsedTime()
    const invModelMatrix = uniforms.current.uInvModelMatrix.value
    ref.current?.updateMatrixWorld()
    invModelMatrix.copy(ref.current?.matrixWorld).invert()
    uniforms.current.uInvModelMatrix.value = invModelMatrix
  })

  useEffect(() => {
    return () => {
      fireMaterial.dispose()
      fireGeometry.dispose()
      fireTexture.dispose()
    }
  }, [])
  return (
    <mesh
      ref={ref}
      geometry={fireGeometry}
      material={fireMaterial}
      position={[
        dfMapSetting.object.campfire.fire.startPosition.x,
        dfMapSetting.object.campfire.fire.startPosition.y,
        dfMapSetting.object.campfire.fire.startPosition.z,
      ]}
      scale={[
        dfMapSetting.object.campfire.fire.defaultScale.x,
        dfMapSetting.object.campfire.fire.defaultScale.y,
        dfMapSetting.object.campfire.fire.defaultScale.z,
      ]}
    />
  )
}

const Campfire = () => {
  const scene = useLoader(GLTFLoader, Assets.CAMPFIRE)

  useEffect(() => {
    return () => {
      scene.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.dispose()
        }
      })
    }
  }, [])

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
      <Fire />
    </>
  )
}

export default Campfire
useLoader.preload(GLTFLoader, Assets.CAMPFIRE)
