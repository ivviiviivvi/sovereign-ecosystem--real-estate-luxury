import { soundManager } from './sound-manager'
import { notificationDeliveryService } from './notification-delivery'

export type PatternType = 
  | 'surge' 
  | 'crash' 
  | 'oscillation' 
  | 'steady' 
  | 'recovery'
  | 'breakout'
  | 'breakdown'
  | 'consolidation'
  | 'reversal'

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low'

export interface PatternAlert {
  id: string
  pattern: PatternType
  priority: AlertPriority
  title: string
  message: string
  timestamp: number
  confidence: number
  metrics?: {
    priceChange?: number
    volatility?: number
    volume?: string
    duration?: string
  }
  isRead: boolean
  soundPlayed: boolean
}

export interface AlertRule {
  id: string
  name: string
  patterns: PatternType[]
  minConfidence: number
  enabled: boolean
  soundEnabled: boolean
  priority: AlertPriority
}

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'flash-crash',
    name: 'Flash Crash Alert',
    patterns: ['crash', 'breakdown'],
    minConfidence: 80,
    enabled: true,
    soundEnabled: true,
    priority: 'critical'
  },
  {
    id: 'bull-surge',
    name: 'Bull Surge',
    patterns: ['surge', 'breakout'],
    minConfidence: 75,
    enabled: true,
    soundEnabled: true,
    priority: 'high'
  },
  {
    id: 'high-volatility',
    name: 'High Volatility',
    patterns: ['oscillation'],
    minConfidence: 70,
    enabled: true,
    soundEnabled: false,
    priority: 'medium'
  },
  {
    id: 'market-recovery',
    name: 'Market Recovery',
    patterns: ['recovery', 'reversal'],
    minConfidence: 70,
    enabled: true,
    soundEnabled: true,
    priority: 'medium'
  },
  {
    id: 'consolidation',
    name: 'Consolidation Phase',
    patterns: ['consolidation', 'steady'],
    minConfidence: 65,
    enabled: false,
    soundEnabled: false,
    priority: 'low'
  }
]

export interface VolatilityPattern {
  type: PatternType
  confidence: number
  description: string
  metrics: {
    trend: number
    volatility: number
    velocity: number
  }
}

class PatternAlertService {
  private alerts: PatternAlert[] = []
  private alertSubscribers: Set<(alerts: PatternAlert[]) => void> = new Set()
  private alertRules: AlertRule[] = [...DEFAULT_ALERT_RULES]
  private ruleSubscribers: Set<(rules: AlertRule[]) => void> = new Set()
  private lastAlertTime: Map<PatternType, number> = new Map()
  private alertCooldown = 30000

  addAlert(pattern: VolatilityPattern): PatternAlert | null {
    const matchingRules = this.alertRules.filter(
      rule => 
        rule.enabled && 
        rule.patterns.includes(pattern.type) &&
        pattern.confidence >= rule.minConfidence
    )

    if (matchingRules.length === 0) return null

    const lastAlert = this.lastAlertTime.get(pattern.type)
    if (lastAlert && Date.now() - lastAlert < this.alertCooldown) {
      return null
    }

    const highestPriorityRule = matchingRules.reduce((prev, curr) => {
      const priorityOrder: AlertPriority[] = ['critical', 'high', 'medium', 'low']
      return priorityOrder.indexOf(curr.priority) < priorityOrder.indexOf(prev.priority) 
        ? curr 
        : prev
    })

    const alert: PatternAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pattern: pattern.type,
      priority: highestPriorityRule.priority,
      title: this.getAlertTitle(pattern.type, highestPriorityRule.priority),
      message: this.getAlertMessage(pattern),
      timestamp: Date.now(),
      confidence: pattern.confidence,
      metrics: {
        priceChange: pattern.metrics.trend,
        volatility: pattern.metrics.volatility,
        volume: this.getVolumeDescription(pattern.metrics.velocity),
        duration: 'Real-time'
      },
      isRead: false,
      soundPlayed: false
    }

    this.alerts.unshift(alert)
    
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50)
    }

    this.lastAlertTime.set(pattern.type, Date.now())

    if (highestPriorityRule.soundEnabled) {
      this.playAlertSound(highestPriorityRule.priority)
      alert.soundPlayed = true
    }

    this.notifyAlertSubscribers()

    notificationDeliveryService.deliverAlert(alert).catch(err => {
      console.error('Failed to deliver external notification:', err)
    })

    return alert
  }

  private getAlertTitle(pattern: PatternType, priority: AlertPriority): string {
    const titles: Record<PatternType, Record<AlertPriority, string>> = {
      crash: {
        critical: '⚠️ FLASH CRASH DETECTED',
        high: '⚠️ Sharp Decline Alert',
        medium: 'Downward Movement',
        low: 'Price Drop'
      },
      surge: {
        critical: '🚀 EXPLOSIVE RALLY',
        high: '🚀 Strong Upward Surge',
        medium: 'Upward Movement',
        low: 'Price Gain'
      },
      oscillation: {
        critical: '⚡ EXTREME VOLATILITY',
        high: '⚡ High Volatility Alert',
        medium: 'Increased Volatility',
        low: 'Price Swings'
      },
      recovery: {
        critical: '📈 MAJOR RECOVERY',
        high: '📈 Recovery Confirmed',
        medium: 'Recovery Pattern',
        low: 'Recovery Detected'
      },
      steady: {
        critical: '🔒 Stabilizing',
        high: '🔒 Market Steady',
        medium: 'Stable Conditions',
        low: 'Low Volatility'
      },
      breakout: {
        critical: '💥 BREAKOUT CONFIRMED',
        high: '💥 Breakout Alert',
        medium: 'Breakout Pattern',
        low: 'Potential Breakout'
      },
      breakdown: {
        critical: '📉 BREAKDOWN ALERT',
        high: '📉 Support Broken',
        medium: 'Breakdown Pattern',
        low: 'Potential Breakdown'
      },
      consolidation: {
        critical: '⏸️ Consolidation',
        high: '⏸️ Market Consolidating',
        medium: 'Consolidation Phase',
        low: 'Sideways Movement'
      },
      reversal: {
        critical: '🔄 TREND REVERSAL',
        high: '🔄 Reversal Detected',
        medium: 'Reversal Pattern',
        low: 'Potential Reversal'
      }
    }

    return titles[pattern][priority]
  }

  private getAlertMessage(pattern: VolatilityPattern): string {
    const messages: Record<PatternType, string> = {
      crash: `Market experiencing rapid decline with ${pattern.confidence.toFixed(0)}% confidence. Immediate attention recommended.`,
      surge: `Strong upward momentum detected with ${pattern.confidence.toFixed(0)}% confidence. Consider reviewing positions.`,
      oscillation: `High volatility detected with significant price swings. ${pattern.confidence.toFixed(0)}% confidence.`,
      recovery: `Market showing signs of recovery from previous decline. ${pattern.confidence.toFixed(0)}% confidence.`,
      steady: `Market conditions stabilizing with low volatility. ${pattern.confidence.toFixed(0)}% confidence.`,
      breakout: `Price breaking above resistance levels. ${pattern.confidence.toFixed(0)}% confidence.`,
      breakdown: `Price breaking below support levels. ${pattern.confidence.toFixed(0)}% confidence.`,
      consolidation: `Market consolidating in a narrow range. ${pattern.confidence.toFixed(0)}% confidence.`,
      reversal: `Potential trend reversal pattern forming. ${pattern.confidence.toFixed(0)}% confidence.`
    }

    return messages[pattern.type]
  }

  private getVolumeDescription(velocity: number): string {
    const absVelocity = Math.abs(velocity)
    if (absVelocity > 5) return 'Extreme'
    if (absVelocity > 3) return 'High'
    if (absVelocity > 1) return 'Moderate'
    return 'Low'
  }

  private playAlertSound(priority: AlertPriority) {
    switch (priority) {
      case 'critical':
        soundManager.play('propertyAlert')
        setTimeout(() => soundManager.play('propertyAlert'), 200)
        break
      case 'high':
        soundManager.play('propertyAlert')
        break
      case 'medium':
        soundManager.play('glassTap')
        break
      case 'low':
        soundManager.play('glassTap')
        break
    }
  }

  markAsRead(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.isRead = true
      this.notifyAlertSubscribers()
    }
  }

  markAllAsRead() {
    this.alerts.forEach(alert => {
      alert.isRead = true
    })
    this.notifyAlertSubscribers()
  }

  deleteAlert(alertId: string) {
    this.alerts = this.alerts.filter(a => a.id !== alertId)
    this.notifyAlertSubscribers()
  }

  clearAllAlerts() {
    this.alerts = []
    this.notifyAlertSubscribers()
  }

  getAlerts(): PatternAlert[] {
    return this.alerts
  }

  getUnreadCount(): number {
    return this.alerts.filter(a => !a.isRead).length
  }

  subscribeAlerts(callback: (alerts: PatternAlert[]) => void) {
    this.alertSubscribers.add(callback)
    callback(this.alerts)

    return () => {
      this.alertSubscribers.delete(callback)
    }
  }

  private notifyAlertSubscribers() {
    this.alertSubscribers.forEach(callback => callback(this.alerts))
  }

  getAlertRules(): AlertRule[] {
    return this.alertRules
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>) {
    const ruleIndex = this.alertRules.findIndex(r => r.id === ruleId)
    if (ruleIndex !== -1) {
      this.alertRules[ruleIndex] = {
        ...this.alertRules[ruleIndex],
        ...updates
      }
      this.notifyRuleSubscribers()
    }
  }

  subscribeRules(callback: (rules: AlertRule[]) => void) {
    this.ruleSubscribers.add(callback)
    callback(this.alertRules)

    return () => {
      this.ruleSubscribers.delete(callback)
    }
  }

  private notifyRuleSubscribers() {
    this.ruleSubscribers.forEach(callback => callback(this.alertRules))
  }

  resetRulesToDefault() {
    this.alertRules = [...DEFAULT_ALERT_RULES]
    this.notifyRuleSubscribers()
  }
}

export const patternAlertService = new PatternAlertService()
