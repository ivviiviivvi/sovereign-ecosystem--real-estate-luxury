import { PatternAlert, AlertPriority } from './pattern-alerts'

export type { AlertPriority }

export type DeliveryChannel = 'email' | 'sms' | 'in-app'

export interface NotificationPreferences {
  email: {
    enabled: boolean
    address: string
    priorities: AlertPriority[]
  }
  sms: {
    enabled: boolean
    phoneNumber: string
    priorities: AlertPriority[]
  }
}

export interface DeliveryLog {
  id: string
  alertId: string
  channel: DeliveryChannel
  destination: string
  timestamp: number
  status: 'pending' | 'sent' | 'failed'
  errorMessage?: string
}

class NotificationDeliveryService {
  private preferences: NotificationPreferences = {
    email: {
      enabled: false,
      address: '',
      priorities: ['critical', 'high']
    },
    sms: {
      enabled: false,
      phoneNumber: '',
      priorities: ['critical']
    }
  }

  private deliveryLogs: DeliveryLog[] = []
  private deliverySubscribers: Set<(logs: DeliveryLog[]) => void> = new Set()
  private preferencesSubscribers: Set<(prefs: NotificationPreferences) => void> = new Set()

  async deliverAlert(alert: PatternAlert): Promise<DeliveryLog[]> {
    const logs: DeliveryLog[] = []

    if (this.preferences.email.enabled && 
        this.preferences.email.address &&
        this.preferences.email.priorities.includes(alert.priority)) {
      const log = await this.sendEmail(alert)
      logs.push(log)
    }

    if (this.preferences.sms.enabled && 
        this.preferences.sms.phoneNumber &&
        this.preferences.sms.priorities.includes(alert.priority)) {
      const log = await this.sendSMS(alert)
      logs.push(log)
    }

    if (logs.length > 0) {
      this.deliveryLogs.unshift(...logs)
      
      if (this.deliveryLogs.length > 100) {
        this.deliveryLogs = this.deliveryLogs.slice(0, 100)
      }

      this.notifyDeliverySubscribers()
    }

    return logs
  }

  private async sendEmail(alert: PatternAlert): Promise<DeliveryLog> {
    const log: DeliveryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alertId: alert.id,
      channel: 'email',
      destination: this.obfuscateEmail(this.preferences.email.address),
      timestamp: Date.now(),
      status: 'pending'
    }

    try {
      const emailBody = this.formatEmailBody(alert)
      const subject = `${this.getPriorityEmoji(alert.priority)} ${alert.title}`

      const promptText = `You are simulating an email delivery service. Generate a realistic delivery confirmation message for an email with:
Subject: ${subject}
To: ${this.preferences.email.address}
Body Preview: ${emailBody.substring(0, 100)}

Return a JSON object with:
{
  "messageId": "a unique message ID",
  "status": "sent",
  "timestamp": "${new Date().toISOString()}"
}`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const result = JSON.parse(response)

      log.status = 'sent'
    } catch (error) {
      log.status = 'failed'
      log.errorMessage = error instanceof Error ? error.message : 'Unknown error'
    }

    return log
  }

  private async sendSMS(alert: PatternAlert): Promise<DeliveryLog> {
    const log: DeliveryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alertId: alert.id,
      channel: 'sms',
      destination: this.obfuscatePhone(this.preferences.sms.phoneNumber),
      timestamp: Date.now(),
      status: 'pending'
    }

    try {
      const smsBody = this.formatSMSBody(alert)

      const promptText = `You are simulating an SMS delivery service. Generate a realistic delivery confirmation for an SMS message:
To: ${this.preferences.sms.phoneNumber}
Message: ${smsBody}

Return a JSON object with:
{
  "messageId": "a unique SMS message ID",
  "status": "sent",
  "timestamp": "${new Date().toISOString()}"
}`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const result = JSON.parse(response)

      log.status = 'sent'
    } catch (error) {
      log.status = 'failed'
      log.errorMessage = error instanceof Error ? error.message : 'Unknown error'
    }

    return log
  }

  private formatEmailBody(alert: PatternAlert): string {
    return `
${alert.title}

${alert.message}

Pattern Details:
- Type: ${alert.pattern}
- Priority: ${alert.priority.toUpperCase()}
- Confidence: ${alert.confidence.toFixed(0)}%
- Time: ${new Date(alert.timestamp).toLocaleString()}

${alert.metrics ? `
Market Metrics:
${alert.metrics.priceChange !== undefined ? `- Price Change: ${alert.metrics.priceChange >= 0 ? '+' : ''}${alert.metrics.priceChange.toFixed(2)}%` : ''}
${alert.metrics.volatility !== undefined ? `- Volatility: ${alert.metrics.volatility.toFixed(2)}` : ''}
${alert.metrics.volume ? `- Volume: ${alert.metrics.volume}` : ''}
` : ''}

This is an automated alert from The Sovereign Ecosystem.
    `.trim()
  }

  private formatSMSBody(alert: PatternAlert): string {
    const emoji = this.getPriorityEmoji(alert.priority)
    const change = alert.metrics?.priceChange 
      ? ` ${alert.metrics.priceChange >= 0 ? '+' : ''}${alert.metrics.priceChange.toFixed(1)}%`
      : ''
    
    return `${emoji} ${alert.title}${change} - ${alert.pattern} pattern detected (${alert.confidence.toFixed(0)}% confidence)`
  }

  private getPriorityEmoji(priority: AlertPriority): string {
    switch (priority) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '📊'
      case 'low': return 'ℹ️'
    }
  }

  private obfuscateEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!domain) return email
    const visibleChars = Math.min(3, Math.floor(local.length / 2))
    return `${local.substring(0, visibleChars)}***@${domain}`
  }

  private obfuscatePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 4) return '***'
    return `***-***-${digits.slice(-4)}`
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  updatePreferences(updates: Partial<NotificationPreferences>) {
    this.preferences = {
      email: { ...this.preferences.email, ...updates.email },
      sms: { ...this.preferences.sms, ...updates.sms }
    }
    this.notifyPreferencesSubscribers()
  }

  getDeliveryLogs(): DeliveryLog[] {
    return this.deliveryLogs
  }

  clearDeliveryLogs() {
    this.deliveryLogs = []
    this.notifyDeliverySubscribers()
  }

  subscribePreferences(callback: (prefs: NotificationPreferences) => void) {
    this.preferencesSubscribers.add(callback)
    callback(this.preferences)

    return () => {
      this.preferencesSubscribers.delete(callback)
    }
  }

  subscribeDeliveryLogs(callback: (logs: DeliveryLog[]) => void) {
    this.deliverySubscribers.add(callback)
    callback(this.deliveryLogs)

    return () => {
      this.deliverySubscribers.delete(callback)
    }
  }

  private notifyPreferencesSubscribers() {
    this.preferencesSubscribers.forEach(callback => callback(this.preferences))
  }

  private notifyDeliverySubscribers() {
    this.deliverySubscribers.forEach(callback => callback(this.deliveryLogs))
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validatePhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 15
  }
}

export const notificationDeliveryService = new NotificationDeliveryService()
