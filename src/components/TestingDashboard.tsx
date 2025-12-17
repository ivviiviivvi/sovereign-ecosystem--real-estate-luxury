import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, FileText, Play, CheckCircle, Circle, Sparkles,
  Volume2, VolumeX, Trophy, AlertCircle, Info
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { VoiceGuidedARTutorial } from './VoiceGuidedARTutorial'
import { CollaborationTestRunner } from './CollaborationTestRunner'
import { ARTutorialVideo } from './ARTutorialVideo'
import { TestCompletionCertificate } from './TestCompletionCertificate'
import { TestLeaderboard } from './TestLeaderboard'
import { TestSessionComparison } from './TestSessionComparison'
import { TeamLeaderboard } from './TeamLeaderboard'
import { TestDataExport } from './TestDataExport'
import { AutomatedTestSchedule } from './AutomatedTestSchedule'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface TestingModule {
  id: string
  title: string
  description: string
  icon: any
  iconColor: string
  status: 'pending' | 'in-progress' | 'completed'
  component: React.ReactNode
  features: string[]
  duration: string
}

interface TestSession {
  id: string
  startTime: string
  endTime?: string
  completedModules: string[]
  audioEnabled: boolean
  notes: string[]
  totalTests: number
  passedTests: number
  failedTests: number
  duration: number
  userName?: string
  userAvatar?: string
  teamId?: string
}

export function TestingDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const [testSession, setTestSession] = useKV<TestSession>('current-test-session', {
    id: `session-${Date.now()}`,
    startTime: new Date().toISOString(),
    completedModules: [],
    audioEnabled: true,
    notes: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    duration: 0,
    userName: 'Test User',
    teamId: 'alpha'
  })
  const [testSessions, setTestSessions] = useKV<TestSession[]>('test-sessions-history', [])

  useEffect(() => {
    if (audioEnabled && !soundManager.isEnabled()) {
      soundManager.toggle()
    } else if (!audioEnabled && soundManager.isEnabled()) {
      soundManager.toggle()
    }
  }, [audioEnabled])

  const modules: TestingModule[] = [
    {
      id: 'voice-tutorial',
      title: 'Voice-Guided AR Tutorial',
      description: 'Learn AR measurement workflow with step-by-step voice instructions. Test audio feedback and voice guidance features.',
      icon: Mic,
      iconColor: 'from-purple-500 to-pink-500',
      status: testSession?.completedModules?.includes('voice-tutorial') ? 'completed' : 'pending',
      component: <VoiceGuidedARTutorial />,
      features: [
        'Text-to-speech voice guidance',
        'Step-by-step AR instructions',
        'Interactive tutorial controls',
        'Progress tracking',
        'Audio feedback system'
      ],
      duration: '10-15 minutes'
    },
    {
      id: 'collaboration-tests',
      title: 'Collaboration Test Suite',
      description: 'Run automated tests for collaboration, offline sync, and real-time features. Verify all systems work correctly.',
      icon: FileText,
      iconColor: 'from-blue-500 to-cyan-500',
      status: testSession?.completedModules?.includes('collaboration-tests') ? 'completed' : 'pending',
      component: <CollaborationTestRunner />,
      features: [
        'Live collaboration sessions',
        'Offline mode sync',
        'Real-time commenting',
        'Contractor management',
        'Sync status verification'
      ],
      duration: '5-10 minutes'
    },
    {
      id: 'video-tutorial',
      title: 'Video Tutorial Walkthrough',
      description: 'Watch complete offline AR workflow demonstration. Learn best practices for field measurements.',
      icon: Play,
      iconColor: 'from-green-500 to-emerald-500',
      status: testSession?.completedModules?.includes('video-tutorial') ? 'completed' : 'pending',
      component: <ARTutorialVideo />,
      features: [
        'Complete AR workflow demo',
        'Offline measurement guide',
        'Room template usage',
        'Collaboration features',
        'Export and sharing'
      ],
      duration: '3-5 minutes'
    }
  ]

  const handleModuleComplete = (moduleId: string) => {
    setTestSession(prev => {
      const current = prev || {
        id: `session-${Date.now()}`,
        startTime: new Date().toISOString(),
        completedModules: [],
        audioEnabled: true,
        notes: [],
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        duration: 0,
        userName: 'Test User'
      }
      const newCompletedModules = [...(current.completedModules || []), moduleId].filter((v, i, a) => a.indexOf(v) === i)
      
      const isAllComplete = newCompletedModules.length === modules.length
      const now = new Date().toISOString()
      const endTime = isAllComplete ? now : current.endTime
      const duration = isAllComplete 
        ? new Date(now).getTime() - new Date(current.startTime).getTime()
        : current.duration
      
      const updatedSession = {
        ...current,
        completedModules: newCompletedModules,
        endTime,
        duration,
        totalTests: current.totalTests + 1,
        passedTests: current.passedTests + 1
      }
      
      if (isAllComplete && endTime) {
        setTestSessions(prevSessions => {
          const sessions = prevSessions || []
          return [...sessions, updatedSession]
        })
      }
      
      return updatedSession
    })
    soundManager.play('success')
    toast.success('Module completed!', {
      description: `You've finished the ${modules.find(m => m.id === moduleId)?.title}`
    })
    
    const isAllComplete = ((testSession?.completedModules?.length || 0) + 1) === modules.length
    if (isAllComplete) {
      setTimeout(() => {
        soundManager.play('success')
        toast.success('All modules completed!', {
          description: 'Download your completion certificate now',
          duration: 5000
        })
      }, 500)
    }
  }

  const handleStartSession = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      completedModules: [],
      audioEnabled: audioEnabled,
      notes: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      duration: 0,
      userName: 'Test User',
      teamId: 'alpha'
    }
    setTestSession(newSession)
    soundManager.play('glassTap')
    toast.success('New test session started', {
      description: 'Begin testing features systematically'
    })
  }

  const handleAudioToggle = () => {
    const newState = !audioEnabled
    setAudioEnabled(newState)
    setTestSession(prev => {
      const current = prev || {
        id: `session-${Date.now()}`,
        startTime: new Date().toISOString(),
        completedModules: [],
        audioEnabled: true,
        notes: [],
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        duration: 0,
        userName: 'Test User',
        teamId: 'alpha'
      }
      return {
        ...current,
        audioEnabled: newState
      }
    })
    
    if (newState && !soundManager.isEnabled()) {
      soundManager.toggle()
      soundManager.play('glassTap')
      toast.success('Audio enabled', { description: 'Sound effects and voice guidance active' })
    } else if (!newState && soundManager.isEnabled()) {
      toast.info('Audio disabled', { description: 'Silent mode activated' })
      soundManager.toggle()
    }
  }

  const getProgress = () => {
    const completed = testSession?.completedModules?.length || 0
    return (completed / modules.length) * 100
  }

  const getSessionDuration = () => {
    if (!testSession?.startTime) return '0m'
    const start = new Date(testSession.startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  const allModulesCompleted = testSession?.completedModules?.length === modules.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className="gap-3 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => {
            soundManager.play('glassTap')
            toast.info('Opening Testing Dashboard', { 
              description: 'Test all features with audio enabled' 
            })
          }}
        >
          <Sparkles className="w-5 h-5" />
          Testing Dashboard
          {testSession?.completedModules && testSession.completedModules.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {testSession.completedModules.length}/{modules.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-serif flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center shadow-lg"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-3">
                  Testing Dashboard
                  {allModulesCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <Badge className="gap-1.5 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                        <Trophy className="w-3.5 h-3.5" />
                        All Complete!
                      </Badge>
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-normal">
                  Comprehensive testing suite for AR, collaboration, and offline features
                </p>
              </div>
            </DialogTitle>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <Label htmlFor="audio-toggle" className="text-sm cursor-pointer">
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Label>
                <Switch
                  id="audio-toggle"
                  checked={audioEnabled}
                  onCheckedChange={handleAudioToggle}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleStartSession}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                New Session
              </Button>

              <TestLeaderboard />
              <TeamLeaderboard />
              <TestSessionComparison />
              <TestDataExport />
              <AutomatedTestSchedule />
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="overview" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="session" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Session Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-hidden flex flex-col space-y-6 m-0 mt-6">
            <Card className="p-6 bg-gradient-to-br from-rose-blush/5 to-rose-gold/5 dark:from-moonlit-violet/5 dark:to-moonlit-lavender/5 border-rose-blush/20 dark:border-moonlit-lavender/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Test Session Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete all modules to verify full functionality
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-rose-blush dark:text-moonlit-lavender">
                    {testSession?.completedModules?.length || 0}/{modules.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(getProgress())}% Complete
                  </div>
                </div>
              </div>
              <Progress value={getProgress()} className="h-3" />
              
              {allModulesCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <div>
                        <h4 className="font-semibold text-green-600 dark:text-green-400">
                          Testing Complete!
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          All modules tested successfully. Ready for production use.
                        </p>
                      </div>
                    </div>
                    {testSession && testSession.endTime && (
                      <TestCompletionCertificate
                        session={{
                          ...testSession,
                          endTime: testSession.endTime
                        }}
                        modules={modules}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </Card>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pr-4">
                {modules.map((module, index) => {
                  const isCompleted = testSession?.completedModules?.includes(module.id)
                  const Icon = module.icon

                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`p-6 h-full flex flex-col transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500/5 border-green-500/30 shadow-lg shadow-green-500/10' 
                          : 'bg-card/50 hover:bg-card border-border hover:shadow-lg'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.iconColor} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring" }}
                            >
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </motion.div>
                          )}
                        </div>

                        <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                          {module.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-4 flex-1">
                          {module.description}
                        </p>

                        <Separator className="my-4" />

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Duration
                            </span>
                            <span className="font-medium">{module.duration}</span>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Features:</p>
                            <div className="space-y-1">
                              {module.features.slice(0, 3).map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <Circle className="w-2 h-2 mt-1 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                              {module.features.length > 3 && (
                                <p className="text-xs text-muted-foreground pl-4">
                                  +{module.features.length - 3} more...
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {module.component}
                          {!isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleModuleComplete(module.id)}
                              className="flex-1 gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="session" className="flex-1 overflow-hidden m-0 mt-6">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                <Card className="p-6 bg-muted/30">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                    Current Session Details
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Session Started</p>
                      <p className="text-base font-medium text-foreground">
                        {testSession?.startTime 
                          ? new Date(testSession.startTime).toLocaleString()
                          : 'Not started'
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="text-base font-medium text-foreground">
                        {getSessionDuration()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Modules Completed</p>
                      <p className="text-base font-medium text-foreground">
                        {testSession?.completedModules?.length || 0} of {modules.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Audio Status</p>
                      <p className="text-base font-medium text-foreground flex items-center gap-2">
                        {audioEnabled ? (
                          <>
                            <Volume2 className="w-4 h-4 text-green-600" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <VolumeX className="w-4 h-4 text-red-600" />
                            Disabled
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-muted/30">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Module Status</h3>
                  
                  <div className="space-y-3">
                    {modules.map((module) => {
                      const isCompleted = testSession?.completedModules?.includes(module.id)
                      const Icon = module.icon

                      return (
                        <div
                          key={module.id}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                            isCompleted
                              ? 'bg-green-500/10 border border-green-500/30'
                              : 'bg-background/50 border border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${module.iconColor} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{module.title}</h4>
                              <p className="text-sm text-muted-foreground">{module.duration}</p>
                            </div>
                          </div>

                          {isCompleted ? (
                            <Badge className="gap-1.5 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Pending
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Testing Guidelines
                  </h3>
                  
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <p>Enable audio for the best testing experience with voice guidance and sound effects</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <p>Test each module thoroughly before marking it complete</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <p>Use the collaboration test runner to verify offline sync functionality</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <p>Watch the complete video tutorial to understand the offline AR workflow</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <p>Refer to TESTING_GUIDE.md for detailed test scenarios and success criteria</p>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
