import { Assets } from '@/helpers/assetMap'
import { Center, Text3D, useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Group } from 'three'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { LOG_GROUP } from '@/constant/logGroup'
import { logToGroup } from '@/helpers/logToGroup'
import { useBoundStore } from '@/store/store'
import { BoxTriggerZone } from '../Debug/BoxTriggerZone'
import { EInteractObjectId, ETriggerMode } from '@/constant/enum'
import * as THREE from 'three'
import df_npc_setting from '@/settings/df_npc_setting.json'
const Slime = () => {
  const group = useRef<Group>(null)
  const { nodes, materials, animations } = useGLTF(Assets.NPC.SLIME)
  const { actions } = useAnimations(animations, group)
  const setIsInteractZone = useBoundStore((state) => state.setIsInteractZone)
  const isInteractZone = useBoundStore((state) => state.isInteractZone)
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const interacting = useBoundStore((state) => state.interacting)
  const setInteracting = useBoundStore((state) => state.setInteracting)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const slime = useRef<RapierRigidBody>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  useEffect(() => {
    actions?.['Slime_Idle']?.play()
  }, [actions])

  const interactSlime = () => {
    setInteracting({
      isInteract: true,
      interactObjectId: EInteractObjectId.SLIME,
    })
    timeoutRef.current = setTimeout(() => {
      setInteracting(null)
      timeoutRef.current = null
    }, 1000)
     setIsFollowing(true)
  }

  const followPlayer = () => {
    if (!slime.current) return
    const distanceToStartPosition = Math.sqrt(
      (slime.current.translation().x - df_npc_setting.slime.startPosition.x) ** 2 +
        (slime.current.translation().y - df_npc_setting.slime.startPosition.y) ** 2 +
        (slime.current.translation().z - df_npc_setting.slime.startPosition.z) ** 2,
    )
    const maxDistance = 10
    if (distanceToStartPosition < 10) {
      // move to start position
    } else {
    }
  }
  useFrame(() => {
    if (isFollowing) {
      followPlayer()
    }
  })

  const playerRef = useBoundStore((state) => state.playerRef)
  // hear jump key press
  useEffect(() => {
    const unSubscribeInteractKey = subscribeKeys(
      (state) => state.interact,
      (interact) => {
        if (interact) {
          interactSlime()
        }
      },
    )

    return () => {
      unSubscribeInteractKey()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [subscribeKeys])

  const handleEnterSlimeZone = () => {
    logToGroup(LOG_GROUP.NPC, 'Slime In Zone')
    setIsInteractZone(true)
  }
  const handleExitSlimeZone = () => {
    logToGroup(LOG_GROUP.NPC, 'Slime Out Zone')
    setIsInteractZone(false)
  }
  logToGroup(LOG_GROUP.NPC, {
    x: df_npc_setting.slime.startPosition.x,
    y: df_npc_setting.slime.startPosition.y + 2,
    z: df_npc_setting.slime.startPosition.z,
  })
  const textInteractMaterial = new THREE.MeshBasicMaterial({
    color: 'red',
    side: THREE.DoubleSide,
  })
  const textChatMaterial = new THREE.MeshBasicMaterial({
    color: 'white',
    side: THREE.DoubleSide,
  })

  return (
    <group>
      {isInteractZone && (
        <>
          {!timeoutRef.current && (
            <Text3D
              font={Assets.FONT.ROBOTO_SEMIBOLD_REGULAR}
              position={[
                df_npc_setting.slime.startPosition.x,
                df_npc_setting.slime.startPosition.y + 5,
                df_npc_setting.slime.startPosition.z,
              ]}
              rotation={[0, Math.PI / 2, 0]}
              scale={1}
              bevelEnabled
              material={textInteractMaterial}
            >
              x
            </Text3D>
          )}

          {interacting?.interactObjectId === EInteractObjectId.SLIME && (
            <Center
              position={[
                df_npc_setting.slime.startPosition.x - 3,
                df_npc_setting.slime.startPosition.y + 5,
                df_npc_setting.slime.startPosition.z + 1,
              ]}
              rotation={[0, -Math.PI / 2, 0]}
            >
              <Text3D font={Assets.FONT.ROBOTO_SEMIBOLD_REGULAR} scale={1} bevelEnabled material={textChatMaterial}>
                Hi, I'm Slime &gt; &lt;
              </Text3D>
            </Center>
          )}
        </>
      )}
      <RigidBody type='kinematicPosition' colliders='hull' ref={slime}>
        <group
          ref={group}
          dispose={null}
          scale={3}
          position={[
            df_npc_setting.slime.startPosition.x,
            df_npc_setting.slime.startPosition.y,
            df_npc_setting.slime.startPosition.z,
          ]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <group name='Scene'>
            <group name='Root'>
              <skinnedMesh
                name='slime_eye'
                geometry={nodes.slime_eye.geometry}
                material={nodes.slime_eye.material}
                skeleton={nodes.slime_eye.skeleton}
              />
              <skinnedMesh
                name='slime_eye001'
                geometry={nodes.slime_eye001.geometry}
                material={nodes.slime_eye001.material}
                skeleton={nodes.slime_eye001.skeleton}
              />
              <skinnedMesh
                name='Slime_mesh'
                geometry={nodes.Slime_mesh.geometry}
                material={materials.skin}
                skeleton={nodes.Slime_mesh.skeleton}
              />
              <primitive object={nodes.Bone} />
            </group>
          </group>
        </group>
      </RigidBody>
      {/* Interaction Zone */}
      <BoxTriggerZone
        size={[12, 4, 8]}
        center={[
          df_npc_setting.slime.startPosition.x - 4,
          df_npc_setting.slime.startPosition.y + 2,
          df_npc_setting.slime.startPosition.z,
        ]}
        playerRef={playerRef}
        onEnter={handleEnterSlimeZone}
        onExit={handleExitSlimeZone}
        debug={true}
        color='green'
        mode={ETriggerMode.XZ}
      />
    </group>
  )
}
export default Slime
useGLTF.preload(Assets.NPC.SLIME)
