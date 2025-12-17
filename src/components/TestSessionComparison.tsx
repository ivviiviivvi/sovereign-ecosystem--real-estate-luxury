import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, GitCompare, Calendar, Clock, 
  Target, CheckCircle2, XCircle, BarChart3, LineChart, Minus
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { useKV } from '@github/spark/hooks'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface TestSession {
  id: string
  startTime: string
  endTime: string
  completedModules: string[]
  totalTests: number
  passedTests: number
  failedTests: number
  duration: number
  userName?: string
  teamId?: string
}

interface ComparisonMetrics {
  durationChange: number
  durationChangePercent: number
  completionChange: number
  accuracyChange: number
  testsRunChange: number
  improvementScore: number
}

export function TestSessionComparison() {
  const [isOpen, setIsOpen] = useState(false)
  const [testSessions] = useKV<TestSession[]>('test-sessions-history', [])
  const [session1Id, setSession1Id] = useState<string>('')
  const [session2Id, setSession2Id] = useState<string>('')

  const sortedSessions = useMemo(() => {
    if (!testSessions) return []
    return [...testSessions].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }, [testSessions])

  const session1 = sortedSessions.find(s => s.id === session1Id)
  const session2 = sortedSessions.find(s => s.id === session2Id)

  const comparison = useMemo((): ComparisonMetrics | null => {
    if (!session1 || !session2) return null

    const durationChange = session2.duration - session1.duration
    const durationChangePercent = ((durationChange / session1.duration) * 100)
    
    const completionChange = session2.completedModules.length - session1.completedModules.length
    
    const accuracy1 = session1.totalTests ? (session1.passedTests / session1.totalTests) * 100 : 0
    const accuracy2 = session2.totalTests ? (session2.passedTests / session2.totalTests) * 100 : 0
    const accuracyChange = accuracy2 - accuracy1
    
    const testsRunChange = session2.totalTests - session1.totalTests

    let improvementScore = 0
    if (durationChange < 0) improvementScore += 30
    if (completionChange > 0) improvementScore += 30
    if (accuracyChange > 0) improvementScore += 40

    return {
      durationChange,
      durationChangePercent,
      completionChange,
      accuracyChange,
      testsRunChange,
      improvementScore
    }
  }, [session1, session2])

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatChange = (value: number, unit: string = '', showPlus: boolean = true) => {
    if (value === 0) return `0${unit}`
    const sign = value > 0 ? (showPlus ? '+' : '') : ''
    return `${sign}${value.toFixed(1)}${unit}`
  }

  const getTrendIcon = (value: number, inverse: boolean = false) => {
    if (value === 0) return <Minus className="w-5 h-5 text-muted-foreground" />
    const isPositive = inverse ? value < 0 : value > 0
    return isPositive 
      ? <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
      : <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
  }

  const getChangeColor = (value: number, inverse: boolean = false) => {
    if (value === 0) return 'text-muted-foreground'
    const isPositive = inverse ? value < 0 : value > 0
    return isPositive 
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
  }

  const renderSessionCard = (session: TestSession | undefined, label: string) => {
    if (!session) {
      return (
        <Card className="p-6 bg-muted/30 h-full">
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a session to compare</p>
            </div>
          </div>
        </Card>
      )
    }

    const accuracy = session.totalTests ? (session.passedTests / session.totalTests) * 100 : 0

    return (
      <Card className="p-6 bg-gradient-to-br from-rose-blush/5 to-rose-gold/5 dark:from-moonlit-violet/5 dark:to-moonlit-lavender/5 border-rose-blush/20 dark:border-moonlit-lavender/20">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className="font-semibold text-foreground">
              Session #{sortedSessions.findIndex(s => s.id === session.id) + 1}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                Duration
              </div>
              <div className="text-xl font-bold text-foreground">
                {formatDuration(session.duration)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Target className="w-3 h-3" />
                Modules
              </div>
              <div className="text-xl font-bold text-foreground">
                {session.completedModules.length}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <CheckCircle2 className="w-3 h-3" />
                Tests Run
              </div>
              <div className="text-xl font-bold text-foreground">
                {session.totalTests}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <BarChart3 className="w-3 h-3" />
                Accuracy
              </div>
              <div className="text-xl font-bold text-foreground">
                {accuracy.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Passed</span>
              <span className="text-green-600 dark:text-green-400 font-medium">{session.passedTests}</span>
            </div>
            <Progress 
              value={(session.passedTests / session.totalTests) * 100} 
              className="h-2" 
            />
          </div>
        </div>
      </Card>
    )
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
            toast.info('Opening Session Comparison', { description: 'Compare test results over time' })
          }}
        >
          <GitCompare className="w-4 h-4" />
          Compare Sessions
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <GitCompare className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div>Session Comparison</div>
              <p className="text-sm text-muted-foreground mt-1 font-normal">
                Track your testing improvement over multiple sessions
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Session 1 (Baseline)
              </label>
              <Select value={session1Id} onValueChange={setSession1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first session" />
                </SelectTrigger>
                <SelectContent>
                  {sortedSessions.map((session, index) => (
                    <SelectItem key={session.id} value={session.id}>
                      Session #{index + 1} - {new Date(session.startTime).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Session 2 (Compare)
              </label>
              <Select value={session2Id} onValueChange={setSession2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second session" />
                </SelectTrigger>
                <SelectContent>
                  {sortedSessions.map((session, index) => (
                    <SelectItem key={session.id} value={session.id}>
                      Session #{index + 1} - {new Date(session.startTime).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!session1 || !session2 ? (
            <Card className="p-12 bg-muted/30">
              <div className="text-center">
                <GitCompare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Select sessions to compare</h3>
                <p className="text-sm text-muted-foreground">
                  Choose two test sessions from the dropdowns above to see detailed comparisons
                </p>
              </div>
            </Card>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-4">
                {comparison && comparison.improvementScore > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-700 dark:text-green-300">
                            Improvement Detected!
                          </h4>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Overall improvement score: {comparison.improvementScore}/100
                          </p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 text-lg px-4 py-2">
                          +{comparison.improvementScore}
                        </Badge>
                      </div>
                    </Card>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {renderSessionCard(session1, 'Baseline Session')}
                  {renderSessionCard(session2, 'Comparison Session')}
                </div>

                {comparison && (
                  <Card className="p-6 bg-muted/30">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                      Performance Changes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4 bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Duration Change</span>
                          </div>
                          {getTrendIcon(comparison.durationChange, true)}
                        </div>
                        <div className={`text-2xl font-bold ${getChangeColor(comparison.durationChange, true)}`}>
                          {formatChange(comparison.durationChangePercent, '%')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatChange(comparison.durationChange / 1000, 's')} total
                        </div>
                      </Card>

                      <Card className="p-4 bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Modules Completed</span>
                          </div>
                          {getTrendIcon(comparison.completionChange)}
                        </div>
                        <div className={`text-2xl font-bold ${getChangeColor(comparison.completionChange)}`}>
                          {formatChange(comparison.completionChange, '')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {session2.completedModules.length} total modules
                        </div>
                      </Card>

                      <Card className="p-4 bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Accuracy Change</span>
                          </div>
                          {getTrendIcon(comparison.accuracyChange)}
                        </div>
                        <div className={`text-2xl font-bold ${getChangeColor(comparison.accuracyChange)}`}>
                          {formatChange(comparison.accuracyChange, '%')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {session2.totalTests ? ((session2.passedTests / session2.totalTests) * 100).toFixed(1) : 0}% current accuracy
                        </div>
                      </Card>

                      <Card className="p-4 bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Tests Run Change</span>
                          </div>
                          {getTrendIcon(comparison.testsRunChange)}
                        </div>
                        <div className={`text-2xl font-bold ${getChangeColor(comparison.testsRunChange)}`}>
                          {formatChange(comparison.testsRunChange, '')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {session2.totalTests} total tests
                        </div>
                      </Card>
                    </div>
                  </Card>
                )}

                {comparison && (
                  <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Insights & Recommendations
                    </h3>

                    <div className="space-y-3">
                      {comparison.durationChange < 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-foreground">
                            You completed tests <strong>{Math.abs(comparison.durationChangePercent).toFixed(1)}% faster</strong> in the second session. Great improvement!
                          </p>
                        </div>
                      )}

                      {comparison.completionChange > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-foreground">
                            You completed <strong>{comparison.completionChange} more module{comparison.completionChange !== 1 ? 's' : ''}</strong> this time. Keep up the momentum!
                          </p>
                        </div>
                      )}

                      {comparison.accuracyChange > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-foreground">
                            Your accuracy improved by <strong>{comparison.accuracyChange.toFixed(1)}%</strong>. Excellent attention to detail!
                          </p>
                        </div>
                      )}

                      {comparison.accuracyChange < 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <p className="text-foreground">
                            Accuracy decreased by <strong>{Math.abs(comparison.accuracyChange).toFixed(1)}%</strong>. Review failed tests to identify areas for improvement.
                          </p>
                        </div>
                      )}

                      {comparison.durationChange > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <p className="text-foreground">
                            Tests took <strong>{comparison.durationChangePercent.toFixed(1)}% longer</strong> this time. Consider reviewing test procedures to improve efficiency.
                          </p>
                        </div>
                      )}

                      {comparison.improvementScore === 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <Minus className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-foreground">
                            Performance remained consistent between sessions. Try pushing for faster completion times or higher accuracy.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
