import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Wifi, WifiOff, Users, CheckCircle2, Circle,
  ChevronRight, ChevronLeft, X, Sparkles, MessageCircle,
  FolderOpen, Home, PlayCircle, BookOpen
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { soundManager } from '@/lib/sound-manager'

interface DemoStep {
  id: string
  phase: string
  title: string
  description: string
  icon: any
  actions: string[]
  expectedResult: string
  tips?: string[]
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'ar-start',
    phase: 'Phase 1: AR Room Templates',
    title: 'Access AR View',
    description: 'Open AR camera view to start measuring a room',
    icon: Camera,
    actions: [
      'Navigate to Agent Dashboard or Client Feed',
      'Click any property card',
      'Click the "AR View" button (camera icon)',
      'Grant camera permission when prompted'
    ],
    expectedResult: 'Camera feed appears with AR overlay and measurement tools',
    tips: ['Use mobile for best AR experience', 'Ensure good lighting']
  },
  {
    id: 'ar-measure',
    phase: 'Phase 1: AR Room Templates',
    title: 'Take Room Measurements',
    description: 'Measure the room dimensions for spatial recognition',
    icon: Home,
    actions: [
      'Click "Start Measuring" button',
      'Tap canvas to set first measurement point',
      'Move device and tap to complete measurement',
      'Take 3 core measurements:',
      '  • Width (wall to wall)',
      '  • Length (front to back)',
      '  • Height (floor to ceiling)'
    ],
    expectedResult: 'Three measurements recorded with distances in feet',
    tips: ['Measure from true wall to wall', 'Keep device steady while measuring']
  },
  {
    id: 'room-detect',
    phase: 'Phase 1: AR Room Templates',
    title: 'Auto-Detect Room Type',
    description: 'Let spatial recognition identify the room type',
    icon: Sparkles,
    actions: [
      'Click "Room Templates" button (sparkles icon)',
      'Click "Analyze Current Space" button',
      'Review detection results:',
      '  • Detected room type (Kitchen/Bedroom/Bathroom)',
      '  • Confidence percentage',
      '  • Matched spatial features',
      'Select a suggested measurement preset',
      'Continue measuring with auto-applied labels'
    ],
    expectedResult: 'Room type detected with 70%+ confidence, presets available',
    tips: ['Higher confidence = more accurate dimensions', 'Re-measure if confidence <60%']
  },
  {
    id: 'offline-enable',
    phase: 'Phase 2: Offline Mode',
    title: 'Enable Airplane Mode',
    description: 'Test offline functionality while taking measurements',
    icon: WifiOff,
    actions: [
      'Mobile: Settings > Airplane Mode (toggle ON)',
      'Desktop: DevTools (F12) > Network > Check "Offline"',
      'Look for offline sync indicator (top-right)',
      'Verify "Offline" status with cloud-off icon'
    ],
    expectedResult: 'Red offline indicator appears, app continues working',
    tips: ['Everything still functions normally', 'Changes queued for sync']
  },
  {
    id: 'offline-measure',
    phase: 'Phase 2: Offline Mode',
    title: 'Measure While Offline',
    description: 'Take measurements and add annotations offline',
    icon: Camera,
    actions: [
      'Take 2-3 more AR measurements',
      'Click "Annotate" on any measurement',
      'Add annotations:',
      '  • Take a photo',
      '  • Record a voice note',
      '  • Add text description',
      'Notice everything works smoothly offline'
    ],
    expectedResult: 'All measurements and annotations saved locally',
    tips: ['No data loss', 'Pending changes count increases']
  },
  {
    id: 'offline-reconnect',
    phase: 'Phase 2: Offline Mode',
    title: 'Reconnect & Auto-Sync',
    description: 'Disable airplane mode and watch automatic sync',
    icon: Wifi,
    actions: [
      'Mobile: Settings > Airplane Mode (toggle OFF)',
      'Desktop: DevTools > Network > Uncheck "Offline"',
      'Watch sync indicator animate (spinning refresh)',
      'Wait for success notification',
      'Verify indicator turns green with checkmark'
    ],
    expectedResult: 'All offline changes synced, pending count = 0, success toast appears',
    tips: ['Sync happens automatically', 'Can retry if any failures']
  },
  {
    id: 'collection-create',
    phase: 'Phase 3: Contractor Collection',
    title: 'Create Measurement Collection',
    description: 'Organize measurements into a shareable collection',
    icon: FolderOpen,
    actions: [
      'Click "Contractor Workspace" button',
      'Navigate to "Collections" tab',
      'Click "New Collection" button',
      'Fill in:',
      '  • Name: "Kitchen Renovation - Property A"',
      '  • Description: "Complete kitchen measurements"',
      '  • Tags: "kitchen, renovation, priority"',
      'Select your property',
      'Check all kitchen measurements',
      'Click "Create Collection"'
    ],
    expectedResult: 'Collection card appears showing property count, measurement count, tags',
    tips: ['Use descriptive names', 'Tag by project phase']
  },
  {
    id: 'contractor-invite',
    phase: 'Phase 3: Contractor Collection',
    title: 'Invite Contractor',
    description: 'Add contractor profile and grant collection access',
    icon: Users,
    actions: [
      'Switch to "Contractors" tab',
      'Click "Invite Contractor" button',
      'Fill in details:',
      '  • Name: "John Smith"',
      '  • Email: "john@contractors.com"',
      '  • Company: "Smith Renovation Co."',
      '  • Specialty: "Kitchen Remodeling"',
      '  • Access Level: "View & Comment"',
      'Click "Send Invite"',
      'Copy the generated invite code'
    ],
    expectedResult: 'Contractor card created with unique invite code, copied to clipboard',
    tips: ['Share invite code via email/text', 'Can adjust access level anytime']
  },
  {
    id: 'collection-share',
    phase: 'Phase 3: Contractor Collection',
    title: 'Share Collection',
    description: 'Grant contractor access to measurement collection',
    icon: FolderOpen,
    actions: [
      'Go back to "Collections" tab',
      'Find your "Kitchen Renovation" collection',
      'Click "Share" button',
      'Check "John Smith" in contractor list',
      'Click "Copy Link" to get shareable URL',
      'Collection shows "Shared with: 1"'
    ],
    expectedResult: 'Collection shared with contractor, shareable link copied',
    tips: ['Link contains encoded collection ID', 'Can share with multiple contractors']
  },
  {
    id: 'live-session',
    phase: 'Phase 4: Live Collaboration',
    title: 'Start Live Session',
    description: 'Enable real-time collaboration with contractors',
    icon: MessageCircle,
    actions: [
      'On collection card, click "Start Live Session"',
      'Collaboration View modal opens',
      'Your avatar appears in active contractors',
      'Simulate contractor joining (open in new tab)',
      'Watch for "John Smith joined" notification',
      'Active count updates to "2 active"'
    ],
    expectedResult: 'Live session active, contractor presence visible, cursors tracked',
    tips: ['Each contractor has colored cursor', 'See who is viewing in real-time']
  },
  {
    id: 'live-comments',
    phase: 'Phase 4: Live Collaboration',
    title: 'Add Real-Time Comments',
    description: 'Exchange comments on specific measurements',
    icon: MessageCircle,
    actions: [
      'Click any measurement in the list',
      'Measurement highlights',
      'Type comment in input at bottom',
      'Example: "Counter height should be 36 inches"',
      'Press Enter or click send',
      'Comment appears instantly with avatar',
      'Watch activity feed update on right sidebar'
    ],
    expectedResult: 'Comments stream in real-time, activity logged, no refresh needed',
    tips: ['Sound plays for new comments', 'All participants see instantly']
  },
  {
    id: 'complete',
    phase: 'Complete!',
    title: 'Demo Complete',
    description: 'You\'ve successfully tested all features',
    icon: CheckCircle2,
    actions: [
      'Review what you accomplished:',
      '  ✓ Took AR measurements with spatial recognition',
      '  ✓ Tested offline mode with auto-sync',
      '  ✓ Created organized measurement collection',
      '  ✓ Invited contractor and granted access',
      '  ✓ Started live collaboration session',
      '  ✓ Exchanged real-time comments',
      '',
      'Next steps:',
      '  • Try batch export to PDF/CSV',
      '  • Create custom measurement presets',
      '  • Invite multiple contractors',
      '  • Build custom room templates'
    ],
    expectedResult: 'Full workflow mastered, ready for production use',
    tips: ['Check documentation for advanced features', 'Report any issues found']
  }
]

interface FeatureDemoGuideProps {
  isOpen: boolean
  onClose: () => void
}

export function FeatureDemoGuide({ isOpen, onClose }: FeatureDemoGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const step = DEMO_STEPS[currentStep]
  const progress = ((currentStep + 1) / DEMO_STEPS.length) * 100
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === DEMO_STEPS.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      setCompletedSteps(prev => new Set(prev).add(step.id))
      setCurrentStep(prev => prev + 1)
      soundManager.play('glassTap')
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
      soundManager.play('glassTap')
    }
  }

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
    soundManager.play('glassTap')
  }

  const handleComplete = () => {
    setCompletedSteps(prev => new Set(prev).add(step.id))
    soundManager.play('success')
    onClose()
  }

  const handleReset = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    soundManager.play('glassTap')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-serif flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              Feature Demo Guide
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Complete walkthrough: AR measurements, offline mode, and live collaboration
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {DEMO_STEPS.length}
              </span>
              <span className="font-medium text-rose-blush dark:text-moonlit-lavender">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
            <div className="col-span-3 space-y-2">
              <ScrollArea className="h-[500px] pr-4">
                {DEMO_STEPS.map((s, index) => {
                  const isActive = index === currentStep
                  const isCompleted = completedSteps.has(s.id)
                  const Icon = s.icon

                  return (
                    <button
                      key={s.id}
                      onClick={() => handleStepClick(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 mb-2 ${
                        isActive
                          ? 'bg-rose-blush/10 dark:bg-moonlit-lavender/10 border border-rose-blush/30 dark:border-moonlit-lavender/30'
                          : 'bg-card/50 hover:bg-card border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-green-500/20 text-green-600 dark:text-green-500'
                              : isActive
                              ? 'bg-rose-blush/20 dark:bg-moonlit-lavender/20 text-rose-blush dark:text-moonlit-lavender'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-medium truncate ${
                              isActive
                                ? 'text-rose-blush dark:text-moonlit-lavender'
                                : 'text-foreground'
                            }`}
                          >
                            {s.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Step {index + 1}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </ScrollArea>
            </div>

            <div className="col-span-9">
              <ScrollArea className="h-[500px] pr-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-rose-blush/20 dark:border-moonlit-lavender/20">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2">
                            {step.phase}
                          </Badge>
                          <h3 className="text-2xl font-serif font-medium mb-2">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-rose-blush dark:text-moonlit-lavender" />
                            Actions
                          </h4>
                          <div className="space-y-2 pl-6">
                            {step.actions.map((action, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 text-sm text-muted-foreground"
                              >
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                                  {action.startsWith(' ') ? '•' : index + 1}
                                </div>
                                <span className="flex-1 pt-0.5">{action.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                            Expected Result
                          </h4>
                          <Card className="p-4 bg-green-500/5 border-green-500/20">
                            <p className="text-sm text-foreground">{step.expectedResult}</p>
                          </Card>
                        </div>

                        {step.tips && step.tips.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-rose-blush dark:text-moonlit-lavender" />
                              Pro Tips
                            </h4>
                            <div className="space-y-2">
                              {step.tips.map((tip, index) => (
                                <Card
                                  key={index}
                                  className="p-3 bg-rose-blush/5 dark:bg-moonlit-lavender/5 border-rose-blush/10 dark:border-moonlit-lavender/10"
                                >
                                  <p className="text-sm text-muted-foreground">{tip}</p>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </ScrollArea>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {completedSteps.size} of {DEMO_STEPS.length} steps completed
            </div>

            <Button
              onClick={handleNext}
              className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
            >
              {isLastStep ? 'Complete Demo' : 'Next Step'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
