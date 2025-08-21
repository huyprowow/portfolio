import { useEffect, useState } from 'react'

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(false)

  useEffect(() => {
    const checkDebugMode = () => {
      // If VITE_PREVENT_PRODUCT_DEBUG is 'true', prevent debug mode
      if (import.meta.env.VITE_PREVENT_PRODUCT_DEBUG === 'true') {
        // Remove #debug from URL if it exists
        if (window.location.hash === '#debug') {
          window.location.hash = ''
        }
        setIsDebugMode(false)
        return
      }

      // Normal debug mode check
      setIsDebugMode(window.location.hash === '#debug')
    }

    // Check immediately
    checkDebugMode()

    // Listen for hash changes
    window.addEventListener('hashchange', checkDebugMode)

    return () => {
      window.removeEventListener('hashchange', checkDebugMode)
    }
  }, [])

  return isDebugMode
}
