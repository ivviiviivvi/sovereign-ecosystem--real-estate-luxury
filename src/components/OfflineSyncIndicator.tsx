import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, CloudOff, WifiOff, Wifi, RefreshCw, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { offlineSyncService, SyncStatus } from '@/lib/offline-sync-service'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

export function OfflineSyncIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(offlineSyncService.getStatus())
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((status) => {
      setSyncStatus(status)
      
      if (!status.isOnline && status.pendingChanges > 0) {
        toast.warning('You are offline', {
          description: `${status.pendingChanges} changes will sync when reconnected`,
          duration: 3000
        })
      } else if (status.isOnline && status.pendingChanges === 0 && syncStatus.pendingChanges > 0) {
        toast.success('All changes synced', {
          description: 'Your measurements are up to date'
        })
        soundManager.play('success')
      }
    })

    return () => unsubscribe()
  }, [])

  const handleRetry = () => {
    offlineSyncService.retryFailedSyncs()
    soundManager.play('glassTap')
    toast.info('Retrying sync...', {
      description: 'Attempting to sync failed changes'
    })
  }

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <CloudOff className="w-5 h-5 text-destructive" />
    }
    
    if (syncStatus.syncInProgress) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
        </motion.div>
      )
    }

    if (syncStatus.failedSyncs > 0) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }

    if (syncStatus.pendingChanges > 0) {
      return <Clock className="w-5 h-5 text-yellow-500" />
    }

    return <CheckCircle2 className="w-5 h-5 text-green-500" />
  }

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'Offline'
    }
    
    if (syncStatus.syncInProgress) {
      return 'Syncing...'
    }

    if (syncStatus.failedSyncs > 0) {
      return `${syncStatus.failedSyncs} failed`
    }

    if (syncStatus.pendingChanges > 0) {
      return `${syncStatus.pendingChanges} pending`
    }

    return 'Synced'
  }

  const getStatusColor = () => {
    if (!syncStatus.isOnline) {
      return 'bg-destructive/10 border-destructive/30'
    }
    
    if (syncStatus.failedSyncs > 0) {
      return 'bg-yellow-500/10 border-yellow-500/30'
    }

    if (syncStatus.pendingChanges > 0) {
      return 'bg-yellow-500/10 border-yellow-500/30'
    }

    return 'bg-green-500/10 border-green-500/30'
  }

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowDetails(!showDetails)
            soundManager.play('glassTap')
          }}
          className={`gap-2 bg-card/90 backdrop-blur-2xl ${getStatusColor()} transition-all duration-300 hover:scale-105`}
        >
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
          {!syncStatus.isOnline && (
            <WifiOff className="w-4 h-4 text-destructive" />
          )}
          {syncStatus.isOnline && syncStatus.pendingChanges === 0 && (
            <Wifi className="w-4 h-4 text-green-500" />
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-40"
          >
            <Card className="p-4 bg-card/95 backdrop-blur-2xl border-border shadow-2xl w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-foreground">Sync Status</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Connection</span>
                    <Badge variant={syncStatus.isOnline ? 'default' : 'destructive'}>
                      {syncStatus.isOnline ? (
                        <>
                          <Wifi className="w-3 h-3 mr-1" />
                          Online
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3 mr-1" />
                          Offline
                        </>
                      )}
                    </Badge>
                  </div>

                  {syncStatus.syncInProgress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Syncing changes...</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Changes</span>
                    <Badge variant="secondary">
                      {syncStatus.pendingChanges}
                    </Badge>
                  </div>

                  {syncStatus.failedSyncs > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Failed Syncs</span>
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {syncStatus.failedSyncs}
                      </Badge>
                    </div>
                  )}

                  {syncStatus.lastSyncTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync</span>
                      <span className="text-xs text-foreground">
                        {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {syncStatus.failedSyncs > 0 && (
                  <Button
                    onClick={handleRetry}
                    size="sm"
                    className="w-full bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Failed Syncs
                  </Button>
                )}

                {!syncStatus.isOnline && syncStatus.pendingChanges > 0 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground mb-1">
                          Changes Saved Locally
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your measurements are safe and will sync automatically when you're back online.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {syncStatus.isOnline && syncStatus.pendingChanges === 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                      <p className="text-xs text-foreground">
                        All changes synced successfully
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
