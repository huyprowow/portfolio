import React from 'react'
import Room from './Room'
import Terrain from './Terrain'
import Campfire from './Campfire'
import { Tent } from './Tent'
import WoodBlock from './WoodBlock'
import Water from './Water'
import Sea from './Sea'
const Map = () => {
  return (
    <>
      <Terrain />
      {/* <Sea /> */}
      {/* <Water /> */}
      <Campfire />
      <Tent />
      <WoodBlock />
      {/* <Room /> */}
    </>
  )
}

export default Map
