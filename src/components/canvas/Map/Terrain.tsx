import { extend, useFrame, useLoader } from '@react-three/fiber'
import { CuboidCollider, HeightfieldCollider, RigidBody } from '@react-three/rapier'
import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Assets } from '@/helpers/assetMap'
import CustomShaderMaterial from 'three-custom-shader-material'
import terrainVertex from '@/_shaders/terrain/vertex.glsl'
import terrainFragment from '@/_shaders/terrain/fragment.glsl'
import { useControls } from 'leva'
import { createNoise2D } from 'simplex-noise'
import { simplexNoise2d } from '@/helpers/noiseFunction'
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla'
import dfMapSetting from '@/settings/df_map_setting.json'
import Grass from './Grass'
import Tree from './Tree'

const levaConfig = {
  uPositionFrequency: { value: 0.2, min: 0, max: 1, step: 0.001 },
  uStrength: { value: 2.0, min: 0, max: 10, step: 0.001 },
  uWarpFrequency: { value: 5, min: 0, max: 10, step: 0.001 },
  uWarpStrength: { value: 0.5, min: 0, max: 1, step: 0.001 },
  // colorWaterDeep: { value: '#002b3d' },
  // colorWaterSurface: { value: '#66a8ff' },
  // colorSand: { value: '#ffe894' },
  // colorGrass: { value: '#85d534' },
  // colorTopMountain: { value: '#ffffff' },
  // colorRock: { value: '#bfbd8d' },
}

const scaleMap = dfMapSetting.scaleTerrain

const getElevation = (position: [number, number], uniforms: any, time = 0) => {
  let warpedPosition = [position[0], position[1]]

  // Add time animation (matching your vertex shader)
  warpedPosition[0] += time * 0.2
  warpedPosition[1] += time * 0.2

  // Apply warping (matching your vertex shader)
  const warpNoise1 = simplexNoise2d(
    warpedPosition[0] * uniforms.uWarpFrequency * uniforms.uPositionFrequency,
    warpedPosition[1] * uniforms.uWarpFrequency * uniforms.uPositionFrequency,
  )

  warpedPosition[0] += warpNoise1 * uniforms.uWarpStrength
  warpedPosition[1] += warpNoise1 * uniforms.uWarpStrength

  // Calculate elevation with octaves (matching your vertex shader)
  let elevation = 0.0
  const noise1 = simplexNoise2d(
    warpedPosition[0] * uniforms.uPositionFrequency,
    warpedPosition[1] * uniforms.uPositionFrequency,
  )
  const noise2 = simplexNoise2d(
    warpedPosition[0] * uniforms.uPositionFrequency * 2.0,
    warpedPosition[1] * uniforms.uPositionFrequency * 2.0,
  )
  const noise3 = simplexNoise2d(
    warpedPosition[0] * uniforms.uPositionFrequency * 4.0,
    warpedPosition[1] * uniforms.uPositionFrequency * 4.0,
  )

  elevation += noise1 / 2.0
  elevation += noise2 / 4.0
  elevation += noise3 / 8.0

  // Apply power curve and sign (matching your vertex shader)
  const elevationSign = Math.sign(elevation)
  elevation = Math.pow(Math.abs(elevation), 2.0) * elevationSign
  elevation *= uniforms.uStrength

  // Debug logging for first few points
  if (position[0] === -5 && position[1] === -5) {
    console.log('=== getElevation Debug ===')
    console.log('Position:', position)
    console.log('Warped Position:', warpedPosition)
    console.log('Noise values:', { noise1, noise2, noise3 })
    console.log('Final elevation:', elevation)
  }

  return elevation
}

const Terrain = () => {
  const stoneRiverARMTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.STONE_RIVER.ALBEDO_ROUGHNESS_METALNESS)
  const stoneRiverDiffuseTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.STONE_RIVER.DIFFUSE)
  const stoneRiverDisplacementTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.STONE_RIVER.HEIGHT)
  const stoneRiverNORMALTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.STONE_RIVER.NORMAL)

  const rockMossyARMTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_MOSSY.ALBEDO_ROUGHNESS_METALNESS)
  const rockMossyDiffuseTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_MOSSY.DIFFUSE)
  const rockMossyDisplacementTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_MOSSY.HEIGHT)
  const rockMossyNORMALTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_MOSSY.NORMAL)

  const alluvialSoilARMTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ALLUVIAL_SOIL.ALBEDO_ROUGHNESS_METALNESS)
  const alluvialSoilDiffuseTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ALLUVIAL_SOIL.DIFFUSE)
  const alluvialSoilDisplacementTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ALLUVIAL_SOIL.HEIGHT)
  const alluvialSoilNORMALTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ALLUVIAL_SOIL.NORMAL)

  const pebbleGroundARMTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.GROUND.ALBEDO_ROUGHNESS_METALNESS)
  const pebbleGroundDiffuseTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.GROUND.DIFFUSE)
  const pebbleGroundDisplacementTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.GROUND.HEIGHT)
  const pebbleGroundNORMALTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.GROUND.NORMAL)

  const rockWallAlbedoTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_WALL.ALBEDO)
  const rockWallRoughnessTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_WALL.ROUGHNESS)
  const rockWallMetalnessTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_WALL.METALNESS)
  const rockWallDiffuseTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_WALL.DIFFUSE)
  const rockWallDisplacementTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_WALL.HEIGHT)
  const rockWallNORMALTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.ROCK_WALL.NORMAL)

  const topMountainARMTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.TOP_MOUNTAIN.ALBEDO_ROUGHNESS_METALNESS)
  const topMountainDiffuseTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.TOP_MOUNTAIN.DIFFUSE)
  const topMountainDisplacementTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.TOP_MOUNTAIN.HEIGHT)
  const topMountainNORMALTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.TOP_MOUNTAIN.NORMAL)

  // pebbleGroundDiffuseTexture.wrapS = THREE.RepeatWrapping
  // pebbleGroundDiffuseTexture.wrapT = THREE.RepeatWrapping

  // Leva controls for all uniforms and colors
  const {
    uPositionFrequency,
    uStrength,
    uWarpFrequency,
    uWarpStrength,
    colorWaterDeep,
    colorWaterSurface,
    colorSand,
    colorGrass,
    colorTopMountain,
    colorRock,
  } = useControls('Terrain', levaConfig)

  // Uniforms (useRef so uniforms persist between renders)
  const uniforms = useRef({
    uTime: new THREE.Uniform(0),
    uPositionFrequency: new THREE.Uniform(uPositionFrequency),
    uStrength: new THREE.Uniform(uStrength),
    uWarpFrequency: new THREE.Uniform(uWarpFrequency),
    uWarpStrength: new THREE.Uniform(uWarpStrength),
    uColorWaterDeep: new THREE.Uniform(new THREE.Color(colorWaterDeep)),
    uColorWaterSurface: new THREE.Uniform(new THREE.Color(colorWaterSurface)),
    uColorSand: new THREE.Uniform(new THREE.Color(colorSand)),
    uColorGrass: new THREE.Uniform(new THREE.Color(colorGrass)),
    uColorTopMountain: new THREE.Uniform(new THREE.Color(colorTopMountain)),
    uColorRock: new THREE.Uniform(new THREE.Color(colorRock)),

    // Textures

    uStoneRiverARMTexture: new THREE.Uniform(stoneRiverARMTexture),
    uStoneRiverDiffuseTexture: new THREE.Uniform(stoneRiverDiffuseTexture),
    uStoneRiverDisplacementTexture: new THREE.Uniform(stoneRiverDisplacementTexture),
    uStoneRiverNORMALTexture: new THREE.Uniform(stoneRiverNORMALTexture),

    uRockMossyARMTexture: new THREE.Uniform(rockMossyARMTexture),
    uRockMossyDiffuseTexture: new THREE.Uniform(rockMossyDiffuseTexture),
    uRockMossyDisplacementTexture: new THREE.Uniform(rockMossyDisplacementTexture),
    uRockMossyNORMALTexture: new THREE.Uniform(rockMossyNORMALTexture),

    uAlluvialSoilARMTexture: new THREE.Uniform(alluvialSoilARMTexture),
    uAlluvialSoilDiffuseTexture: new THREE.Uniform(alluvialSoilDiffuseTexture),
    uAlluvialSoilDisplacementTexture: new THREE.Uniform(alluvialSoilDisplacementTexture),
    uAlluvialSoilNORMALTexture: new THREE.Uniform(alluvialSoilNORMALTexture),

    uPebbleGroundARMTexture: new THREE.Uniform(pebbleGroundARMTexture),
    uPebbleGroundDiffuseTexture: new THREE.Uniform(pebbleGroundDiffuseTexture),
    uPebbleGroundDisplacementTexture: new THREE.Uniform(pebbleGroundDisplacementTexture),
    uPebbleGroundNORMALTexture: new THREE.Uniform(pebbleGroundNORMALTexture),

    uRockWallAlbedoTexture: new THREE.Uniform(rockWallAlbedoTexture),
    uRockWallRoughnessTexture: new THREE.Uniform(rockWallRoughnessTexture),
    uRockWallMetalnessTexture: new THREE.Uniform(rockWallMetalnessTexture),
    uRockWallDiffuseTexture: new THREE.Uniform(rockWallDiffuseTexture),
    uRockWallDisplacementTexture: new THREE.Uniform(rockWallDisplacementTexture),
    uRockWallNORMALTexture: new THREE.Uniform(rockWallNORMALTexture),

    uTopMountainARMTexture: new THREE.Uniform(topMountainARMTexture),
    uTopMountainDiffuseTexture: new THREE.Uniform(topMountainDiffuseTexture),
    uTopMountainDisplacementTexture: new THREE.Uniform(topMountainDisplacementTexture),
    uTopMountainNORMALTexture: new THREE.Uniform(topMountainNORMALTexture),
  })

  // Update uniforms when Leva values change
  useEffect(() => {
    uniforms.current.uPositionFrequency.value = uPositionFrequency
    uniforms.current.uStrength.value = uStrength
    uniforms.current.uWarpFrequency.value = uWarpFrequency
    uniforms.current.uWarpStrength.value = uWarpStrength
    uniforms.current.uColorWaterDeep.value.set(colorWaterDeep)
    uniforms.current.uColorWaterSurface.value.set(colorWaterSurface)
    uniforms.current.uColorSand.value.set(colorSand)
    uniforms.current.uColorGrass.value.set(colorGrass)
    uniforms.current.uColorTopMountain.value.set(colorTopMountain)
    uniforms.current.uColorRock.value.set(colorRock)
  }, [
    uPositionFrequency,
    uStrength,
    uWarpFrequency,
    uWarpStrength,
    colorWaterDeep,
    colorWaterSurface,
    colorSand,
    colorGrass,
    colorTopMountain,
    colorRock,
  ])
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, 100, 100)
    geo.rotateX(-Math.PI * 0.5)
    return geo
  }, [])

  const heightfieldData = useMemo(() => {
    const size = 101 // Must match your geometry resolution + 1
    const heights = new Float32Array(size * size)

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const x = (i / (size - 1)) * 10 - 5 // Map to your terrain size (-5 to 5)
        const z = (j / (size - 1)) * 10 - 5

        const height = getElevation([x, z], {
          uPositionFrequency,
          uStrength,
          uWarpFrequency,
          uWarpStrength,
        })

        heights[i * size + j] = height
      }
    }

    // Convert Float32Array to regular array
    return { heights: Array.from(heights), size }
  }, [uPositionFrequency, uStrength, uWarpFrequency, uWarpStrength])
  // Animate uTime
  useFrame((state) => {
    // uniforms.current.uTime.value = state.clock.getElapsedTime()
  })
  const customDepthMaterial = useMemo(() => {
    const dm = new CustomShaderMaterialVanilla<typeof THREE.MeshDepthMaterial>({
      //CSM
      vertexShader: terrainVertex,
      baseMaterial: THREE.MeshDepthMaterial,
      uniforms: uniforms.current,

      //MeshDepthMaterial
      depthPacking: THREE.RGBADepthPacking,
    })
    return dm
  }, [uniforms.current, terrainVertex])

  return (
    <>
      <Tree
        getElevation={getElevation}
        terrainUniforms={{
          uPositionFrequency,
          uStrength,
          uWarpFrequency,
          uWarpStrength,
        }}
        scaleMap={scaleMap}
      />
      <Grass
        getElevation={getElevation}
        terrainUniforms={{
          uPositionFrequency,
          uStrength,
          uWarpFrequency,
          uWarpStrength,
        }}
        scaleMap={scaleMap}
      />
      <mesh
        geometry={geometry}
        position={[
          dfMapSetting.object.terrain.startPosition.x,
          dfMapSetting.object.terrain.startPosition.y - 0.1,
          dfMapSetting.object.terrain.startPosition.z,
        ]}
        receiveShadow
        scale={[scaleMap, scaleMap, scaleMap]}
        customDepthMaterial={customDepthMaterial}
      >
        <CustomShaderMaterial<typeof THREE.MeshStandardMaterial>
          //CSM
          vertexShader={terrainVertex}
          fragmentShader={terrainFragment}
          baseMaterial={THREE.MeshStandardMaterial}
          uniforms={uniforms.current}
          //MeshStandardMaterial
          metalness={0}
          roughness={0.5}
          color={'#85d534'}
        />
      </mesh>

      <RigidBody type='fixed' position={[0, -0.1, 0]}>
        <HeightfieldCollider
          args={[
            heightfieldData.size - 1, // nrows - 1 (number)
            heightfieldData.size - 1, // ncols - 1 (number)
            heightfieldData.heights, // number[]
            { x: 10 * scaleMap, y: 1 * scaleMap, z: 10 * scaleMap }, // scale object
          ]}
          position={[
            dfMapSetting.object.terrain.startPosition.x,
            dfMapSetting.object.terrain.startPosition.y,
            dfMapSetting.object.terrain.startPosition.z,
          ]}
          restitution={0.2}
          friction={0}
        />
      </RigidBody>
    </>
  )
}

export default Terrain
