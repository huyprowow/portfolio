import { Assets } from '@/helpers/assetMap'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const Campfire = () => {
  const scene = useLoader(GLTFLoader, Assets.CAMPFIRE)

  return <primitive object={scene.scene} position={[10, 0, 10]} scale={2} />
}

export default Campfire
