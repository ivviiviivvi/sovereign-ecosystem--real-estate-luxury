import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Send, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { notificationDeliveryService, NotificationPreferences, DeliveryLog, AlertPriority } from '@/lib/notification-delivery'
import { toast } from 'sonner'

interface NotificationDeliverySettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationDeliverySettings({ open, onOpenChange }: NotificationDeliverySettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationDeliveryService.getPreferences()
  )
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>(
    notificationDeliveryService.getDeliveryLogs()
  )
  const [emailInput, setEmailInput] = useState(preferences.email.address)
  const [phoneInput, setPhoneInput] = useState(preferences.sms.phoneNumber)
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  useEffect(() => {
    const unsubPrefs = notificationDeliveryService.subscribePreferences(setPreferences)
    const unsubLogs = notificationDeliveryService.subscribeDeliveryLogs(setDeliveryLogs)

    return () => {
      unsubPrefs()
      unsubLogs()
    }
  }, [])

  useEffect(() => {
    setEmailInput(preferences.email.address)
    setPhoneInput(preferences.sms.phoneNumber)
  }, [preferences])

  const handleEmailToggle = (enabled: boolean) => {
    if (enabled && !notificationDeliveryService.validateEmail(emailInput)) {
      setEmailError('Please enter a valid email address')
      return
    }

    notificationDeliveryService.updatePreferences({
      email: {
        ...preferences.email,
        enabled,
        address: emailInput
      }
    })

    toast.success(enabled ? 'Email notifications enabled' : 'Email notifications disabled')
  }

  const handleSMSToggle = (enabled: boolean) => {
    if (enabled && !notificationDeliveryService.validatePhone(phoneInput)) {
      setPhoneError('Please enter a valid phone number')
      return
    }

    notificationDeliveryService.updatePreferences({
      sms: {
        ...preferences.sms,
        enabled,
        phoneNumber: phoneInput
      }
    })

    toast.success(enabled ? 'SMS notifications enabled' : 'SMS notifications disabled')
  }

  const handleEmailPriorityToggle = (priority: AlertPriority) => {
    const currentPriorities = preferences.email.priorities
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority]

    notificationDeliveryService.updatePreferences({
      email: {
        ...preferences.email,
        priorities: newPriorities
      }
    })
  }

  const handleSMSPriorityToggle = (priority: AlertPriority) => {
    const currentPriorities = preferences.sms.priorities
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority]

    notificationDeliveryService.updatePreferences({
      sms: {
        ...preferences.sms,
        priorities: newPriorities
      }
    })
  }

  const handleEmailChange = (value: string) => {
    setEmailInput(value)
    setEmailError('')
    
    if (value && !notificationDeliveryService.validateEmail(value)) {
      setEmailError('Invalid email format')
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhoneInput(value)
    setPhoneError('')
    
    if (value && !notificationDeliveryService.validatePhone(value)) {
      setPhoneError('Invalid phone number')
    }
  }

  const handleSaveEmail = () => {
    if (!notificationDeliveryService.validateEmail(emailInput)) {
      setEmailError('Please enter a valid email address')
      return
    }

    notificationDeliveryService.updatePreferences({
      email: {
        ...preferences.email,
        address: emailInput
      }
    })

    toast.success('Email address saved')
  }

  const handleSavePhone = () => {
    if (!notificationDeliveryService.validatePhone(phoneInput)) {
      setPhoneError('Please enter a valid phone number')
      return
    }

    notificationDeliveryService.updatePreferences({
      sms: {
        ...preferences.sms,
        phoneNumber: phoneInput
      }
    })

    toast.success('Phone number saved')
  }

  const handleClearLogs = () => {
    notificationDeliveryService.clearDeliveryLogs()
    toast.success('Delivery logs cleared')
  }

  const getStatusIcon = (status: DeliveryLog['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: DeliveryLog['status']) => {
    switch (status) {
      case 'sent':
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const priorities: AlertPriority[] = ['critical', 'high', 'medium', 'low']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-onyx-surface border-border max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-champagne-gold flex items-center gap-2">
            <Send className="w-5 h-5" />
            Notification Delivery Settings
          </DialogTitle>
          <DialogDescription className="text-slate-grey">
            Configure email and SMS delivery for critical market alerts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <Card className="p-6 bg-onyx-deep border-border">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-champagne-gold" />
              <h3 className="text-lg font-bold text-foreground">Email Notifications</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm text-slate-grey mb-2 block">
                  Email Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="you@example.com"
                    className={`flex-1 ${emailError ? 'border-red-500' : ''}`}
                    disabled={preferences.email.enabled}
                  />
                  {!preferences.email.enabled && (
                    <Button
                      onClick={handleSaveEmail}
                      disabled={!!emailError || !emailInput}
                      size="sm"
                    >
                      Save
                    </Button>
                  )}
                </div>
                {emailError && (
                  <p className="text-xs text-red-400 mt-1">{emailError}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-foreground">Enable Email Alerts</Label>
                  <p className="text-xs text-slate-grey mt-1">
                    Receive critical alerts via email
                  </p>
                </div>
                <Switch
                  checked={preferences.email.enabled}
                  onCheckedChange={handleEmailToggle}
                  disabled={!emailInput}
                />
              </div>

              {preferences.email.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 border-t border-border"
                >
                  <Label className="text-sm text-slate-grey mb-3 block">
                    Alert Priorities to Deliver
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {priorities.map((priority) => (
                      <Button
                        key={priority}
                        variant={preferences.email.priorities.includes(priority) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEmailPriorityToggle(priority)}
                        className="capitalize"
                      >
                        {priority}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-onyx-deep border-border">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-champagne-gold" />
              <h3 className="text-lg font-bold text-foreground">SMS Notifications</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm text-slate-grey mb-2 block">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={`flex-1 ${phoneError ? 'border-red-500' : ''}`}
                    disabled={preferences.sms.enabled}
                  />
                  {!preferences.sms.enabled && (
                    <Button
                      onClick={handleSavePhone}
                      disabled={!!phoneError || !phoneInput}
                      size="sm"
                    >
                      Save
                    </Button>
                  )}
                </div>
                {phoneError && (
                  <p className="text-xs text-red-400 mt-1">{phoneError}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-foreground">Enable SMS Alerts</Label>
                  <p className="text-xs text-slate-grey mt-1">
                    Receive critical alerts via text message
                  </p>
                </div>
                <Switch
                  checked={preferences.sms.enabled}
                  onCheckedChange={handleSMSToggle}
                  disabled={!phoneInput}
                />
              </div>

              {preferences.sms.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 border-t border-border"
                >
                  <Label className="text-sm text-slate-grey mb-3 block">
                    Alert Priorities to Deliver
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {priorities.map((priority) => (
                      <Button
                        key={priority}
                        variant={preferences.sms.priorities.includes(priority) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSMSPriorityToggle(priority)}
                        className="capitalize"
                      >
                        {priority}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Delivery History</h3>
                <p className="text-xs text-slate-grey">
                  Recent notification delivery logs
                </p>
              </div>
              {deliveryLogs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearLogs}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Logs
                </Button>
              )}
            </div>

            {deliveryLogs.length === 0 ? (
              <Card className="p-8 bg-onyx-deep border-border">
                <div className="text-center">
                  <Send className="w-12 h-12 text-slate-grey mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-slate-grey">
                    No delivery logs yet
                  </p>
                </div>
              </Card>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {deliveryLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 bg-onyx-deep border-border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {log.channel === 'email' ? (
                                <Mail className="w-4 h-4 text-champagne-gold" />
                              ) : (
                                <MessageSquare className="w-4 h-4 text-champagne-gold" />
                              )}
                              <span className="text-sm font-semibold text-foreground capitalize">
                                {log.channel}
                              </span>
                              {getStatusIcon(log.status)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-slate-grey">
                                To: <span className="text-foreground">{log.destination}</span>
                              </p>
                              <p className="text-xs text-slate-grey">
                                {formatTimestamp(log.timestamp)}
                              </p>
                              {log.errorMessage && (
                                <p className="text-xs text-red-400 mt-2">
                                  Error: {log.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`capitalize ${getStatusColor(log.status)}`}
                          >
                            {log.status}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Card className="p-4 bg-onyx-deep border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Important Information
            </h4>
            <ul className="space-y-2 text-xs text-slate-grey">
              <li className="flex gap-2">
                <span className="text-champagne-gold">•</span>
                <span>
                  Email and SMS notifications are sent for alerts matching your selected priorities
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-champagne-gold">•</span>
                <span>
                  SMS messages are concise and contain only critical alert information
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-champagne-gold">•</span>
                <span>
                  Email notifications include detailed metrics and full alert context
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-champagne-gold">•</span>
                <span>
                  Contact information is stored locally and never shared with third parties
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
