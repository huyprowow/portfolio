import { extend, useLoader } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Assets } from '@/helpers/assetMap'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import terrainVertex from '@/_shaders/terrain/vertex.glsl'
import terrainFragment from '@/_shaders/terrain/fragment.glsl'

// const TerrainMaterial = new CustomShaderMaterial({
//   // CSM
//   vertexShader: terrainVertex,
//   fragmentShader: terrainFragment,
//   baseMaterial: THREE.MeshStandardMaterial,
//   uniforms: uniforms,

//   // MeshStandardMaterial
//   metalness: 0,
//   roughness: 0.5,
//   color: '#85d534',
// })
// extend({ TerrainMaterial })

const Terrain = () => {
  // const texture = useLoader(THREE.TextureLoader, Assets.GRASS_TEXTURE)
  // //  texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
  // if (texture) {
  //   texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  //   texture.repeat.set(100, 100)
  //   texture.anisotropy = 16
  // }
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

  // Material

  const debugObject = {
    colorWaterDeep: '#002b3d',
    colorWaterSurface: '#66a8ff',
    colorSand: '#ffe894',
    colorGrass: '#85d534',
    colorSnow: '#ffffff',
    colorRock: '#bfbd8d',
  }

  const uniforms = {
    uTime: new THREE.Uniform(0),
    uPositionFrequency: new THREE.Uniform(0.2),
    uStrength: new THREE.Uniform(2.0),
    uWarpFrequency: new THREE.Uniform(5),
    uWarpStrength: new THREE.Uniform(0.5),

    uColorWaterDeep: new THREE.Uniform(new THREE.Color(debugObject.colorWaterDeep)),
    uColorWaterSurface: new THREE.Uniform(new THREE.Color(debugObject.colorWaterSurface)),
    uColorSand: new THREE.Uniform(new THREE.Color(debugObject.colorSand)),
    uColorGrass: new THREE.Uniform(new THREE.Color(debugObject.colorGrass)),
    uColorSnow: new THREE.Uniform(new THREE.Color(debugObject.colorSnow)),
    uColorRock: new THREE.Uniform(new THREE.Color(debugObject.colorRock)),
  }

  const terrainMaterial = useMemo(
    () =>
      new CustomShaderMaterial({
        // CSM
        vertexShader: terrainVertex,
        fragmentShader: terrainFragment,
        baseMaterial: THREE.MeshStandardMaterial,
        uniforms: uniforms,

        // MeshStandardMaterial
        metalness: 0,
        roughness: 0.5,
        color: '#85d534',
      }),
    [uniforms, terrainVertex, terrainFragment],
  )

  return (
    <RigidBody type='fixed' restitution={0.2} friction={0} scale={[1000, 0.2, 1000]}>
      <mesh geometry={boxGeometry} material={terrainMaterial} position={[0, -0.1, 0]} receiveShadow />
      <CuboidCollider args={[2, 0.1, 2 * length]} position={[0, -0.1, 0]} restitution={0.2} friction={1} />
    </RigidBody>
  )
}

export default Terrain
