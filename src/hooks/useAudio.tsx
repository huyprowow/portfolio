import { Assets } from '@/helpers/assetMap'
import React, { useState } from 'react'

const bgmList = Object.entries(Assets.AUDIO.BGM).map(([key, value]) => {
  return {
    key,
    value: new Audio(value),
  }
})
const useAudio = () => {
  return {
    bgm: bgmList,
  }
}

export default useAudio
