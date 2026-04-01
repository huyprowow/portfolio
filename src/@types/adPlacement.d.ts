interface AdBreakConfig {
  type: 'preroll' | 'start' | 'pause' | 'next' | 'browse' | 'reward'
  name?: string
  adBreakDone?: (placementInfo: { breakStatus: string }) => void
  beforeAd?: () => void
  afterAd?: () => void
  beforeReward?: (showAdFn: () => void) => void
  adDismissed?: () => void
  adViewed?: () => void
}

interface AdConfigParams {
  preloadAdBreaks?: 'on' | 'auto'
  sound?: 'on' | 'off'
  onReady?: () => void
}

declare function adBreak(config: AdBreakConfig): void
declare function adConfig(config: AdConfigParams): void
