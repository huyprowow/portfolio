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

const levaConfig = {
  uPositionFrequency: { value: 0.2, min: 0, max: 1, step: 0.001 },
  uStrength: { value: 2.0, min: 0, max: 10, step: 0.001 },
  uWarpFrequency: { value: 5, min: 0, max: 10, step: 0.001 },
  uWarpStrength: { value: 0.5, min: 0, max: 1, step: 0.001 },
  colorWaterDeep: { value: '#002b3d' },
  colorWaterSurface: { value: '#66a8ff' },
  colorSand: { value: '#ffe894' },
  colorGrass: { value: '#85d534' },
  colorSnow: { value: '#ffffff' },
  colorRock: { value: '#bfbd8d' },
}

const scaleMap = 100

const getElevation = (position, uniforms, time = 0) => {
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
    colorSnow,
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
    uColorSnow: new THREE.Uniform(new THREE.Color(colorSnow)),
    uColorRock: new THREE.Uniform(new THREE.Color(colorRock)),
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
    uniforms.current.uColorSnow.value.set(colorSnow)
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
    colorSnow,
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

  return (
    <>
      <mesh geometry={geometry} position={[0, -0.1, 0]} receiveShadow scale={[scaleMap, scaleMap, scaleMap]}>
        <CustomShaderMaterial<typeof THREE.MeshStandardMaterial>
          vertexShader={terrainVertex}
          fragmentShader={terrainFragment}
          baseMaterial={THREE.MeshStandardMaterial}
          uniforms={uniforms.current}
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
          position={[0, 0, 0]}
          restitution={0.2}
          friction={0}
        />
      </RigidBody>
    </>
  )
}

export default Terrain
