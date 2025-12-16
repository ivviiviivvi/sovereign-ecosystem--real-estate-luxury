import { motion } from 'framer-motion'
import { Shield, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { UserRole } from '@/lib/types'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/30 dark:from-midnight-blue dark:via-background dark:to-moonlit-indigo/30 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_oklch(0.85_0.10_340)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,_oklch(0.55_0.18_290)_0%,_transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_oklch(0.90_0.08_70)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,_oklch(0.45_0.08_275)_0%,_transparent_50%)] opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full relative z-10"
      >
        <div className="text-center mb-20">
          <motion.div
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender mx-auto mb-8 animate-float shadow-lg shadow-rose-blush/30 dark:shadow-moonlit-lavender/40" />
          </motion.div>
          
          <motion.h1 
            className="text-7xl font-light text-foreground mb-4 tracking-wide"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            The Sovereign Ecosystem
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-lg font-light tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Select Your Experience
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
          >
            <button
              onClick={() => onSelectRole('agent')}
              className="w-full bg-card/60 backdrop-blur-xl border border-border/30 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 p-14 rounded-3xl transition-all duration-500 group hover:shadow-2xl hover:shadow-rose-blush/20 dark:hover:shadow-moonlit-lavender/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-blush/5 dark:from-moonlit-violet/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Shield className="w-16 h-16 text-rose-blush dark:text-moonlit-lavender mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
              <h2 className="text-4xl font-light text-foreground mb-4 tracking-wide">Portfolio Shield</h2>
              <p className="text-muted-foreground leading-relaxed font-light">
                Agent dashboard with compliance monitoring, risk analytics, and portfolio intelligence
              </p>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
          >
            <button
              onClick={() => onSelectRole('client')}
              className="w-full bg-card/60 backdrop-blur-xl border border-border/30 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 p-14 rounded-3xl transition-all duration-500 group hover:shadow-2xl hover:shadow-rose-blush/20 dark:hover:shadow-moonlit-lavender/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-lavender-mist/5 dark:from-moonlit-lavender/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="w-16 h-16 text-rose-blush mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
              <h2 className="text-4xl font-light text-foreground mb-4 tracking-wide">Client Experience</h2>
              <p className="text-muted-foreground leading-relaxed font-light">
                Exclusive access to curated properties with zero-UI browsing and AI concierge
              </p>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
