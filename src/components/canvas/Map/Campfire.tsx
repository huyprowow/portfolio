import { Assets } from '@/helpers/assetMap'
import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import dfMapSetting from '@/settings/df_map_setting.json'                                  
const Campfire = () => {
  const scene = useLoader(GLTFLoader, Assets.CAMPFIRE)

  return (
    <RigidBody type='fixed' colliders='hull'>
      <primitive
        object={scene.scene}
        position={[
          dfMapSetting.object.campfire.startPosition.x,
          dfMapSetting.object.campfire.startPosition.y,
          dfMapSetting.object.campfire.startPosition.z,
        ]}
        scale={0.05}
      />
    </RigidBody>
  )
}

export default Campfire
useLoader.preload(GLTFLoader, Assets.CAMPFIRE)
