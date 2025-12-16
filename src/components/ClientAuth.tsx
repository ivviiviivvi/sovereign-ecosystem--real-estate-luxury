import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Check } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { soundManager } from '@/lib/sound-manager'

interface ClientAuthProps {
  onAuthenticate: (inviteCode: string) => void
}

export function ClientAuth({ onAuthenticate }: ClientAuthProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [showBiometric, setShowBiometric] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (inviteCode.length < 6) {
      setError('Invalid invite code')
      return
    }
    
    setIsValidating(true)
    soundManager.play('glassTap')
    
    setTimeout(() => {
      setIsValidating(false)
      setShowBiometric(true)
    }, 1000)
  }

  const handleBiometricComplete = () => {
    soundManager.play('unlock')
    setTimeout(() => {
      onAuthenticate(inviteCode)
    }, 2000)
  }

  if (showBiometric) {
    return <BiometricScan onComplete={handleBiometricComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/30 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_oklch(0.85_0.10_340)_0%,_transparent_50%)] opacity-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-card/60 backdrop-blur-xl border border-border/30 rounded-3xl p-12 shadow-2xl shadow-rose-blush/10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-blush/20 to-lavender-mist/20 flex items-center justify-center backdrop-blur-sm border border-rose-blush/20">
                <Lock className="w-12 h-12 text-rose-blush" strokeWidth={1.5} />
              </div>
            </motion.div>
            <h2 className="text-4xl font-light text-foreground mb-3 tracking-wide">Velvet Rope Entry</h2>
            <p className="text-muted-foreground font-light">Enter your exclusive invite code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="INVITE-CODE"
                className="text-center text-2xl tracking-widest bg-background/50 border-border/50 focus:border-rose-blush text-foreground placeholder:text-muted-foreground rounded-2xl font-light"
                disabled={isValidating}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm mt-2 text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isValidating || inviteCode.length < 6}
              className="w-full bg-gradient-to-r from-rose-blush to-rose-gold text-white hover:shadow-lg hover:shadow-rose-blush/30 font-light py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              {isValidating ? 'Validating...' : 'Enter'}
            </Button>
          </form>

          <p className="text-muted-foreground text-sm text-center mt-8 font-light">
            No invite code? Contact your agent for exclusive access.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function BiometricScan({ onComplete }: { onComplete: () => void }) {
  const [scanning, setScanning] = useState(true)
  const [success, setSuccess] = useState(false)

  useState(() => {
    const timer = setTimeout(() => {
      setScanning(false)
      setSuccess(true)
      soundManager.play('glassTap')
      onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/30 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_oklch(0.85_0.10_340)_0%,_transparent_50%)] opacity-10" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center relative z-10"
      >
        <motion.div
          className="relative w-72 h-72 mx-auto mb-8"
          animate={scanning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-rose-blush/30" />
          <div className="absolute inset-4 rounded-full border-2 border-rose-blush/20" />
          <div className="absolute inset-8 rounded-full border-2 border-rose-blush/10" />
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={success ? { scale: 1.2, opacity: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {success ? (
              <Check className="w-32 h-32 text-rose-blush" strokeWidth={1.5} />
            ) : (
              <Lock className="w-32 h-32 text-rose-blush" strokeWidth={1.5} />
            )}
          </motion.div>

          {scanning && (
            <motion.div
              className="absolute inset-0 border-t-2 border-rose-blush rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            />
          )}
        </motion.div>

        <h3 className="text-3xl font-light text-foreground mb-3 tracking-wide">
          {scanning ? 'Authenticating...' : 'Access Granted'}
        </h3>
        <p className="text-muted-foreground font-light">
          {scanning ? 'Verifying your identity' : 'Welcome to The Sovereign Ecosystem'}
        </p>
      </motion.div>
    </div>
  )
}
