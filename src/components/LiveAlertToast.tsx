import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import { usePatternAlerts } from '@/hooks/use-pattern-alerts'
import { PatternAlert } from '@/lib/pattern-alerts'

export function LiveAlertToast() {
  const alerts = usePatternAlerts()
  const [visibleAlert, setVisibleAlert] = useState<PatternAlert | null>(null)
  const [lastAlertId, setLastAlertId] = useState<string | null>(null)

  useEffect(() => {
    if (alerts.length === 0) return

    const latestAlert = alerts[0]
    
    if (
      latestAlert.id !== lastAlertId &&
      !latestAlert.isRead &&
      (latestAlert.priority === 'critical' || latestAlert.priority === 'high')
    ) {
      setVisibleAlert(latestAlert)
      setLastAlertId(latestAlert.id)

      const timer = setTimeout(() => {
        setVisibleAlert(null)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [alerts, lastAlertId])

  const getPriorityStyles = () => {
    if (!visibleAlert) return ''
    
    switch (visibleAlert.priority) {
      case 'critical':
        return 'bg-red-500/10 border-red-500 text-red-400'
      case 'high':
        return 'bg-orange-500/10 border-orange-500 text-orange-400'
      default:
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
    }
  }

  return (
    <AnimatePresence>
      {visibleAlert && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)]"
        >
          <div
            className={`p-4 rounded-lg border-2 backdrop-blur-xl ${getPriorityStyles()} shadow-2xl`}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1">
                  {visibleAlert.title}
                </h3>
                <p className="text-xs text-slate-grey line-clamp-2">
                  {visibleAlert.message}
                </p>
                
                {visibleAlert.metrics && (
                  <div className="flex gap-3 mt-2 text-xs">
                    {visibleAlert.metrics.priceChange !== undefined && (
                      <div>
                        <span className="text-slate-grey">Change: </span>
                        <span className={`font-semibold ${
                          visibleAlert.metrics.priceChange >= 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {visibleAlert.metrics.priceChange >= 0 ? '+' : ''}
                          {visibleAlert.metrics.priceChange.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-grey">Confidence: </span>
                      <span className="font-semibold">
                        {visibleAlert.confidence.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setVisibleAlert(null)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 8, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
