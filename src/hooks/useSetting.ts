import gameSetting from '@/settings/df_game_setting.json'
  
const useSetting = () => {
  /***
   * 
   * group for collision require a bitwise number
   */
  const TERRAIN = Number(gameSetting.object.collision_group.TERRAIN)
  const TENT = Number(gameSetting.object.collision_group.TENT)
  const PLAYER = Number(gameSetting.object.collision_group.PLAYER)
  return {
    collision_group: {  
      TERRAIN,
      TENT,
      PLAYER
    }
  }
}

export default useSetting