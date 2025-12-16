import { useEffect, useState } from 'react'
import { patternAlertService, PatternAlert, AlertRule } from '@/lib/pattern-alerts'
import { notificationDeliveryService, NotificationPreferences, DeliveryLog } from '@/lib/notification-delivery'

export function usePatternAlerts() {
  const [alerts, setAlerts] = useState<PatternAlert[]>(
    patternAlertService.getAlerts()
  )

  useEffect(() => {
    const unsubscribe = patternAlertService.subscribeAlerts(setAlerts)
    return unsubscribe
  }, [])

  return alerts
}

export function useAlertRules() {
  const [rules, setRules] = useState<AlertRule[]>(
    patternAlertService.getAlertRules()
  )

  useEffect(() => {
    const unsubscribe = patternAlertService.subscribeRules(setRules)
    return unsubscribe
  }, [])

  return rules
}

export function useUnreadAlertCount() {
  const alerts = usePatternAlerts()
  return alerts.filter(a => !a.isRead).length
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationDeliveryService.getPreferences()
  )

  useEffect(() => {
    const unsubscribe = notificationDeliveryService.subscribePreferences(setPreferences)
    return unsubscribe
  }, [])

  return preferences
}

export function useDeliveryLogs() {
  const [logs, setLogs] = useState<DeliveryLog[]>(
    notificationDeliveryService.getDeliveryLogs()
  )

  useEffect(() => {
    const unsubscribe = notificationDeliveryService.subscribeDeliveryLogs(setLogs)
    return unsubscribe
  }, [])

  return logs
}
