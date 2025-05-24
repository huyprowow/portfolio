import { Assets } from '@/helpers/assetMap'
import { useAnimations, useFBX, useKeyboardControls } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import { useControls } from 'leva'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimationAction, AnimationMixer } from 'three'
import { FBXLoader } from 'three-stdlib'
import characterSetting from '@/settings/df_character_setting.json'

interface IProps {
  player: any
}

export const useAnimationModel = ({ player }: IProps) => {
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const [currentAction, setCurrentAction] = useState('')

  const animationLinks = Assets.ANIMATION
  // Load all FBX files (one per animation)
  const fbxFiles = useMemo(() => {
    return Object.entries(animationLinks).map(([key, url]) => ({
      key,
      fbx: useLoader(FBXLoader, url),
    }))
  }, [])

  // Create an action map from the loaded animations
  const { actionMap, mixer } = useMemo(() => {
    const mixer = new AnimationMixer(player)
    const map = new Map<string, AnimationAction>()

    for (const { key, fbx } of fbxFiles) {
      if (!fbx.animations.length) continue
      const action = mixer.clipAction(fbx.animations[0], player)
      map.set(key, action)
    }

    return { actionMap: map, mixer }
  }, [fbxFiles, player])

  const { animationDebugValue, debugAnimation } = useControls('Animation Debug', {
    animationDebugValue: {
      value: 'SWORD_AND_SHIELD_IDLE',
      label: 'Animation Debug',
      options: Object.keys(Assets.ANIMATION),
    },
    debugAnimation: {
      value: false,
      label: 'Debug Animation',
    },
  })
  useEffect(() => {
    if (debugAnimation) {
      console.log('actionMap:', actionMap)
      const action = actionMap.get(animationDebugValue)
      if (action) {
        setCurrentAction(animationDebugValue)
      }
    }
  }, [actionMap, animationDebugValue, debugAnimation, currentAction])

  useEffect(() => {
    const action = currentAction ? actionMap.get(currentAction) : actionMap.get(characterSetting.animation.idle.name)
    if (action) {
      action.reset().fadeIn(0.1).play()
    }
    return () => {
      action?.fadeOut(0.1)
    }
  }, [currentAction])

  return {
    actionMap,
    mixer,
    currentAction,
    setCurrentAction,
  }
}
Object.values(Assets.ANIMATION).forEach((path) => useLoader.preload(FBXLoader, path))
