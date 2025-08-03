import { Assets } from '@/helpers/assetMap'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import dfMapSetting from '@/settings/df_map_setting.json'

interface TreeProps {
  getElevation: (position: [number, number], uniforms: any, time: number) => number
}
const Tree = ({ getElevation }: TreeProps) => {
  const scene = useLoader(GLTFLoader, Assets.TREE)

  const { nodes, materials } = scene

  return (
    // <RigidBody type='fixed' colliders='hull'>
    //   <primitive object={scene.scene} position={[0, 0, 0]} scale={[6, 4.2, 6]} />
    // </RigidBody>

    <group dispose={null}>
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
    </group>
  )
}

export default Tree

useLoader.preload(GLTFLoader, Assets.TREE)
