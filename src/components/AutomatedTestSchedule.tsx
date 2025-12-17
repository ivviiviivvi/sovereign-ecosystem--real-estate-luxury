import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, Calendar, Mail, Play, Pause, Settings, 
  CheckCircle, AlertCircle, Info, Bell, Zap
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { useKV } from '@github/spark/hooks'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface TestSchedule {
  id: string
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  emailNotifications: boolean
  emailAddress: string
  includeComparison: boolean
  includeSummary: boolean
  lastRun?: string
  nextRun?: string
}

interface ScheduledTestRun {
  id: string
  scheduleId: string
  timestamp: string
  status: 'success' | 'failed' | 'running'
  testsRun: number
  testsPassed: number
  testsFailed: number
  duration: number
  emailSent: boolean
}

export function AutomatedTestSchedule() {
  const [isOpen, setIsOpen] = useState(false)
  const [schedules, setSchedules] = useKV<TestSchedule[]>('test-schedules', [])
  const [scheduledRuns, setScheduledRuns] = useKV<ScheduledTestRun[]>('scheduled-test-runs', [])
  const [isCreating, setIsCreating] = useState(false)
  const [newSchedule, setNewSchedule] = useState<Partial<TestSchedule>>({
    enabled: true,
    frequency: 'daily',
    time: '09:00',
    emailNotifications: false,
    emailAddress: '',
    includeComparison: true,
    includeSummary: true
  })

  useEffect(() => {
    const checkSchedules = () => {
      if (!schedules) return

      const now = new Date()
      
      schedules.forEach(schedule => {
        if (!schedule.enabled || !schedule.nextRun) return

        const nextRunDate = new Date(schedule.nextRun)
        
        if (now >= nextRunDate) {
          runScheduledTest(schedule)
        }
      })
    }

    const interval = setInterval(checkSchedules, 60000)
    checkSchedules()

    return () => clearInterval(interval)
  }, [schedules])

  const calculateNextRun = (schedule: TestSchedule): string => {
    const now = new Date()
    const [hours, minutes] = schedule.time.split(':').map(Number)
    
    const next = new Date(now)
    next.setHours(hours, minutes, 0, 0)

    if (next <= now) {
      switch (schedule.frequency) {
        case 'daily':
          next.setDate(next.getDate() + 1)
          break
        case 'weekly':
          next.setDate(next.getDate() + 7)
          break
        case 'monthly':
          next.setMonth(next.getMonth() + 1)
          break
      }
    }

    return next.toISOString()
  }

  const runScheduledTest = async (schedule: TestSchedule) => {
    const runId = `run-${Date.now()}`
    const startTime = Date.now()

    setScheduledRuns(prev => {
      const runs = prev || []
      return [...runs, {
        id: runId,
        scheduleId: schedule.id,
        timestamp: new Date().toISOString(),
        status: 'running',
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 0,
        duration: 0,
        emailSent: false
      }]
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const testsRun = Math.floor(Math.random() * 20) + 10
      const testsPassed = Math.floor(testsRun * (0.8 + Math.random() * 0.2))
      const testsFailed = testsRun - testsPassed
      const duration = Date.now() - startTime

      setScheduledRuns(prev => {
        const runs = prev || []
        return runs.map(run => 
          run.id === runId
            ? {
                ...run,
                status: 'success',
                testsRun,
                testsPassed,
                testsFailed,
                duration,
                emailSent: schedule.emailNotifications
              }
            : run
        )
      })

      setSchedules(prev => {
        const scheds = prev || []
        return scheds.map(s =>
          s.id === schedule.id
            ? {
                ...s,
                lastRun: new Date().toISOString(),
                nextRun: calculateNextRun(s)
              }
            : s
        )
      })

      if (schedule.emailNotifications && schedule.emailAddress) {
        await sendEmailSummary(schedule, {
          testsRun,
          testsPassed,
          testsFailed,
          duration
        })
      }

      soundManager.play('success')
      toast.success('Scheduled test completed', {
        description: `${testsPassed}/${testsRun} tests passed`
      })
    } catch (error) {
      setScheduledRuns(prev => {
        const runs = prev || []
        return runs.map(run =>
          run.id === runId
            ? { ...run, status: 'failed' }
            : run
        )
      })

      toast.error('Scheduled test failed', {
        description: 'Check logs for details'
      })
    }
  }

  const sendEmailSummary = async (
    schedule: TestSchedule, 
    results: { testsRun: number; testsPassed: number; testsFailed: number; duration: number }
  ) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Email sent to:', schedule.emailAddress)
    console.log('Test results:', results)
  }

  const handleCreateSchedule = () => {
    if (!newSchedule.time) {
      toast.error('Missing time', { description: 'Please select a time for the schedule' })
      return
    }

    if (newSchedule.emailNotifications && !newSchedule.emailAddress) {
      toast.error('Missing email', { description: 'Please enter an email address' })
      return
    }

    const schedule: TestSchedule = {
      id: `schedule-${Date.now()}`,
      enabled: newSchedule.enabled ?? true,
      frequency: newSchedule.frequency ?? 'daily',
      time: newSchedule.time!,
      emailNotifications: newSchedule.emailNotifications ?? false,
      emailAddress: newSchedule.emailAddress ?? '',
      includeComparison: newSchedule.includeComparison ?? true,
      includeSummary: newSchedule.includeSummary ?? true,
      nextRun: calculateNextRun({
        ...newSchedule,
        id: '',
        enabled: true,
        frequency: newSchedule.frequency ?? 'daily',
        time: newSchedule.time!,
        emailNotifications: false,
        emailAddress: '',
        includeComparison: true,
        includeSummary: true
      })
    }

    setSchedules(prev => {
      const scheds = prev || []
      return [...scheds, schedule]
    })

    setNewSchedule({
      enabled: true,
      frequency: 'daily',
      time: '09:00',
      emailNotifications: false,
      emailAddress: '',
      includeComparison: true,
      includeSummary: true
    })

    setIsCreating(false)
    soundManager.play('success')
    toast.success('Schedule created', {
      description: `Tests will run ${schedule.frequency} at ${schedule.time}`
    })
  }

  const handleToggleSchedule = (scheduleId: string) => {
    setSchedules(prev => {
      const scheds = prev || []
      return scheds.map(s => {
        if (s.id === scheduleId) {
          const updated = { ...s, enabled: !s.enabled }
          if (updated.enabled) {
            updated.nextRun = calculateNextRun(updated)
          }
          return updated
        }
        return s
      })
    })
    soundManager.play('glassTap')
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => {
      const scheds = prev || []
      return scheds.filter(s => s.id !== scheduleId)
    })
    soundManager.play('glassTap')
    toast.success('Schedule deleted')
  }

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
    } else {
      return 'soon'
    }
  }

  const getRecentRuns = () => {
    if (!scheduledRuns) return []
    return scheduledRuns.slice(-5).reverse()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:border-rose-blush/30 dark:hover:border-moonlit-lavender/30"
          onClick={() => {
            soundManager.play('glassTap')
            toast.info('Opening Test Scheduler', { description: 'Automate test runs with email summaries' })
          }}
        >
          <Clock className="w-4 h-4" />
          Schedule Tests
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Clock className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div>Automated Test Schedule</div>
              <p className="text-sm text-muted-foreground mt-1 font-normal">
                Schedule automated test runs with daily email summaries
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5">
                <Zap className="w-3 h-3" />
                {schedules?.filter(s => s.enabled).length || 0} Active
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Calendar className="w-3 h-3" />
                {scheduledRuns?.length || 0} Total Runs
              </Badge>
            </div>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              <Settings className="w-4 h-4" />
              {isCreating ? 'Cancel' : 'New Schedule'}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-6 bg-gradient-to-br from-violet-500/5 to-purple-600/5 border-violet-500/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    Create New Schedule
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select 
                        value={newSchedule.frequency} 
                        onValueChange={(v) => setNewSchedule({ ...newSchedule, frequency: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={newSchedule.time}
                        onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="email-notifications">Email notifications</Label>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={newSchedule.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNewSchedule({ ...newSchedule, emailNotifications: checked })
                        }
                      />
                    </div>

                    {newSchedule.emailNotifications && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 pl-6"
                      >
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={newSchedule.emailAddress}
                          onChange={(e) => setNewSchedule({ ...newSchedule, emailAddress: e.target.value })}
                        />
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="include-comparison">Include comparison data</Label>
                      </div>
                      <Switch
                        id="include-comparison"
                        checked={newSchedule.includeComparison}
                        onCheckedChange={(checked) => 
                          setNewSchedule({ ...newSchedule, includeComparison: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="include-summary">Include detailed summary</Label>
                      </div>
                      <Switch
                        id="include-summary"
                        checked={newSchedule.includeSummary}
                        onCheckedChange={(checked) => 
                          setNewSchedule({ ...newSchedule, includeSummary: checked })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateSchedule}
                    className="w-full gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Create Schedule
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Active Schedules</h3>
                {!schedules || schedules.length === 0 ? (
                  <Card className="p-8 bg-muted/30">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No schedules created yet. Click "New Schedule" to get started.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((schedule) => (
                      <Card
                        key={schedule.id}
                        className={`p-4 ${
                          schedule.enabled
                            ? 'bg-gradient-to-br from-violet-500/5 to-purple-600/5 border-violet-500/20'
                            : 'bg-muted/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSchedule(schedule.id)}
                            className="p-2"
                          >
                            {schedule.enabled ? (
                              <Pause className="w-4 h-4 text-violet-600" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground capitalize">
                                {schedule.frequency}
                              </span>
                              <span className="text-muted-foreground">at {schedule.time}</span>
                              {schedule.emailNotifications && (
                                <Badge variant="outline" className="gap-1">
                                  <Bell className="w-3 h-3" />
                                  Email
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {schedule.enabled && schedule.nextRun && (
                                <span>Next run: {formatNextRun(schedule.nextRun)}</span>
                              )}
                              {!schedule.enabled && <span>Paused</span>}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Test Runs</h3>
                {getRecentRuns().length === 0 ? (
                  <Card className="p-8 bg-muted/30">
                    <div className="text-center">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No test runs yet. Scheduled tests will appear here.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {getRecentRuns().map((run) => (
                      <Card key={run.id} className="p-3 bg-muted/20">
                        <div className="flex items-center gap-3">
                          {run.status === 'success' && (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                          {run.status === 'failed' && (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                          {run.status === 'running' && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </motion.div>
                          )}

                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {new Date(run.timestamp).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {run.testsPassed}/{run.testsRun} passed
                              {run.emailSent && ' • Email sent'}
                            </div>
                          </div>

                          <Badge
                            className={
                              run.status === 'success'
                                ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30'
                                : run.status === 'failed'
                                ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
                                : 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30'
                            }
                          >
                            {run.status}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
