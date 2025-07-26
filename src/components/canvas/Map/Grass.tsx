import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import grassVertexShader from '@/_shaders/grass/vertex.glsl'
import grassFragmentShader from '@/_shaders/grass/fragment.glsl'
import { Assets } from '@/helpers/assetMap'
import { useLoader } from '@react-three/fiber'
import dfMapSetting from '@/settings/df_map_setting.json'
import { Instance, Instances } from '@react-three/drei'
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla'
const PLANE_SIZE = 10
const BLADE_COUNT = 1000 //000
const INSTANCES_LIMIT = 10000

interface GrassProps {
  getElevation: (position: [number, number], uniforms: any, time: number) => number
  terrainUniforms: any
  scaleMap: number
}

const timeUniform = { type: 'f', value: 0.0 }
const Grass = ({ getElevation, terrainUniforms, scaleMap }: GrassProps) => {
  const grassRef = useRef<THREE.InstancedMesh>(null)
  let BLADE_WIDTH = 0.1
  let BLADE_HEIGHT = 2.8
  let BLADE_HEIGHT_VARIATION = 0.6

  useEffect(() => {
    const mapSize = PLANE_SIZE * scaleMap
    const instancesPerRow = Math.sqrt(INSTANCES_LIMIT)

    for (let i = 0; i < INSTANCES_LIMIT; i++) {
      const matrix = new THREE.Matrix4()
      const row = Math.floor(i / instancesPerRow)
      const col = i % instancesPerRow

      const x = (col - instancesPerRow / 2) * (mapSize / instancesPerRow)
      const z = (row - instancesPerRow / 2) * (mapSize / instancesPerRow)
      // Scale the coordinates back to the base terrain size for elevation calculation
      const scaledX = x / scaleMap
      const scaledZ = z / scaleMap
      const elevation = getElevation([scaledX, scaledZ], terrainUniforms, 0)

      // Scale the elevation back to match the terrain scale
      const scaledElevation = elevation * scaleMap
      if (scaledElevation >= -0.5) {
        const position = new THREE.Vector3(x, scaledElevation, z)
        const scale = new THREE.Vector3(1, 1, 1)

        matrix.compose(position, new THREE.Quaternion(), scale)
        grassRef.current?.setMatrixAt(i, matrix)
      }
    }
  }, [INSTANCES_LIMIT, scaleMap])

  const convertRange = (val: number, oldMin: number, oldMax: number, newMin: number, newMax: number) => {
    return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
  }

  const generateBlade = (center: THREE.Vector3, vArrOffset: number, uv: number[]) => {
    const MID_WIDTH = BLADE_WIDTH * 0.5
    const TIP_OFFSET = 0.1
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION

    const yaw = Math.random() * Math.PI * 2
    const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw))
    const tipBend = Math.random() * Math.PI * 2
    const tipBendUnitVec = new THREE.Vector3(Math.sin(tipBend), 0, -Math.cos(tipBend))

    // Find the Bottom Left, Bottom Right, Top Left, Top right, Top Center vertex positions
    const bl = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * 1),
    )
    const br = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * -1),
    )
    const tl = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * 1),
    )
    const tr = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * -1),
    )
    const tc = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(tipBendUnitVec).multiplyScalar(TIP_OFFSET),
    )

    tl.y += height / 2
    tr.y += height / 2
    tc.y += height

    // Vertex Colors
    const black = [0, 0, 0]
    const gray = [0.5, 0.5, 0.5]
    const white = [1.0, 1.0, 1.0]

    const verts = [
      { pos: bl.toArray(), uv: uv, color: black },
      { pos: br.toArray(), uv: uv, color: black },
      { pos: tr.toArray(), uv: uv, color: gray },
      { pos: tl.toArray(), uv: uv, color: gray },
      { pos: tc.toArray(), uv: uv, color: white },
    ]
    const indices = [
      vArrOffset,
      vArrOffset + 1,
      vArrOffset + 2,
      vArrOffset + 2,
      vArrOffset + 4,
      vArrOffset + 3,
      vArrOffset + 3,
      vArrOffset,
      vArrOffset + 2,
    ]

    return { verts, indices }
  }

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

  //   // Get elevation for each vertex position
  //   const blElevation = getElevation([bl.x, bl.z], terrainUniforms, 0)
  //   const brElevation = getElevation([br.x, br.z], terrainUniforms, 0)
  //   const tlElevation = getElevation([tl.x, tl.z], terrainUniforms, 0)
  //   const trElevation = getElevation([tr.x, tr.z], terrainUniforms, 0)
  //   const tcElevation = getElevation([tc.x, tc.z], terrainUniforms, 0)

  //   // Apply elevation to each vertex
  //   bl.y = blElevation
  //   br.y = brElevation
  //   tl.y = tlElevation + height / 2
  //   tr.y = trElevation + height / 2
  //   tc.y = tcElevation + height

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

  const generateGrassData = () => {
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const colors: number[] = []

    for (let i = 0; i < BLADE_COUNT; i++) {
      const VERTEX_COUNT = 5
      const surfaceMin = (PLANE_SIZE / 2) * -1
      const surfaceMax = PLANE_SIZE / 2

      const x = Math.random() * PLANE_SIZE - PLANE_SIZE / 2
      const z = Math.random() * PLANE_SIZE - PLANE_SIZE / 2

      const pos = new THREE.Vector3(x, 0, z)

      const uv = [convertRange(pos.x, surfaceMin, surfaceMax, 0, 1), convertRange(pos.z, surfaceMin, surfaceMax, 0, 1)]

      const blade = generateBlade(pos, i * VERTEX_COUNT, uv)
      blade.verts.forEach((vert) => {
        positions.push(...vert.pos)
        uvs.push(...vert.uv)
        colors.push(...vert.color)
      })
      blade.indices.forEach((indice) => indices.push(indice))
    }
    return { positions, uvs, indices, colors }
  }

  //   useEffect(() => {
  //     const mapSize = PLANE_SIZE * scaleMap
  //     const instancesPerRow = Math.sqrt(INSTANCES_LIMIT)
  //     let validInstanceCount = 0

  //     for (let i = 0; i < INSTANCES_LIMIT; i++) {
  //       const matrix = new THREE.Matrix4()
  //       const row = Math.floor(i / instancesPerRow)
  //       const col = i % instancesPerRow

  //       const x = (col - instancesPerRow / 2) * (mapSize / instancesPerRow)
  //       const z = (row - instancesPerRow / 2) * (mapSize / instancesPerRow)
  //       const scaledX = x / scaleMap
  //       const scaledZ = z / scaleMap
  //       const elevation = getElevation([scaledX, scaledZ], terrainUniforms, 0)
  //       const scaledElevation = elevation * scaleMap

  //       // Skip instances outside elevation range - don't create them at all
  //       if (scaledElevation < -0.1 || scaledElevation > 0.1) {
  //         continue // Skip this instance entirely
  //       }

  //       const position = new THREE.Vector3(x, scaledElevation, z)
  //       const scale = new THREE.Vector3(1, 1, 1)
  //       matrix.compose(position, new THREE.Quaternion(), scale)
  //       validInstanceCount++

  //       grassRef.current?.setMatrixAt(validInstanceCount - 1, matrix)
  //     }

  //     console.log(`Rendered ${validInstanceCount} grass instances out of ${INSTANCES_LIMIT}`)
  //   }, [INSTANCES_LIMIT, scaleMap])

  //  const generateSingleGrassPatchGeometry = () => {
  //    const positions: number[] = []
  //    const uvs: number[] = []
  //    const indices: number[] = []
  //    const colors: number[] = []

  //    const BLADES_PER_PATCH = 20
  //    const PATCH_SIZE = 1.0
  //    let vertexOffset = 0

  //    for (let i = 0; i < BLADES_PER_PATCH; i++) {
  //      const center = new THREE.Vector3((Math.random() - 0.5) * PATCH_SIZE, 0, (Math.random() - 0.5) * PATCH_SIZE)

  //      // Calculate elevation for this blade position within the patch
  //      const scaledX = center.x / scaleMap
  //      const scaledZ = center.z / scaleMap
  //      const elevation = getElevation([scaledX, scaledZ], terrainUniforms, 0)
  //      const scaledElevation = elevation * scaleMap

  //      // Skip geometry generation if elevation is outside range
  //      if (scaledElevation < -0.1 || scaledElevation > 0.1) {
  //        continue // Skip this blade entirely - no geometry generated
  //      }

  //      // Set the blade position to the calculated elevation
  //      center.y = scaledElevation

  //      const blade = generateBlade(center, vertexOffset, [0.5, 0.5])
  //      blade.verts.forEach((vert) => {
  //        positions.push(...vert.pos)
  //        uvs.push(...vert.uv)
  //        colors.push(...vert.color)
  //      })
  //      blade.indices.forEach((indice) => indices.push(indice))

  //      vertexOffset += 5
  //    }

  //    console.log(`Generated geometry for ${vertexOffset / 5} grass blades in patch`)
  //    return { positions, uvs, indices, colors }
  //  }

  const geom = useMemo(() => {
    const { positions, uvs, indices, colors } = generateGrassData()
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
    g.setIndex(indices)
    g.computeVertexNormals()

    // g.computeFaceNormals()
    return g
  }, [])

  const grassTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.GRASS.ALBEDO)
  const grassUniforms = useRef({
    // textures: new THREE.Uniform([new THREE.Uniform(grassTexture), new THREE.Uniform(grassTexture)]),
    // texture1: new THREE.Uniform(grassTexture),
    textures: { value: [grassTexture, grassTexture] },
    texture1: { value: grassTexture },
    iTime: new THREE.Uniform(timeUniform),
  })

  const grassMaterial = useMemo(() => {
    console.log('grassUniforms.current', grassUniforms.current)
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

  return (
    <>
      {/* <instancedMesh ref={grassRef} args={[null, null, INSTANCES_LIMIT]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color='tomato' />
      </instancedMesh> */}
      <instancedMesh
        ref={grassRef}
        args={[geom, grassMaterial, INSTANCES_LIMIT]}
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
