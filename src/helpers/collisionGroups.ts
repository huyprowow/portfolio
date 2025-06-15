export function toInteractionGroups({ memberships, filter }: { memberships: number; filter: number }): number {
  return ((memberships & 0xffff) << 16) | (filter & 0xffff)
}
