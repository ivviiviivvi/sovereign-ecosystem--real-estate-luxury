import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@/hooks/use-theme'
import { motion } from 'framer-motion'
import { soundManager } from '@/lib/sound-manager'

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) return null

  const handleToggle = () => {
    toggleTheme()
    soundManager.play('glassTap')
  }

  return (
    <motion.button
      onClick={handleToggle}
      className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary/50 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 360 : 0,
          scale: theme === 'dark' ? 1 : 0,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-moonlit-silver" weight="fill" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'light' ? 0 : -360,
          scale: theme === 'light' ? 1 : 0,
          opacity: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-rose-blush" weight="fill" />
      </motion.div>
    </motion.button>
  )
}
