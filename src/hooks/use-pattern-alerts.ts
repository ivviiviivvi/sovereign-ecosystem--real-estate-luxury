import { useEffect, useState } from 'react'
import { patternAlertService, PatternAlert, AlertRule } from '@/lib/pattern-alerts'

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
