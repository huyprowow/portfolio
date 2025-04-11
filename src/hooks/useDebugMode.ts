import { useEffect, useState } from 'react'

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(false)

  useEffect(() => {
    const checkDebugMode = () => {
      setIsDebugMode(window.location.hash === '#debug')
    }

    // Check initially
    checkDebugMode()

    // Listen for hash changes
    window.addEventListener('hashchange', checkDebugMode)

    return () => {
      window.removeEventListener('hashchange', checkDebugMode)
    }
  }, [])

  return isDebugMode
}
