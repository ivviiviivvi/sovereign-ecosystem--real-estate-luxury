import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedPropertyCardProps {
  children: ReactNode
  index: number
  className?: string
}

export function AnimatedPropertyCard({ children, index, className = '' }: AnimatedPropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
