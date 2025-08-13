import { useLoadingAssets } from '@/hooks/useLoading'
import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  onComplete?: () => void
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const loading = useLoadingAssets()
  const { progress } = useProgress()
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    if (!loading && progress === 100) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowLoading(false)
        onComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, progress, onComplete])

  if (!showLoading) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className='fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black'
        style={{ zIndex: 100000 }}
      >
        <div className='relative w-full max-w-md px-6'>
          {/* Progress Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className='relative h-2 bg-white rounded-full overflow-hidden mb-6'
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className='h-full bg-gradient-to-r from-gray-800 to-gray-500 rounded-full'
            />
          </motion.div>

          {/* Progress Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className='text-center'
          >
            <p className='text-white text-lg font-semibold mb-2'>{Math.round(progress)}%</p>
            <p className='text-gray-300 text-sm'>{loading ? 'Loading assets...' : 'Ready to explore!'}</p>
          </motion.div>

          {/* Loading Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className='mt-8 text-center'
          >
            <div className='bg-gray-800/50 backdrop-blur-sm rounded-lg p-4'>
              <h3 className='text-gray-300 font-semibold mb-2'>Controls</h3>
              <div className='grid grid-cols-2 gap-2 text-xs text-gray-300'>
                <div>WASD - Move</div>
                <div>Space - Jump</div>
                <div>J,U,K - Skills</div>
                <div>F - Toggle Control Mode</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background Animation */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className='absolute w-1 h-1 bg-gray-400 rounded-full'
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoadingScreen
