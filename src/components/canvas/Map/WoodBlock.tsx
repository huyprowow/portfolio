import { Assets } from '@/helpers/assetMap'
import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const WoodBlock = () => {
  const scene = useLoader(GLTFLoader, Assets.WOOD_BLOCK)

  return (
    <RigidBody type='fixed' colliders='hull'>
      <primitive object={scene.scene} position={[0, 0, 20]} scale={3} />
    </RigidBody>
  )
}

export default WoodBlock

useLoader.preload(GLTFLoader, Assets.WOOD_BLOCK)
