// Utility to combine collision group masks
//passing Group colision in bitwise -> calculate the combined mask
/**
 *
 * const GROUND_GROUP = 0b0001   // 1 in decimal
 * const TENT_GROUP   = 0b0010   // 2 in decimal
 * const SOME_GROUP   = 0b0100   // 4 in decimal
 *
 * const filter = calculateCombineMask(GROUND_GROUP, TENT_GROUP, SOME_GROUP) // returns 0b0111 (7 in decimal)
 */

export function calculateCombineMask(...groups: number[]): number {
  return groups.reduce((mask, group) => mask | group, 0)
}
