import { Assets } from '@/helpers/assetMap'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const WoodBlock = () => {
  const scene = useLoader(GLTFLoader, Assets.WOOD_BLOCK)

  return (
    <RigidBody type='fixed' colliders='hull'>
      <primitive object={scene.scene} position={[0, -28, 20]} scale={[6, 4.2, 6]} />
    </RigidBody>
  )
}

export default WoodBlock

useLoader.preload(GLTFLoader, Assets.WOOD_BLOCK)
