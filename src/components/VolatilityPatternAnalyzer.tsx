import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, Zap, AlertCircle } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { useMarketTickers } from '@/hooks/use-market-data'
import { patternAlertService, PatternType, VolatilityPattern as AlertPattern } from '@/lib/pattern-alerts'

interface VolatilityPattern {
  type: PatternType
  confidence: number
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface PatternHistory {
  timestamp: number
  pattern: VolatilityPattern
  values: number[]
}

export function VolatilityPatternAnalyzer() {
  const tickers = useMarketTickers()
  const [currentPattern, setCurrentPattern] = useState<VolatilityPattern | null>(null)
  const [patternHistory, setPatternHistory] = useState<PatternHistory[]>([])
  const [recentValues, setRecentValues] = useState<number[]>([])

  const calculateVolatility = useCallback((values: number[]): number => {
    if (values.length < 2) return 0
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length

    return Math.sqrt(variance)
  }, [])

  const detectPattern = useCallback((values: number[]): VolatilityPattern | null => {
    if (values.length < 10) return null

    const recent = values.slice(-5)
    const previous = values.slice(-10, -5)
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length
    const previousAvg = previous.reduce((sum, v) => sum + v, 0) / previous.length
    
    const recentVolatility = calculateVolatility(recent)
    const previousVolatility = calculateVolatility(previous)
    
    const trend = recentAvg - previousAvg
    const volatilityChange = recentVolatility - previousVolatility

    const recentMin = Math.min(...recent)
    const recentMax = Math.max(...recent)
    const range = recentMax - recentMin
    
    const isBreakout = recentAvg > previousAvg + 3 && recentVolatility > 2
    const isBreakdown = recentAvg < previousAvg - 3 && recentVolatility > 2
    const isConsolidation = range < 1.5 && recentVolatility < 1
    
    const isReversal = previousAvg < 96 && recentAvg > 99 && trend > 2

    if (isBreakout) {
      return {
        type: 'breakout',
        confidence: Math.min(95, 75 + Math.abs(trend) * 4),
        description: 'Price breaking above resistance levels',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30'
      }
    }
    
    if (isBreakdown) {
      return {
        type: 'breakdown',
        confidence: Math.min(95, 75 + Math.abs(trend) * 4),
        description: 'Price breaking below support levels',
        icon: <TrendingDown className="w-4 h-4" />,
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10 border-rose-500/30'
      }
    }
    
    if (isReversal) {
      return {
        type: 'reversal',
        confidence: Math.min(90, 70 + Math.abs(trend) * 3),
        description: 'Potential trend reversal forming',
        icon: <Zap className="w-4 h-4" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10 border-purple-500/30'
      }
    }
    
    if (trend > 2 && recentVolatility < 2) {
      return {
        type: 'surge',
        confidence: Math.min(95, 70 + Math.abs(trend) * 5),
        description: 'Strong upward momentum detected',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/30'
      }
    }
    
    if (trend < -2 && recentVolatility < 2) {
      return {
        type: 'crash',
        confidence: Math.min(95, 70 + Math.abs(trend) * 5),
        description: 'Sharp downward movement detected',
        icon: <TrendingDown className="w-4 h-4" />,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30'
      }
    }
    
    if (recentVolatility > 3 && volatilityChange > 1) {
      return {
        type: 'oscillation',
        confidence: Math.min(90, 60 + recentVolatility * 8),
        description: 'High volatility and price swings',
        icon: <Activity className="w-4 h-4" />,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/30'
      }
    }
    
    if (previousAvg < 95 && recentAvg > 98 && trend > 0) {
      return {
        type: 'recovery',
        confidence: Math.min(85, 65 + Math.abs(trend) * 4),
        description: 'Recovery from previous decline',
        icon: <Zap className="w-4 h-4" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/30'
      }
    }
    
    if (isConsolidation) {
      return {
        type: 'consolidation',
        confidence: 80,
        description: 'Market consolidating in narrow range',
        icon: <Activity className="w-4 h-4" />,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10 border-cyan-500/30'
      }
    }
    
    if (recentVolatility < 1 && Math.abs(trend) < 0.5) {
      return {
        type: 'steady',
        confidence: 75,
        description: 'Stable market conditions',
        icon: <Activity className="w-4 h-4" />,
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/10 border-slate-500/30'
      }
    }

    return null
  }, [calculateVolatility])

  useEffect(() => {
    if (tickers.length === 0) return

    const avgValue = tickers.reduce((sum, t) => sum + t.value, 0) / tickers.length
    
    setRecentValues(prev => {
      const updated = [...prev, avgValue].slice(-20)

      if (updated.length >= 10) {
        const pattern = detectPattern(updated)
        setCurrentPattern(pattern)

        if (pattern) {
          const recentVolatility = calculateVolatility(updated.slice(-5))
          const recent = updated.slice(-5)
          const previous = updated.slice(-10, -5)
          const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length
          const previousAvg = previous.reduce((sum, v) => sum + v, 0) / previous.length
          const trend = recentAvg - previousAvg

          const alertPattern: AlertPattern = {
            type: pattern.type,
            confidence: pattern.confidence,
            description: pattern.description,
            metrics: {
              trend,
              volatility: recentVolatility,
              velocity: trend
            }
          }

          patternAlertService.addAlert(alertPattern)

          setPatternHistory(prevHistory => {
            const newEntry: PatternHistory = {
              timestamp: Date.now(),
              pattern,
              values: [...updated]
            }

            const filtered = prevHistory.filter(
              h => Date.now() - h.timestamp < 5 * 60 * 1000
            )

            if (filtered.length === 0 || filtered[filtered.length - 1].pattern.type !== pattern.type) {
              return [...filtered, newEntry]
            }

            return filtered
          })
        }
      }

      return updated
    })
  }, [tickers, detectPattern, calculateVolatility])

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ago`
  }

  return (
    <Card className="bg-onyx-surface border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-champagne-gold/10 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-champagne-gold" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-champagne-gold">Pattern Analysis</h3>
          <p className="text-xs text-slate-grey">Real-time volatility detection</p>
        </div>
      </div>

      {currentPattern ? (
        <motion.div
          key={currentPattern.type}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-lg border p-4 mb-6 ${currentPattern.bgColor}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={currentPattern.color}>
                {currentPattern.icon}
              </div>
              <div>
                <h4 className={`text-sm font-bold capitalize ${currentPattern.color}`}>
                  {currentPattern.type} Pattern
                </h4>
                <p className="text-xs text-slate-grey mt-1">
                  {currentPattern.description}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${currentPattern.bgColor} ${currentPattern.color} border-current`}
            >
              {currentPattern.confidence.toFixed(0)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 h-1 bg-onyx-deep rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${currentPattern.color.replace('text-', 'bg-')}`}
                initial={{ width: 0 }}
                animate={{ width: `${currentPattern.confidence}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-slate-grey">Confidence</span>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-lg border border-border p-4 mb-6 text-center">
          <p className="text-sm text-slate-grey">
            Collecting data to identify patterns...
          </p>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Recent Patterns</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {patternHistory.length === 0 ? (
            <p className="text-xs text-slate-grey text-center py-4">
              No patterns detected yet
            </p>
          ) : (
            patternHistory.slice().reverse().map((entry, idx) => (
              <motion.div
                key={entry.timestamp}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-onyx-deep border border-border hover:border-champagne-gold/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={entry.pattern.color}>
                    {entry.pattern.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold capitalize ${entry.pattern.color}`}>
                      {entry.pattern.type}
                    </p>
                    <p className="text-xs text-slate-grey">
                      {entry.pattern.confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-grey">
                  {formatTime(entry.timestamp)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-grey text-xs uppercase tracking-wider mb-1">
              Patterns Today
            </p>
            <p className="text-champagne-gold font-semibold">
              {patternHistory.length}
            </p>
          </div>
          <div>
            <p className="text-slate-grey text-xs uppercase tracking-wider mb-1">
              Current Volatility
            </p>
            <p className="text-champagne-gold font-semibold">
              {recentValues.length > 0 ? calculateVolatility(recentValues).toFixed(2) : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-grey text-xs uppercase tracking-wider mb-1">
              Avg Change
            </p>
            <p className={`font-semibold ${
              tickers.length > 0 && tickers[0].changePercent >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {tickers.length > 0 
                ? `${tickers[0].changePercent >= 0 ? '+' : ''}${tickers[0].changePercent.toFixed(2)}%`
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
