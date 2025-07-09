import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import grassVertexShader from '@/_shaders/grass/vertex.glsl'
import grassFragmentShader from '@/_shaders/grass/fragment.glsl'
import { Assets } from '@/helpers/assetMap'
import { useLoader } from '@react-three/fiber'
import dfMapSetting from '@/settings/df_map_setting.json'

const PLANE_SIZE = 10
const BLADE_COUNT = 1000000

interface GrassProps {
  getElevation: (position: [number, number], uniforms: any, time: number) => number
  terrainUniforms: any
  scaleMap: number
}

const timeUniform = { type: 'f', value: 0.0 }
const Grass = ({ getElevation, terrainUniforms, scaleMap }: GrassProps) => {
  const grassRef = useRef<THREE.InstancedMesh>(null)
  let BLADE_WIDTH = 0.1 / (scaleMap * 0.4)
  let BLADE_HEIGHT = 0.8 / (scaleMap * 0.2)
  let BLADE_HEIGHT_VARIATION = 0.6 / (scaleMap * 0.1)

  // useEffect(() => {
  //   for (let i = 0; i < BLADE_COUNT; i++) {
  //     const matrix = new THREE.Matrix4()
  //     matrix.compose(new THREE.Vector3(i * 2, 0, 0), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1))
  //     grassRef.current?.setMatrixAt(i, matrix)
  //   }
  // }, [])

  const grassTexture = useLoader(THREE.TextureLoader, Assets.TEXTURE.GRASS.ALBEDO)
  const grassUniforms = {
    textures: { value: [grassTexture] },
    iTime: timeUniform,
  }

  const grassMaterial = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: grassUniforms,
        vertexShader: grassVertexShader,
        fragmentShader: grassFragmentShader,
        vertexColors: true,
        side: THREE.DoubleSide,
      }),
    [grassTexture],
  )
  const convertRange = (val: number, oldMin: number, oldMax: number, newMin: number, newMax: number) => {
    return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
  }

  const generateBlade = (center: THREE.Vector3, vArrOffset: number, uv: THREE.Vector2) => {
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

  const generateGrassData = () => {
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const colors: number[] = []

    for (let i = 0; i < BLADE_COUNT; i++) {
      const VERTEX_COUNT = 5
      const surfaceMin = (PLANE_SIZE / 2) * -1
      const surfaceMax = PLANE_SIZE / 2
      const radius = PLANE_SIZE / 2

      const x = Math.random() * PLANE_SIZE - PLANE_SIZE / 2
      const z = Math.random() * PLANE_SIZE - PLANE_SIZE / 2
      const elevation = getElevation([x, z], terrainUniforms, 0) // or pass time if animated
      const pos = new THREE.Vector3(x, elevation, z)

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

  const { positions, uvs, indices, colors } = useMemo(
    () => generateGrassData(),
    [getElevation, terrainUniforms, scaleMap],
  )

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
    g.setIndex(indices)
    g.computeVertexNormals()

    // geom.computeFaceNormals()
    return g
  }, [positions, uvs, indices, colors])

  return (
    // <instancedMesh
    //   ref={grassRef}
    //   args={[geom, grassMaterial, BLADE_COUNT]}
    //   castShadow
    //   receiveShadow
    //   position={[
    //     dfMapSetting.object.terrain.startPosition.x,
    //     dfMapSetting.object.terrain.startPosition.y - 0.1,
    //     dfMapSetting.object.terrain.startPosition.z,
    //   ]}
    //   scale={[scaleMap, scaleMap, scaleMap]}
    // />
    <mesh
      material={grassMaterial}
      geometry={geom}
      scale={[scaleMap, scaleMap, scaleMap]}
      position={[
        dfMapSetting.object.terrain.startPosition.x,
        dfMapSetting.object.terrain.startPosition.y - 0.1,
        dfMapSetting.object.terrain.startPosition.z,
      ]}
    ></mesh>
  )
}

export default Grass
