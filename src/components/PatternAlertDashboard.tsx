import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  AlertCircle,
  Download,
  Calendar
} from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { usePatternAlerts } from '@/hooks/use-pattern-alerts'
import { AlertPriority, PatternType } from '@/lib/pattern-alerts'

const PatternAlertDashboard = memo(function PatternAlertDashboard() {
  const alerts = usePatternAlerts()
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'all'>('all')
  const [filterPattern, setFilterPattern] = useState<PatternType | 'all'>('all')

  const filteredAlerts = alerts.filter(alert => {
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority
    const matchesPattern = filterPattern === 'all' || alert.pattern === filterPattern
    return matchesPriority && matchesPattern
  })

  const alertsByPriority = {
    critical: alerts.filter(a => a.priority === 'critical').length,
    high: alerts.filter(a => a.priority === 'high').length,
    medium: alerts.filter(a => a.priority === 'medium').length,
    low: alerts.filter(a => a.priority === 'low').length
  }

  const alertsByPattern = alerts.reduce((acc, alert) => {
    acc[alert.pattern] = (acc[alert.pattern] || 0) + 1
    return acc
  }, {} as Record<PatternType, number>)

  const patternIcons: Record<PatternType, React.ReactNode> = {
    surge: <TrendingUp className="w-4 h-4" />,
    crash: <TrendingDown className="w-4 h-4" />,
    oscillation: <Activity className="w-4 h-4" />,
    recovery: <Zap className="w-4 h-4" />,
    steady: <Activity className="w-4 h-4" />,
    breakout: <TrendingUp className="w-4 h-4" />,
    breakdown: <TrendingDown className="w-4 h-4" />,
    consolidation: <Activity className="w-4 h-4" />,
    reversal: <Zap className="w-4 h-4" />
  }

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

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="bg-onyx-surface border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-champagne-gold flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Alert Dashboard
            </h2>
            <p className="text-slate-grey text-sm mt-1">
              Comprehensive volatility pattern tracking
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-red-500/5 border border-red-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-grey uppercase tracking-wider">Critical</span>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{alertsByPriority.critical}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-grey uppercase tracking-wider">High</span>
              <AlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">{alertsByPriority.high}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-grey uppercase tracking-wider">Medium</span>
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{alertsByPriority.medium}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-grey uppercase tracking-wider">Low</span>
              <AlertCircle className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{alertsByPriority.low}</p>
          </motion.div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="all" onClick={() => setFilterPriority('all')}>
              All
            </TabsTrigger>
            <TabsTrigger value="critical" onClick={() => setFilterPriority('critical')}>
              Critical
            </TabsTrigger>
            <TabsTrigger value="high" onClick={() => setFilterPriority('high')}>
              High
            </TabsTrigger>
            <TabsTrigger value="medium" onClick={() => setFilterPriority('medium')}>
              Medium
            </TabsTrigger>
            <TabsTrigger value="low" onClick={() => setFilterPriority('low')}>
              Low
            </TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterPattern === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPattern('all')}
              >
                All Patterns
              </Button>
              {Object.entries(alertsByPattern).map(([pattern]) => (
                <Button
                  key={pattern}
                  variant={filterPattern === pattern ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPattern(pattern as PatternType)}
                  className="gap-2 capitalize"
                >
                  {patternIcons[pattern as PatternType]}
                  {pattern}
                  <Badge variant="secondary" className="ml-1">
                    {alertsByPattern[pattern as PatternType]}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <TabsContent value="all" className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-grey mx-auto mb-3 opacity-50" />
                <p className="text-slate-grey">No alerts match your filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`p-4 rounded-lg border ${
                    alert.isRead
                      ? 'bg-onyx-deep/50 border-border opacity-70'
                      : getPriorityColor(alert.priority)
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {patternIcons[alert.pattern]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold">{alert.title}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(alert.priority)}`}
                          >
                            {alert.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {alert.pattern}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-grey">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-grey mb-1">Confidence</p>
                        <p className="text-sm font-bold text-champagne-gold">
                          {alert.confidence.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {alert.metrics && (
                    <div className="flex gap-4 text-xs pt-3 border-t border-current/20">
                      {alert.metrics.priceChange !== undefined && (
                        <div>
                          <span className="text-slate-grey">Price Change: </span>
                          <span className={`font-semibold ${
                            alert.metrics.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {alert.metrics.priceChange >= 0 ? '+' : ''}
                            {alert.metrics.priceChange.toFixed(2)}%
                          </span>
                        </div>
                      )}
                      {alert.metrics.volatility !== undefined && (
                        <div>
                          <span className="text-slate-grey">Volatility: </span>
                          <span className="font-semibold text-foreground">
                            {alert.metrics.volatility.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {alert.metrics.volume && (
                        <div>
                          <span className="text-slate-grey">Volume: </span>
                          <span className="font-semibold text-foreground">
                            {alert.metrics.volume}
                          </span>
                        </div>
                      )}
                      <div className="ml-auto flex items-center gap-1 text-slate-grey">
                        <Calendar className="w-3 h-3" />
                        {formatTimestamp(alert.timestamp)}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
})

export { PatternAlertDashboard }
