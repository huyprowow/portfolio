import { Assets } from '@/helpers/assetMap'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { InstancedRigidBodies, RigidBody, useRapier } from '@react-three/rapier'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import dfMapSetting from '@/settings/df_map_setting.json'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { logToGroup } from '@/helpers/logToGroup'
import { LOG_GROUP } from '@/constant/logGroup'

interface TreeProps {
  getElevation: (position: [number, number], uniforms: any, time: number) => number
  scaleMap: number
  terrainUniforms: any
}
// Define exclusion zones where trees shouldn't be placed
const exclusionZones = [
  {
    name: 'tent',
    center: [
      dfMapSetting.object.tent.boxTriggerZone.center[0] - 10,
      dfMapSetting.object.tent.boxTriggerZone.center[2], // Note: z becomes z in our coordinate system
    ],
    size: [
      dfMapSetting.object.tent.boxTriggerZone.size[0] + 100,
      dfMapSetting.object.tent.boxTriggerZone.size[2] + 100, // Note: z becomes z in our coordinate system
    ],
  },
  // Add more exclusion zones here as needed
]

// Helper function to check if a position is within any exclusion zone
const isPositionExcluded = (x: number, z: number): boolean => {
  for (const zone of exclusionZones) {
    const [zoneX, zoneZ] = zone.center
    const [sizeX, sizeZ] = zone.size

    // Check if position is within the exclusion zone
    if (Math.abs(x - zoneX) < sizeX / 2 && Math.abs(z - zoneZ) < sizeZ / 2) {
      return true
    }
  }
  return false
}

const Tree = ({ getElevation, scaleMap, terrainUniforms }: TreeProps) => {
  const scene = useLoader(GLTFLoader, Assets.TREE)
  const leavesRigidBodiesRef = useRef<any>(null)
  const trunkRigidBodiesRef = useRef<any>(null)
  const { world } = useRapier()
  const { nodes, materials } = scene

  const treeCount = 80 // Tăng số lượng trees
  const instances = useMemo(() => {
    const PLANE_SIZE = 10
    const mapSize = PLANE_SIZE * scaleMap
    const instances = []
    logToGroup(LOG_GROUP.MAP, '�� Exclusion zones:', exclusionZones)

    for (let i = 0; i < treeCount; i++) {
      const scaleInstance = 50
      const x = (Math.random() - 0.5) * mapSize
      const z = (Math.random() - 0.5) * mapSize

      // Check if this position is in an exclusion zone
      if (isPositionExcluded(x, z)) {
        continue // Skip this tree
      }

      const scaledX = x / scaleMap
      const scaledZ = z / scaleMap
      const elevation = getElevation([scaledX, scaledZ], terrainUniforms, 0)
      const scaledElevation = elevation * scaleMap
      const minScaledElevation = 0 * scaleMap
      const maxScaledElevation = 0.12 * scaleMap
      if (elevation < minScaledElevation || elevation > maxScaledElevation) {
        continue
      }
      instances.push({
        key: 'instance_' + i,
        position: [x, scaledElevation, z] as [number, number, number],
        rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        scale: [scaleInstance, scaleInstance, scaleInstance] as [number, number, number],
      })
    }

    logToGroup(LOG_GROUP.MAP, `render ${instances.length} trees instance`)
    return instances
  }, [])
  // Clone materials to avoid modifying the original
  const leavesMaterial = materials.Leavs.clone()
  const trunkMaterial = materials.Trank.clone()

  // Set materials to render both sides
  leavesMaterial.side = THREE.DoubleSide
  trunkMaterial.side = THREE.DoubleSide
  useEffect(() => {
    return () => {
      // Cleanup rigid bodies
      // dell chay
      // if (leavesRigidBodiesRef.current) {
      //   const rigidBodies = leavesRigidBodiesRef.current
      //   if (rigidBodies) {
      //     rigidBodies.forEach((body: any) => {
      //       if (body && world) {
      //         world.removeRigidBody(body)
      //       }
      //     })
      //   }
      // }

      // if (trunkRigidBodiesRef.current) {
      //   const rigidBodies = trunkRigidBodiesRef.current
      //   if (rigidBodies) {
      //     rigidBodies.forEach((body: any) => {
      //       if (body && world) {
      //         world.removeRigidBody(body)
      //       }
      //     })
      //   }
      // }

      // Dispose geometry with proper type checking
      if (nodes.Leaves001_Leavs_0 && 'geometry' in nodes.Leaves001_Leavs_0) {
        ;(nodes.Leaves001_Leavs_0 as any).geometry.dispose()
      }
      if (nodes.Trank001_Trank_0 && 'geometry' in nodes.Trank001_Trank_0) {
        ;(nodes.Trank001_Trank_0 as any).geometry.dispose()
      }

      // Dispose material
      if (materials.Leavs) {
        materials.Leavs.dispose()
      }
      if (materials.Trank) {
        materials.Trank.dispose()
      }

      // Dispose cloned materials
      if (leavesMaterial) {
        leavesMaterial.dispose()
      }
      if (trunkMaterial) {
        trunkMaterial.dispose()
      } // Dispose physics bodies
      if (leavesRigidBodiesRef.current) {
        leavesRigidBodiesRef.current.forEach((rigidBody: any) => {
          if (rigidBody && rigidBody.raw) {
            rigidBody.raw.setEnabled(false)
          }
        })
      }

      if (trunkRigidBodiesRef.current) {
        trunkRigidBodiesRef.current.forEach((rigidBody: any) => {
          if (rigidBody && rigidBody.raw) {
            rigidBody.raw.setEnabled(false)
          }
        })
      }

      // Dispose geometry with proper type checking
      if (nodes.Leaves001_Leavs_0 && 'geometry' in nodes.Leaves001_Leavs_0) {
        ;(nodes.Leaves001_Leavs_0 as any).geometry.dispose()
      }
      if (nodes.Trank001_Trank_0 && 'geometry' in nodes.Trank001_Trank_0) {
        ;(nodes.Trank001_Trank_0 as any).geometry.dispose()
      }

      // Dispose material
      if (materials.Leavs) {
        materials.Leavs.dispose()
      }
      if (materials.Trank) {
        materials.Trank.dispose()
      }

      // Dispose cloned materials
      if (leavesMaterial) {
        leavesMaterial.dispose()
      }
      if (trunkMaterial) {
        trunkMaterial.dispose()
      }
    }
  }, [])
  return (
    <>
      {/* <group dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Leaves001_Leavs_0.geometry}
        material={materials.Leavs}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={50}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Trank001_Trank_0.geometry}
        material={materials.Trank}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={50}
      />
    </group> */}
      {/* Debug visualization of exclusion zones */}
      {exclusionZones.map((zone, index) => {
        const [centerX, centerZ] = zone.center
        const [sizeX, sizeZ] = zone.size
        return (
          <mesh key={`exclusion-zone-${index}`} position={[centerX, 20, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[sizeX, sizeZ]} />
            <meshBasicMaterial color='red' transparent opacity={0.3} wireframe={true} />
          </mesh>
        )
      })}
      <group>
        {/* Leaves */}
        <InstancedRigidBodies ref={leavesRigidBodiesRef} instances={instances} type='fixed' colliders={'hull'}>
          <instancedMesh
            args={[(nodes.Leaves001_Leavs_0 as any).geometry, materials.Leavs, instances.length]}
            castShadow
            receiveShadow
            frustumCulled={false} // Disable frustum culling
          />
        </InstancedRigidBodies>
        {/* Trunk */}
        <InstancedRigidBodies ref={trunkRigidBodiesRef} instances={instances} type='fixed'>
          <instancedMesh
            args={[(nodes.Trank001_Trank_0 as any).geometry, materials.Trank, instances.length]}
            castShadow
            receiveShadow
            frustumCulled={false} // Disable frustum culling
          />
        </InstancedRigidBodies>
      </group>
    </>
  )
}

export default Tree

useLoader.preload(GLTFLoader, Assets.TREE)
