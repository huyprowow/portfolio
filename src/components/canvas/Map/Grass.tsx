import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import grassVertexShader from '@/_shaders/grass/vertex.glsl'
import grassFragmentShader from '@/_shaders/grass/fragment.glsl'
import { Assets } from '@/helpers/assetMap'
import { useFrame, useLoader } from '@react-three/fiber'
import dfMapSetting from '@/settings/df_map_setting.json'
import { Instance, Instances } from '@react-three/drei'
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla'
import { useBoundStore } from '@/store/store'
import { useControls } from 'leva'
import { logToGroup } from '@/helpers/logToGroup'
import { LOG_GROUP } from '@/constant/logGroup'
import { mobileAndTabletCheck } from '@/helpers/mobileAndTabletCheck'
const PLANE_SIZE = 10
// const BLADE_COUNT = 1000 //000
// const INSTANCES_LIMIT = 10000 * 1000 //* 2000

// single patch instanced
// const BLADES_PER_PATCH = 20
// const PATCH_SIZE = 1.0
const BLADE_WIDTH = 0.1
const BLADE_HEIGHT = 2.8
const BLADE_HEIGHT_VARIATION = 0.6

const levaConfig = {
  uWindStrength: {
    min: 1.0,
    max: 5.0,
    step: 0.1,
    value: 1.0,
  },
  instancesLimit: {
    min: 1000,
    max: 30000000,
    step: 100,
    value: 10000000,
  },
}
interface GrassProps {
  getElevation: (position: [number, number], uniforms: any, time: number) => number
  terrainUniforms: any
  scaleMap: number
}
const Grass = ({ getElevation, terrainUniforms, scaleMap }: GrassProps) => {
  const grassRef = useRef<THREE.InstancedMesh>(null)
  const playerRef = useBoundStore((state) => state.playerRef)
  const isMb = mobileAndTabletCheck()
  levaConfig.instancesLimit.value = isMb ? 3500000 : 10000000 //10000000
  const { uWindStrength, instancesLimit } = useControls('Grass', levaConfig)

  useEffect(() => {
    if (!playerRef) return
    if (!playerRef.current) return
    const playerPos = new THREE.Vector3(
      playerRef.current?.translation().x,
      playerRef.current?.translation().y,
      playerRef.current?.translation().z,
    )
    // logToGroup(LOG_GROUP.MAP, '__playerPos', playerPos)
  }, [playerRef])

  // useEffect(() => {
  //   const mapSize = PLANE_SIZE * scaleMap
  //   const instancesPerRow = Math.sqrt(INSTANCES_LIMIT)
  //   for (let i = 0; i < INSTANCES_LIMIT; i++) {
  //     const matrix = new THREE.Matrix4()
  //     const row = Math.floor(i / instancesPerRow)
  //     const col = i % instancesPerRow
  //     const x = (col - instancesPerRow / 2) * (mapSize / instancesPerRow)
  //     const z = (row - instancesPerRow / 2) * (mapSize / instancesPerRow)
  //     // Scale the coordinates back to the base terrain size for elevation calculation
  //     const scaledX = x / scaleMap
  //     const scaledZ = z / scaleMap
  //     const elevation = getElevation([scaledX, scaledZ], terrainUniforms, 0)

  //     // Scale the elevation back to match the terrain scale
  //     const scaledElevation = elevation * scaleMap
  //     if (scaledElevation >= -0.5) {
  //       const position = new THREE.Vector3(x, scaledElevation, z)
  //       const scale = new THREE.Vector3(1, 1, 1)
  //       matrix.compose(position, new THREE.Quaternion(), scale)
  //       grassRef.current?.setMatrixAt(i, matrix)
  //     }
  //   }
  // }, [INSTANCES_LIMIT, scaleMap])
  // const convertRange = (val: number, oldMin: number, oldMax: number, newMin: number, newMax: number) => {
  //   return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
  // }

  // const generateGrassData = () => {
  //   const positions: number[] = []
  //   const uvs: number[] = []
  //   const indices: number[] = []
  //   const colors: number[] = []

  //   for (let i = 0; i < BLADE_COUNT; i++) {
  //     const VERTEX_COUNT = 5
  //     const surfaceMin = (PLANE_SIZE / 2) * -1
  //     const surfaceMax = PLANE_SIZE / 2

  //     const x = Math.random() * PLANE_SIZE - PLANE_SIZE / 2
  //     const z = Math.random() * PLANE_SIZE - PLANE_SIZE / 2

  //     const pos = new THREE.Vector3(x, 0, z)

  //     const uv = [convertRange(pos.x, surfaceMin, surfaceMax, 0, 1), convertRange(pos.z, surfaceMin, surfaceMax, 0, 1)]

  //     const blade = generateBlade(pos, i * VERTEX_COUNT, uv)
  //     blade.verts.forEach((vert) => {
  //       positions.push(...vert.pos)
  //       uvs.push(...vert.uv)
  //       colors.push(...vert.color)
  //     })
  //     blade.indices.forEach((indice) => indices.push(indice))
  //   }
  //   return { positions, uvs, indices, colors }
  // }

  // const generateBlade = (center: THREE.Vector3, vArrOffset: number, uv: number[]) => {
  //   const MID_WIDTH = BLADE_WIDTH * 0.5
  //   const TIP_OFFSET = 0.1
  //   const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION

  //   const yaw = Math.random() * Math.PI * 2
  //   const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw))
  //   const tipBend = Math.random() * Math.PI * 2
  //   const tipBendUnitVec = new THREE.Vector3(Math.sin(tipBend), 0, -Math.cos(tipBend))

  //   // Find the Bottom Left, Bottom Right, Top Left, Top right, Top Center vertex positions
  //   const bl = new THREE.Vector3().addVectors(
  //     center,
  //     new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * 1),
  //   )
  //   const br = new THREE.Vector3().addVectors(
  //     center,
  //     new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * -1),
  //   )
  //   const tl = new THREE.Vector3().addVectors(
  //     center,
  //     new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * 1),
  //   )
  //   const tr = new THREE.Vector3().addVectors(
  //     center,
  //     new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * -1),
  //   )
  //   const tc = new THREE.Vector3().addVectors(
  //     center,
  //     new THREE.Vector3().copy(tipBendUnitVec).multiplyScalar(TIP_OFFSET),
  //   )

  //   tl.y += height / 2
  //   tr.y += height / 2
  //   tc.y += height

  //   // Vertex Colors
  //   const black = [0, 0, 0]
  //   const gray = [0.5, 0.5, 0.5]
  //   const white = [1.0, 1.0, 1.0]

  //   const verts = [
  //     { pos: bl.toArray(), uv: uv, color: black },
  //     { pos: br.toArray(), uv: uv, color: black },
  //     { pos: tr.toArray(), uv: uv, color: gray },
  //     { pos: tl.toArray(), uv: uv, color: gray },
  //     { pos: tc.toArray(), uv: uv, color: white },
  //   ]
  //   const indices = [
  //     vArrOffset,
  //     vArrOffset + 1,
  //     vArrOffset + 2,
  //     vArrOffset + 2,
  //     vArrOffset + 4,
  //     vArrOffset + 3,
  //     vArrOffset + 3,
  //     vArrOffset,
  //     vArrOffset + 2,
  //   ]

  //   return { verts, indices }
  // }

  // const geom = useMemo(() => {
  //   const { positions, uvs, indices, colors } = generateSingleGrassPatchGeometry()
  //   const g = new THREE.BufferGeometry()
  //   g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  //   g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
  //   g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
  //   g.setIndex(indices)
  //   g.computeVertexNormals()

  //   // g.computeFaceNormals()
  //   return g
  // }, [])

  useEffect(() => {
    grassUniforms.current.uWindStrength.value = uWindStrength
  }, [uWindStrength])

  useEffect(() => {
    const mapSize = PLANE_SIZE * scaleMap
    let validInstanceCount = 0

    // Generate completely random positions instead of grid
    for (let i = 0; i < instancesLimit; i++) {
      // Random position within the map area
      const x = (Math.random() - 0.5) * mapSize
      const z = (Math.random() - 0.5) * mapSize

      const scaledX = x / scaleMap
      const scaledZ = z / scaleMap
      const elevation = getElevation([scaledX, scaledZ], terrainUniforms, 0)
      const scaledElevation = elevation * scaleMap
      const minScaledElevation = -0.06 * scaleMap
      const maxScaledElevation = 0.12 * scaleMap

      if (scaledElevation < minScaledElevation || scaledElevation > maxScaledElevation) {
        continue
      }

      // Add height variation based on elevation
      const heightVariation = Math.random() * 0.5 // 0 to 0.5 additional height
      const finalElevation = scaledElevation + heightVariation

      // Random rotation and scale for natural variation
      const randomRotation = Math.random() * Math.PI * 2
      const randomScale = 0.7 + Math.random() * 0.6 // 0.7 to 1.3 scale

      const position = new THREE.Vector3(x, finalElevation, z)
      const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomRotation)
      const scale = new THREE.Vector3(randomScale, randomScale, randomScale)

      const matrix = new THREE.Matrix4()
      matrix.compose(position, rotation, scale)

      grassRef.current?.setMatrixAt(validInstanceCount, matrix)
      validInstanceCount++
    }

    logToGroup(LOG_GROUP.MAP, `Rendered ${validInstanceCount} grass instances`)
  }, [instancesLimit, scaleMap])

  const generateGeometry = () => {
    const geometry = new THREE.BufferGeometry()

    // Use your existing blade parameters
    const MID_WIDTH = BLADE_WIDTH * 0.5
    const TIP_OFFSET = 0.1
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION

    // Create triangular blade shape like your original generateBlade
    const yaw = Math.random() * Math.PI * 2
    const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw))
    const tipBend = Math.random() * Math.PI * 2
    const tipBendUnitVec = new THREE.Vector3(Math.sin(tipBend), 0, -Math.cos(tipBend))

    // Create blade vertices (triangular shape)
    const bl = new THREE.Vector3(-BLADE_WIDTH / 2, 0, 0) // Bottom left
    const br = new THREE.Vector3(BLADE_WIDTH / 2, 0, 0) // Bottom right
    const tl = new THREE.Vector3(-MID_WIDTH / 2, height / 2, 0) // Top left
    const tr = new THREE.Vector3(MID_WIDTH / 2, height / 2, 0) // Top right
    const tc = new THREE.Vector3(0, height, TIP_OFFSET) // Tip center

    // This creates a triangular blade shape
    const vertices = new Float32Array([
      ...bl.toArray(), // 0: bottom left
      ...br.toArray(), // 1: bottom right
      ...tr.toArray(), // 2: top right
      ...tl.toArray(), // 3: top left
      ...tc.toArray(), // 4: tip center
    ])

    // Triangular faces
    const indices = new Uint16Array([
      0,
      1,
      2, // bottom triangle
      2,
      4,
      3, // top triangle
      3,
      0,
      2, // side triangle
    ])

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    geometry.computeVertexNormals()

    return geometry
  }

  const geom = useMemo(() => {
    return generateGeometry()
  }, [])

  const grassTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.GRASS.ALBEDO)
  const grassUniforms = useRef({
    // textures: new THREE.Uniform([new THREE.Uniform(grassTexture), new THREE.Uniform(grassTexture)]),
    // texture1: new THREE.Uniform(grassTexture),
    textures: new THREE.Uniform([grassTexture, grassTexture]),
    texture1: new THREE.Uniform(grassTexture),
    uTime: new THREE.Uniform(0),
    uMapScale: new THREE.Uniform(scaleMap),
    uWindStrength: new THREE.Uniform(uWindStrength),
  })

  const grassMaterial = useMemo(() => {
    logToGroup(LOG_GROUP.MAP, 'grassUniforms.current', grassUniforms.current)
    const gm = new CustomShaderMaterialVanilla({
      //CSM
      vertexShader: grassVertexShader,
      fragmentShader: grassFragmentShader,
      uniforms: grassUniforms.current,
      baseMaterial: THREE.MeshStandardMaterial,

      //MeshStandardMaterial
      // metalness={0}
      // roughness={0.5}
      // color={'#85d534'}
      vertexColors: true,
      side: THREE.DoubleSide,
    })
    return gm
  }, [])

  useFrame((state) => {
    grassUniforms.current.uTime.value = state.clock.getElapsedTime()
  })

  useEffect(() => {
    return () => {
      // Dispose geometry
      if (geom) {
        geom.dispose()
      }

      // Dispose material
      if (grassMaterial) {
        grassMaterial.dispose()
      }

      // Dispose texture
      if (grassTexture) {
        grassTexture.dispose()
      }

      // Dispose instanced mesh
      if (grassRef.current) {
        grassRef.current.dispose()
      }

      logToGroup(LOG_GROUP.MAP, 'Grass component disposed')
    }
  }, [geom, grassMaterial, grassTexture])

  return (
    <>
      {/* <instancedMesh ref={grassRef} args={[null, null, INSTANCES_LIMIT]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color='tomato' />
      </instancedMesh> */}
      <instancedMesh
        ref={grassRef}
        args={[geom, grassMaterial, instancesLimit]}
        castShadow
        receiveShadow
        //   // position={[
        //   //   dfMapSetting.object.terrain.startPosition.x,
        //   //   dfMapSetting.object.terrain.startPosition.y - 0.1,
        //   //   dfMapSetting.object.terrain.startPosition.z,
        //   // ]}
      />
    </>
    // <Instances ref={grassRef} limit={INSTANCES_LIMIT} geometry={geom} material={grassMaterial}>
    //   <Instance
    //     key={`instanced-${INSTANCES_LIMIT}`}
    //     // position={[Math.random() * scaleMap, 0, Math.random() * scaleMap]}
    //     //
    //   />
    // </Instances>
    // <mesh
    //   material={grassMaterial}
    //   geometry={geom}
    //   scale={[scaleMap, scaleMap, scaleMap]}
    //   position={[
    //     dfMapSetting.object.terrain.startPosition.x,
    //     dfMapSetting.object.terrain.startPosition.y - 0.1,
    //     dfMapSetting.object.terrain.startPosition.z,
    //   ]}
    // ></mesh>
  )
}

export default Grass
