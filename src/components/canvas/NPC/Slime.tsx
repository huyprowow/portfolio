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
import * as YUKA from 'yuka'
import df_npc_setting from '@/settings/df_npc_setting.json'
import dialogue_script from '@/components/dom/DialogueAndCutscene/dialogue_script.json'
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
  const dialogueTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const slime = useRef<RapierRigidBody>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const setDialogue = useBoundStore((state) => state.setDialogue)
  const playerRef = useBoundStore((state) => state.playerRef)

  useEffect(() => {
    actions?.['Slime_Idle']?.play()
  }, [actions])

  const interactSlime = () => {
    // Clear any existing timeouts first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (dialogueTimeoutRef.current) {
      clearTimeout(dialogueTimeoutRef.current)
      dialogueTimeoutRef.current = null
    }
    setInteracting({
      isInteract: true,
      interactObjectId: EInteractObjectId.SLIME,
    })
    setDialogue({
      actor: dialogue_script.dialogue[0].actor,
      text: dialogue_script.dialogue[0].text,
      timeToHide: dialogue_script.dialogue[0].timeToHide,
    })

    timeoutRef.current = setTimeout(() => {
      setInteracting(null)
      timeoutRef.current = null
    }, 1000)
    dialogueTimeoutRef.current = setTimeout(() => {
      setDialogue(null)
      dialogueTimeoutRef.current = null
    }, dialogue_script.dialogue[0].timeToHide)

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
    if (distanceToStartPosition > maxDistance) {
      // move to start position
      const startPosition = new YUKA.Vector3(
        df_npc_setting.slime.startPosition.x,
        df_npc_setting.slime.startPosition.y,
        df_npc_setting.slime.startPosition.z,
      )
      const direction = new YUKA.Vector3(
        startPosition.x - slime.current.translation().x,
        startPosition.y - slime.current.translation().y,
        startPosition.z - slime.current.translation().z,
      )
      direction.normalize()
      const velocity = new YUKA.Vector3(direction.x * 10, direction.y * 10, direction.z * 10)
      slime.current.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true)
      logToGroup(LOG_GROUP.NPC, 'moving back to start position')
      
      
    } else {
      // follow player
      const playerPosition = playerRef.current?.translation()
      if (!playerPosition) return
      const direction = new YUKA.Vector3(
        playerPosition.x - slime.current.translation().x,
        playerPosition.y - slime.current.translation().y,
        playerPosition.z - slime.current.translation().z,
      )
      direction.normalize()
      const velocity = new YUKA.Vector3(direction.x * 10, direction.y * 10, direction.z * 10)
      slime.current.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true)
      logToGroup(LOG_GROUP.NPC, 'following player')
      
    }
    logToGroup(LOG_GROUP.NPC, 'npc position', slime.current.translation())
    logToGroup(LOG_GROUP.NPC, 'start position', df_npc_setting.slime.startPosition)
    logToGroup(LOG_GROUP.NPC, 'distance to start position', distanceToStartPosition)
    
    
  }
  useFrame(() => {
    if (isFollowing) {
      followPlayer()
    }
  })

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
      if (dialogueTimeoutRef.current) {
        clearTimeout(dialogueTimeoutRef.current)
      }
      setInteracting(null)
      setDialogue(null)
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
  // logToGroup(LOG_GROUP.NPC, {
  //   x: df_npc_setting.slime.startPosition.x,
  //   y: df_npc_setting.slime.startPosition.y + 2,
  //   z: df_npc_setting.slime.startPosition.z,
  // })
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
                {dialogue_script.dialogue[0].bubbleText}
              </Text3D>
            </Center>
          )}
        </>
      )}
      <RigidBody
        type='kinematicPosition'
        colliders='hull'
        ref={slime}
        position={[
          df_npc_setting.slime.startPosition.x,
          df_npc_setting.slime.startPosition.y,
          df_npc_setting.slime.startPosition.z,
        ]}
        scale={3}
        rotation={[0, Math.PI / 2, 0]}
      >
        <group ref={group} dispose={null}>
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
        size={[12, 4, 12]}
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
