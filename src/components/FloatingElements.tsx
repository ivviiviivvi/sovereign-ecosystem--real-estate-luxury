import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/use-theme'

export function FloatingElements() {
  const { theme } = useTheme()
  
  const elements = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-moonlit-lavender/20 via-moonlit-violet/10 to-transparent' 
              : 'bg-gradient-to-br from-rose-blush/10 via-lavender-mist/20 to-transparent'
          }`}
          style={{
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: 'blur(60px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}
