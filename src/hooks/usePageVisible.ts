import { useState, useEffect } from 'react'

export const usePageVisible = () => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return visible
}
