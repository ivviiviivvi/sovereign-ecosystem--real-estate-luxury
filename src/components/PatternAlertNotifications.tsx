import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Trash2, Settings, Filter } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { usePatternAlerts } from '@/hooks/use-pattern-alerts'
import { patternAlertService, AlertPriority } from '@/lib/pattern-alerts'

interface PatternAlertNotificationsProps {
  onOpenSettings?: () => void
}

export function PatternAlertNotifications({ onOpenSettings }: PatternAlertNotificationsProps) {
  const alerts = usePatternAlerts()
  const [isOpen, setIsOpen] = useState(false)
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'all'>('all')

  const unreadCount = alerts.filter(a => !a.isRead).length

  const filteredAlerts = filterPriority === 'all' 
    ? alerts 
    : alerts.filter(a => a.priority === filterPriority)

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    }
  }

  const handleMarkAsRead = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    patternAlertService.markAsRead(alertId)
  }

  const handleDelete = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    patternAlertService.deleteAlert(alertId)
  }

  const handleMarkAllAsRead = () => {
    patternAlertService.markAllAsRead()
  }

  const handleClearAll = () => {
    patternAlertService.clearAllAlerts()
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-onyx-surface"
      >
        <Bell className="w-5 h-5 text-champagne-gold" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-[400px] max-w-[calc(100vw-2rem)]"
            >
              <Card className="bg-onyx-surface border-border shadow-2xl">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-champagne-gold">
                        Pattern Alerts
                      </h3>
                      <p className="text-xs text-slate-grey">
                        {unreadCount} unread
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {onOpenSettings && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onOpenSettings}
                          className="h-8 w-8"
                        >
                          <Settings className="w-4 h-4 text-slate-grey" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4 text-slate-grey" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filterPriority === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterPriority('all')}
                      className="h-7 text-xs"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterPriority === 'critical' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterPriority('critical')}
                      className="h-7 text-xs"
                    >
                      Critical
                    </Button>
                    <Button
                      variant={filterPriority === 'high' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterPriority('high')}
                      className="h-7 text-xs"
                    >
                      High
                    </Button>
                    <Button
                      variant={filterPriority === 'medium' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterPriority('medium')}
                      className="h-7 text-xs"
                    >
                      Medium
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[500px]">
                  {filteredAlerts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-slate-grey mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-slate-grey">
                        No alerts to display
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {filteredAlerts.map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div
                            className={`p-3 mb-2 rounded-lg border transition-all ${
                              alert.isRead
                                ? 'bg-onyx-deep/50 border-border opacity-70'
                                : `${getPriorityColor(alert.priority)}`
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-sm font-bold ${
                                    alert.isRead ? 'text-foreground' : ''
                                  }`}>
                                    {alert.title}
                                  </h4>
                                  {!alert.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-current" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-grey">
                                  {alert.message}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-2">
                                {!alert.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleMarkAsRead(alert.id, e)}
                                    className="h-6 w-6"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleDelete(alert.id, e)}
                                  className="h-6 w-6"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {alert.metrics && (
                              <div className="flex gap-3 text-xs mt-3 pt-3 border-t border-current/20">
                                {alert.metrics.priceChange !== undefined && (
                                  <div>
                                    <span className="text-slate-grey">Change: </span>
                                    <span className={`font-semibold ${
                                      alert.metrics.priceChange >= 0 
                                        ? 'text-green-400' 
                                        : 'text-red-400'
                                    }`}>
                                      {alert.metrics.priceChange >= 0 ? '+' : ''}
                                      {alert.metrics.priceChange.toFixed(2)}%
                                    </span>
                                  </div>
                                )}
                                {alert.metrics.volatility !== undefined && (
                                  <div>
                                    <span className="text-slate-grey">Vol: </span>
                                    <span className="font-semibold">
                                      {alert.metrics.volatility.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                {alert.metrics.volume && (
                                  <div>
                                    <span className="text-slate-grey">Volume: </span>
                                    <span className="font-semibold">
                                      {alert.metrics.volume}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {alert.pattern}
                              </Badge>
                              <span className="text-xs text-slate-grey">
                                {formatTimestamp(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {alerts.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark All Read
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
