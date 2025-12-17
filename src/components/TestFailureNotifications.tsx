import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RotateCcw, X, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

export interface TestFailure {
  id: string
  testId: string
  testName: string
  category: string
  errorMessage: string
  timestamp: string
  retryCount: number
  maxRetries: number
  stackTrace?: string
  details?: string[]
}

interface TestFailureNotificationsProps {
  failures: TestFailure[]
  onRetry: (failure: TestFailure) => Promise<void>
  onDismiss: (failureId: string) => void
  onRetryAll: () => Promise<void>
  autoRetryEnabled?: boolean
  autoRetryDelay?: number
}

export function TestFailureNotifications({ 
  failures, 
  onRetry, 
  onDismiss,
  onRetryAll,
  autoRetryEnabled = true,
  autoRetryDelay = 3000 
}: TestFailureNotificationsProps) {
  const [expandedFailures, setExpandedFailures] = useState<Set<string>>(new Set())
  const [retryingFailures, setRetryingFailures] = useState<Set<string>>(new Set())
  const [autoRetryTimers, setAutoRetryTimers] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (!autoRetryEnabled) return

    const timers: NodeJS.Timeout[] = []

    failures.forEach(failure => {
      if (failure.retryCount < failure.maxRetries && !retryingFailures.has(failure.id)) {
        const timer = setTimeout(() => {
          handleAutoRetry(failure)
        }, autoRetryDelay)
        
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [failures, autoRetryEnabled, autoRetryDelay])

  useEffect(() => {
    if (!autoRetryEnabled) return

    const interval = setInterval(() => {
      setAutoRetryTimers(prev => {
        const newMap = new Map(prev)
        failures.forEach(failure => {
          if (failure.retryCount < failure.maxRetries && !retryingFailures.has(failure.id)) {
            const currentValue = newMap.get(failure.id) || 0
            if (currentValue < 100) {
              newMap.set(failure.id, currentValue + (100 / (autoRetryDelay / 100)))
            }
          }
        })
        return newMap
      })
    }, 100)

    return () => clearInterval(interval)
  }, [failures, autoRetryEnabled, autoRetryDelay, retryingFailures])

  const handleAutoRetry = async (failure: TestFailure) => {
    if (failure.retryCount >= failure.maxRetries) return
    
    setRetryingFailures(prev => new Set(prev).add(failure.id))
    soundManager.play('glassTap')
    
    toast.info(`Auto-retrying: ${failure.testName}`, {
      description: `Attempt ${failure.retryCount + 1} of ${failure.maxRetries}`
    })

    try {
      await onRetry(failure)
      setAutoRetryTimers(prev => {
        const newMap = new Map(prev)
        newMap.delete(failure.id)
        return newMap
      })
    } finally {
      setRetryingFailures(prev => {
        const newSet = new Set(prev)
        newSet.delete(failure.id)
        return newSet
      })
    }
  }

  const handleManualRetry = async (failure: TestFailure) => {
    setRetryingFailures(prev => new Set(prev).add(failure.id))
    soundManager.play('glassTap')

    try {
      await onRetry(failure)
      soundManager.play('success')
      toast.success('Test retried successfully')
    } catch (error) {
      soundManager.play('error')
      toast.error('Retry failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setRetryingFailures(prev => {
        const newSet = new Set(prev)
        newSet.delete(failure.id)
        return newSet
      })
    }
  }

  const handleRetryAll = async () => {
    soundManager.play('glassTap')
    toast.info('Retrying all failed tests...')

    try {
      await onRetryAll()
      soundManager.play('success')
      toast.success('All tests retried')
    } catch (error) {
      soundManager.play('error')
      toast.error('Some retries failed')
    }
  }

  const toggleExpanded = (failureId: string) => {
    setExpandedFailures(prev => {
      const newSet = new Set(prev)
      if (newSet.has(failureId)) {
        newSet.delete(failureId)
      } else {
        newSet.add(failureId)
      }
      return newSet
    })
    soundManager.play('glassTap')
  }

  const handleDismiss = (failureId: string) => {
    onDismiss(failureId)
    soundManager.play('glassTap')
  }

  if (failures.length === 0) return null

  const retriableFailures = failures.filter(f => f.retryCount < f.maxRetries)
  const permanentFailures = failures.filter(f => f.retryCount >= f.maxRetries)

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md space-y-3">
      <AnimatePresence mode="popLayout">
        {retriableFailures.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 bg-card/95 backdrop-blur-2xl border-orange-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-sm">
                    {retriableFailures.length} tests failed
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRetryAll}
                  className="gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry All
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {failures.map((failure) => {
          const isExpanded = expandedFailures.has(failure.id)
          const isRetrying = retryingFailures.has(failure.id)
          const retryProgress = autoRetryTimers.get(failure.id) || 0
          const canRetry = failure.retryCount < failure.maxRetries

          return (
            <motion.div
              key={failure.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              layout
            >
              <Card className={`p-4 bg-card/95 backdrop-blur-2xl shadow-2xl border-2 transition-all duration-300 ${
                canRetry 
                  ? 'border-orange-500/30 hover:border-orange-500/50' 
                  : 'border-red-500/30 hover:border-red-500/50'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {canRetry ? (
                          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm truncate">
                          {failure.testName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            canRetry 
                              ? 'border-orange-500/30 text-orange-600 dark:text-orange-400' 
                              : 'border-red-500/30 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {failure.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Retry {failure.retryCount}/{failure.maxRetries}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canRetry && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleManualRetry(failure)}
                          disabled={isRetrying}
                          className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                        >
                          <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpanded(failure.id)}
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(failure.id)}
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {failure.errorMessage}
                  </p>

                  {canRetry && autoRetryEnabled && !isRetrying && retryProgress > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Auto-retry in progress...</span>
                        <span>{Math.round(retryProgress)}%</span>
                      </div>
                      <Progress value={retryProgress} className="h-1" />
                    </div>
                  )}

                  {isRetrying && (
                    <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </motion.div>
                      <span>Retrying test...</span>
                    </div>
                  )}

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <Separator className="my-3" />
                        
                        <div className="space-y-3">
                          {failure.details && failure.details.length > 0 && (
                            <div className="space-y-1">
                              <h4 className="text-xs font-medium text-muted-foreground">Details:</h4>
                              <ul className="space-y-1">
                                {failure.details.map((detail, idx) => (
                                  <li key={idx} className="text-xs text-muted-foreground pl-3 border-l-2 border-muted">
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {failure.stackTrace && (
                            <div className="space-y-1">
                              <h4 className="text-xs font-medium text-muted-foreground">Stack Trace:</h4>
                              <pre className="text-[10px] bg-muted/50 p-2 rounded-lg overflow-x-auto text-muted-foreground font-mono">
                                {failure.stackTrace}
                              </pre>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Failed at: {new Date(failure.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {permanentFailures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs text-red-500 dark:text-red-400">
            {permanentFailures.length} test{permanentFailures.length > 1 ? 's' : ''} failed permanently
          </p>
        </motion.div>
      )}
    </div>
  )
}
