import React, { useEffect } from 'react'
import { Live2DCubismFramework as live2dcubismframework } from '@/lib/CubismSdkForWeb-5-r.4/Framework/src/live2dcubismframework'
import CubismFramework = live2dcubismframework.CubismFramework
const Tutorial = () => {
  useEffect(() => {
    CubismFramework.startUp()
  }, [])
  return <></>
}

export default Tutorial
