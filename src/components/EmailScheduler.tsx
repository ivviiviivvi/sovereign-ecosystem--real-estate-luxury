import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Textarea } from './ui/textarea'
import { EmailSchedule, EmailTemplate, emailScheduleService } from '@/lib/email-schedule-service'
import { Team } from '@/lib/team-performance-service'
import {
  EnvelopeSimple,
  Plus,
  Clock,
  Trash,
  PaperPlaneTilt,
  CheckCircle,
  Warning,
  Calendar,
  Users,
  Palette
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EmailSchedulerProps {
  teams: Team[]
}

export function EmailScheduler({ teams }: EmailSchedulerProps) {
  const [schedules, setSchedules] = useKV<EmailSchedule[]>('email-schedules', [])
  const [templates, setTemplates] = useKV<EmailTemplate[]>('email-templates', [])
  
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)

  const [newScheduleName, setNewScheduleName] = useState('')
  const [newScheduleFrequency, setNewScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [newScheduleDayOfWeek, setNewScheduleDayOfWeek] = useState(1)
  const [newScheduleTime, setNewScheduleTime] = useState('09:00')
  const [newScheduleRecipients, setNewScheduleRecipients] = useState('')
  const [newScheduleSubject, setNewScheduleSubject] = useState('Weekly Team Performance Report')
  const [newScheduleTemplate, setNewScheduleTemplate] = useState('')

  const createSchedule = () => {
    if (!newScheduleName.trim() || !newScheduleRecipients.trim()) {
      toast.error('Please enter schedule name and recipients')
      return
    }

    const recipientList = newScheduleRecipients.split(',').map(r => r.trim()).filter(r => r)

    const schedule = emailScheduleService.createSchedule({
      name: newScheduleName,
      enabled: true,
      frequency: newScheduleFrequency,
      dayOfWeek: newScheduleDayOfWeek,
      time: newScheduleTime,
      timezone: 'America/New_York',
      recipients: recipientList,
      subject: newScheduleSubject,
      templateId: newScheduleTemplate || 'default',
      includeCharts: true,
      format: 'html'
    })

    setSchedules((current) => [...(current || []), schedule])
    toast.success(`Email schedule "${newScheduleName}" created`)

    setNewScheduleName('')
    setNewScheduleRecipients('')
    setIsCreatingSchedule(false)
  }

  const toggleSchedule = (scheduleId: string) => {
    setSchedules((current) =>
      (current || []).map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    )
  }

  const deleteSchedule = (scheduleId: string) => {
    const schedule = (schedules || []).find(s => s.id === scheduleId)
    if (!schedule) return

    if (confirm(`Delete schedule "${schedule.name}"?`)) {
      setSchedules((current) => (current || []).filter(s => s.id !== scheduleId))
      toast.success('Schedule deleted')
    }
  }

  const sendTestEmail = async (scheduleId: string) => {
    const schedule = (schedules || []).find(s => s.id === scheduleId)
    if (!schedule) return

    const template = (templates || []).find(t => t.id === schedule.templateId) || getDefaultTemplate()

    toast.loading('Sending test email...', { id: 'test-email' })

    try {
      const mockData = {
        stats: {
          totalTests: 234,
          successRate: 87,
          completedModules: 18,
          activeTeams: (teams || []).length || 3
        },
        charts: [],
        highlights: 'Outstanding progress this week! Team performance improved by 12% across all metrics.'
      }

      await emailScheduleService.simulateSendEmail(schedule, template, mockData)
      toast.success('Test email sent successfully!', { id: 'test-email' })
    } catch (error) {
      toast.error('Failed to send test email', { id: 'test-email' })
    }
  }

  const getDefaultTemplate = (): EmailTemplate => ({
    id: 'default',
    name: 'Default Template',
    subject: 'Team Performance Report',
    greeting: 'Hello Team,',
    bodyFormat: 'summary',
    includeChart: true,
    brandingColor: '#E088AA',
    footer: 'This is an automated report from The Sovereign Ecosystem.',
    createdAt: new Date().toISOString()
  })

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day] || 'Monday'
  }

  const getNextScheduledDisplay = (schedule: EmailSchedule) => {
    const next = new Date(schedule.nextScheduled)
    return next.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-foreground">Email Scheduler</h2>
          <p className="text-muted-foreground mt-1">Automate team performance reports via email</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreatingSchedule} onOpenChange={setIsCreatingSchedule}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-5 h-5" />
                Create Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Create Email Schedule</DialogTitle>
                <DialogDescription>
                  Set up automated email reports for team performance
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-name">Schedule Name</Label>
                  <Input
                    id="schedule-name"
                    placeholder="e.g., Weekly Team Report"
                    value={newScheduleName}
                    onChange={(e) => setNewScheduleName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-subject">Email Subject</Label>
                  <Input
                    id="schedule-subject"
                    placeholder="e.g., Weekly Team Performance Report"
                    value={newScheduleSubject}
                    onChange={(e) => setNewScheduleSubject(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={newScheduleFrequency}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setNewScheduleFrequency(value)}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newScheduleFrequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label htmlFor="day-of-week">Day of Week</Label>
                      <Select
                        value={newScheduleDayOfWeek.toString()}
                        onValueChange={(value) => setNewScheduleDayOfWeek(parseInt(value))}
                      >
                        <SelectTrigger id="day-of-week">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newScheduleTime}
                      onChange={(e) => setNewScheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Textarea
                    id="recipients"
                    placeholder="Enter email addresses separated by commas"
                    value={newScheduleRecipients}
                    onChange={(e) => setNewScheduleRecipients(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple emails with commas
                  </p>
                </div>

                <Button onClick={createSchedule} className="w-full">
                  <Calendar className="w-5 h-5 mr-2" />
                  Create Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {(schedules || []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">No Schedules Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first email schedule to automate team reports
            </p>
            <Button onClick={() => setIsCreatingSchedule(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {(schedules || []).map((schedule) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className={schedule.enabled ? '' : 'opacity-60'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-serif text-xl">{schedule.name}</CardTitle>
                        <CardDescription className="mt-1">{schedule.subject}</CardDescription>
                      </div>
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={() => toggleSchedule(schedule.id)}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {schedule.frequency === 'weekly' && `Every ${getDayName(schedule.dayOfWeek || 1)}`}
                          {schedule.frequency === 'daily' && 'Every day'}
                          {schedule.frequency === 'monthly' && 'Every month'}
                          {' at '}{schedule.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Next: {getNextScheduledDisplay(schedule)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {schedule.lastSent && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                        <span className="text-sm">
                          Last sent: {new Date(schedule.lastSent).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendTestEmail(schedule.id)}
                        className="flex-1"
                      >
                        <PaperPlaneTilt className="w-4 h-4 mr-2" />
                        Send Test
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {(schedules || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <EnvelopeSimple className="w-6 h-6 text-primary" />
              Scheduled Reports Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold font-serif text-primary">
                  {(schedules || []).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Schedules</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold font-serif text-green-600">
                  {(schedules || []).filter(s => s.enabled).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Active Schedules</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="text-3xl font-bold font-serif text-blue-600">
                  {(schedules || []).reduce((sum, s) => sum + s.recipients.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Recipients</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
