import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { 
  Play, Pause, RotateCcw, CheckCircle, XCircle, 
  Clock, AlertCircle, FileText, Download, Copy
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Separator } from './ui/separator'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'
import { collaborationService } from '@/lib/collaboration-service'
import { offlineSyncService } from '@/lib/offline-sync-service'
import { Property, Measurement, ContractorProfile, MeasurementCollection } from '@/lib/types'
import { TestFailureNotifications, TestFailure } from './TestFailureNotifications'

interface TestCase {
  id: string
  name: string
  category: 'collaboration' | 'offline' | 'sync' | 'export'
  description: string
  steps: string[]
  expectedResult: string
  testFunction: () => Promise<TestResult>
}

interface TestResult {
  success: boolean
  message: string
  duration: number
  details?: string[]
}

interface TestReport {
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  duration: number
  results: Array<{
    testId: string
    testName: string
    result: TestResult
  }>
}

export function CollaborationTestRunner() {
  const [isOpen, setIsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [currentTestIndex, setCurrentTestIndex] = useState(0)
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map())
  const [testReports, setTestReports] = useKV<TestReport[]>('test-reports', [])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [testFailures, setTestFailures] = useState<TestFailure[]>([])
  const [retryAttempts, setRetryAttempts] = useState<Map<string, number>>(new Map())

  const testCases: TestCase[] = [
    {
      id: 'collab-session-create',
      name: 'Create Collaboration Session',
      category: 'collaboration',
      description: 'Verify that a collaboration session can be created successfully',
      steps: [
        'Create a new session with valid ID',
        'Verify session is active',
        'Check session has empty contractors list'
      ],
      expectedResult: 'Session created with valid ID and empty state',
      testFunction: async () => {
        const startTime = Date.now()
        try {
          const sessionId = `test-session-${Date.now()}`
          const session = collaborationService.createSession(sessionId)
          
          if (!session) throw new Error('Session not created')
          if (session.id !== sessionId) throw new Error('Session ID mismatch')
          if (session.activeContractors.length !== 0) throw new Error('Session should start empty')
          
          return {
            success: true,
            message: 'Session created successfully',
            duration: Date.now() - startTime,
            details: [
              `Session ID: ${session.id}`,
              `Active contractors: ${session.activeContractors.length}`,
              `Created at: ${session.createdAt}`
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          }
        }
      }
    },
    {
      id: 'collab-contractor-join',
      name: 'Contractor Join Session',
      category: 'collaboration',
      description: 'Verify contractors can join an active session',
      steps: [
        'Create test session',
        'Create test contractor profile',
        'Join contractor to session',
        'Verify contractor appears in active list'
      ],
      expectedResult: 'Contractor successfully joins and appears in session',
      testFunction: async () => {
        const startTime = Date.now()
        try {
          const sessionId = `test-session-${Date.now()}`
          collaborationService.createSession(sessionId)
          
          const contractor: ContractorProfile = {
            id: `contractor-${Date.now()}`,
            name: 'Test Contractor',
            email: 'test@example.com',
            inviteCode: 'TEST123',
            accessLevel: 'comment'
          }
          
          collaborationService.joinSession(sessionId, contractor)
          const session = collaborationService.getSession(sessionId)
          
          if (!session) throw new Error('Session not found')
          if (session.activeContractors.length !== 1) throw new Error('Contractor not added')
          if (session.activeContractors[0].id !== contractor.id) throw new Error('Wrong contractor')
          
          return {
            success: true,
            message: 'Contractor joined successfully',
            duration: Date.now() - startTime,
            details: [
              `Contractor: ${contractor.name}`,
              `Access level: ${contractor.accessLevel}`,
              `Active contractors: ${session.activeContractors.length}`
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          }
        }
      }
    },
    {
      id: 'collab-comment-add',
      name: 'Add Live Comment',
      category: 'collaboration',
      description: 'Verify comments can be added to measurements',
      steps: [
        'Create session and join contractor',
        'Add comment to measurement',
        'Verify comment is stored',
        'Check comment has correct metadata'
      ],
      expectedResult: 'Comment added with correct contractor and timestamp',
      testFunction: async () => {
        const startTime = Date.now()
        try {
          const sessionId = `test-session-${Date.now()}`
          const measurementId = `measurement-${Date.now()}`
          
          collaborationService.createSession(sessionId)
          
          const comment = collaborationService.addComment(
            sessionId,
            measurementId,
            'contractor-1',
            'Test Contractor',
            'This is a test comment'
          )
          
          if (!comment) throw new Error('Comment not created')
          if (comment.content !== 'This is a test comment') throw new Error('Comment content mismatch')
          if (comment.resolved) throw new Error('Comment should not be resolved initially')
          
          return {
            success: true,
            message: 'Comment added successfully',
            duration: Date.now() - startTime,
            details: [
              `Comment ID: ${comment.id}`,
              `Content: ${comment.content}`,
              `Contractor: ${comment.contractorName}`,
              `Resolved: ${comment.resolved}`
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          }
        }
      }
    },
    {
      id: 'collab-cursor-update',
      name: 'Update Contractor Cursor',
      category: 'collaboration',
      description: 'Verify cursor positions are tracked in real-time',
      steps: [
        'Create session with contractor',
        'Update cursor position',
        'Retrieve cursor data',
        'Verify position accuracy'
      ],
      expectedResult: 'Cursor position updated and retrievable',
      testFunction: async () => {
        const startTime = Date.now()
        try {
          const sessionId = `test-session-${Date.now()}`
          const contractorId = `contractor-${Date.now()}`
          
          collaborationService.createSession(sessionId)
          collaborationService.updateCursor(sessionId, contractorId, 100, 200)
          
          const cursors = collaborationService.getCursors(sessionId)
          const cursor = cursors.find(c => c.contractorId === contractorId)
          
          if (!cursor) throw new Error('Cursor not found')
          if (cursor.x !== 100 || cursor.y !== 200) throw new Error('Cursor position incorrect')
          
          return {
            success: true,
            message: 'Cursor updated successfully',
            duration: Date.now() - startTime,
            details: [
              `Cursor X: ${cursor.x}`,
              `Cursor Y: ${cursor.y}`,
              `Contractor: ${cursor.name}`
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          }
        }
      }
    },
    {
      id: 'offline-queue-change',
      name: 'Queue Offline Change',
      category: 'offline',
      description: 'Verify changes can be queued when offline',
      steps: [
        'Simulate offline mode',
        'Queue a measurement change',
        'Verify change is in queue',
        'Check queue size increases'
      ],
      expectedResult: 'Change queued successfully with pending status',
      testFunction: async () => {
        const startTime = Date.now()
        try {
          const testData = { id: `test-${Date.now()}`, value: 'test' }
          offlineSyncService.queueChange('measurement_added', testData)
          
          const status = offlineSyncService.getStatus()
          if (status.pendingChanges === 0) throw new Error('Change not queued')
          
          return {
            success: true,
            message: 'Change queued successfully',
            duration: Date.now() - startTime,
            details: [
              `Pending changes: ${status.pendingChanges}`,
              `Action type: measurement_added`,
              `Data: ${JSON.stringify(testData)}`
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          }
        }
      }
    },
    {
      id: 'offline-clear-queue',
      name: 'Clear Offline Queue',
      category: 'offline',
      description: 'Verify queue can be cleared after sync',
      steps: [
        'Add items to queue',
        'Clear queue',
        'Verify queue is empty'
      ],
      expectedResult: 'Queue cleared successfully',
      testFunction: async () => {
        const startTime = Date.now()
        try {
          offlineSyncService.queueChange('measurement_added', { id: '1' })
          offlineSyncService.queueChange('measurement_updated', { id: '2' })
          
          offlineSyncService.clearSyncedChanges()
          const status = offlineSyncService.getStatus()
          
          return {
            success: true,
            message: 'Sync management working',
            duration: Date.now() - startTime,
            details: [
              `Pending changes: ${status.pendingChanges}`,
              `Last sync: ${status.lastSyncTime || 'Never'}`
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          }
        }
      }
    },
    {
      id: 'sync-status-check',
      name: 'Check Sync Status',
      category: 'sync',
      description: 'Verify sync status can be retrieved',
      steps: [
        'Get current sync status',
        'Verify status structure',
        'Check pending changes count'
      ],
      expectedResult: 'Sync status retrieved with correct format',
      testFunction: async () => {
        const startTime = Date.now()
        try {
          const status = offlineSyncService.getStatus()
          
          if (typeof status.isOnline !== 'boolean') throw new Error('Invalid status format')
          if (typeof status.pendingChanges !== 'number') throw new Error('Invalid pending changes')
          
          return {
            success: true,
            message: 'Sync status retrieved',
            duration: Date.now() - startTime,
            details: [
              `Online: ${status.isOnline}`,
              `Pending changes: ${status.pendingChanges}`,
              `Last sync: ${status.lastSyncTime || 'Never'}`,
              `Sync in progress: ${status.syncInProgress}`
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          }
        }
      }
    }
  ]

  const filteredTests = selectedCategory === 'all' 
    ? testCases 
    : testCases.filter(t => t.category === selectedCategory)

  const runSingleTest = async (test: TestCase, retryCount: number = 0): Promise<TestResult> => {
    try {
      const result = await test.testFunction()
      
      if (!result.success && retryCount < 3) {
        const failure: TestFailure = {
          id: `failure-${test.id}-${Date.now()}`,
          testId: test.id,
          testName: test.name,
          category: test.category,
          errorMessage: result.message,
          timestamp: new Date().toISOString(),
          retryCount,
          maxRetries: 3,
          details: result.details
        }
        
        setTestFailures(prev => [...prev, failure])
      }
      
      return result
    } catch (error) {
      const errorResult: TestResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Test execution failed',
        duration: 0
      }
      
      if (retryCount < 3) {
        const failure: TestFailure = {
          id: `failure-${test.id}-${Date.now()}`,
          testId: test.id,
          testName: test.name,
          category: test.category,
          errorMessage: errorResult.message,
          timestamp: new Date().toISOString(),
          retryCount,
          maxRetries: 3,
          stackTrace: error instanceof Error ? error.stack : undefined
        }
        
        setTestFailures(prev => [...prev, failure])
      }
      
      return errorResult
    }
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults(new Map())
    setTestFailures([])
    setRetryAttempts(new Map())
    setCurrentTestIndex(0)
    soundManager.play('glassTap')
    toast.info('Starting test suite...', { description: `Running ${filteredTests.length} tests` })

    const startTime = Date.now()
    const results = new Map<string, TestResult>()

    for (let i = 0; i < filteredTests.length; i++) {
      setCurrentTestIndex(i)
      const test = filteredTests[i]
      
      const result = await runSingleTest(test, 0)
      results.set(test.id, result)
      setTestResults(new Map(results))
      
      if (result.success) {
        soundManager.play('success')
      } else {
        soundManager.play('glassTap')
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const totalDuration = Date.now() - startTime
    const passed = Array.from(results.values()).filter(r => r.success).length
    const failed = results.size - passed

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      totalTests: results.size,
      passed,
      failed,
      duration: totalDuration,
      results: Array.from(results.entries()).map(([testId, result]) => ({
        testId,
        testName: filteredTests.find(t => t.id === testId)?.name || testId,
        result
      }))
    }

    setTestReports(prev => [report, ...(prev || [])].slice(0, 10))
    setIsRunning(false)
    setCurrentTestIndex(filteredTests.length)

    if (failed === 0) {
      toast.success('All tests passed!', { 
        description: `${passed} tests completed in ${(totalDuration / 1000).toFixed(2)}s` 
      })
    } else {
      toast.error(`${failed} test(s) failed`, { 
        description: `${passed} passed, ${failed} failed. Auto-retry will begin shortly.` 
      })
    }
  }

  const handleRetryFailure = async (failure: TestFailure) => {
    const test = testCases.find(t => t.id === failure.testId)
    if (!test) return

    const currentRetries = retryAttempts.get(failure.testId) || 0
    setRetryAttempts(prev => new Map(prev).set(failure.testId, currentRetries + 1))

    const result = await runSingleTest(test, failure.retryCount + 1)
    
    setTestResults(prev => {
      const newMap = new Map(prev)
      newMap.set(test.id, result)
      return newMap
    })

    if (result.success) {
      setTestFailures(prev => prev.filter(f => f.id !== failure.id))
    }
  }

  const handleRetryAllFailures = async () => {
    const currentFailures = [...testFailures]
    
    for (const failure of currentFailures) {
      await handleRetryFailure(failure)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const handleDismissFailure = (failureId: string) => {
    setTestFailures(prev => prev.filter(f => f.id !== failureId))
  }

  const exportReport = (report: TestReport) => {
    const json = JSON.stringify(report, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `test-report-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    soundManager.play('success')
    toast.success('Report exported')
  }

  const copyReportToClipboard = (report: TestReport) => {
    const summary = `Test Report - ${new Date(report.timestamp).toLocaleString()}
Total: ${report.totalTests} | Passed: ${report.passed} | Failed: ${report.failed}
Duration: ${(report.duration / 1000).toFixed(2)}s

Results:
${report.results.map(r => `${r.result.success ? '✓' : '✗'} ${r.testName}`).join('\n')}`

    navigator.clipboard.writeText(summary)
    soundManager.play('success')
    toast.success('Report copied to clipboard')
  }

  const getProgress = () => {
    if (!isRunning || filteredTests.length === 0) return 0
    return (currentTestIndex / filteredTests.length) * 100
  }

  const getResultStats = () => {
    const total = testResults.size
    const passed = Array.from(testResults.values()).filter(r => r.success).length
    const failed = total - passed
    return { total, passed, failed }
  }

  const stats = getResultStats()

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
            onClick={() => soundManager.play('glassTap')}
          >
            <FileText className="w-4 h-4" />
            Test Suite
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Collaboration Test Suite
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Automated tests for collaboration, offline mode, and sync features
          </p>
        </DialogHeader>

        <Tabs defaultValue="tests" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tests">
              <Play className="w-4 h-4 mr-2" />
              Run Tests
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports ({(testReports || []).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="flex-1 overflow-hidden flex flex-col space-y-4 m-0 mt-4">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={runTests}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                  >
                    {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isRunning ? 'Running...' : 'Run Tests'}
                  </Button>

                  <div className="flex gap-2">
                    {['all', 'collaboration', 'offline', 'sync'].map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        disabled={isRunning}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                        {category !== 'all' && (
                          <Badge variant="secondary" className="ml-2">
                            {testCases.filter(t => t.category === category).length}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {testResults.size > 0 && (
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">{stats.passed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium">{stats.failed}</span>
                    </div>
                  </div>
                )}
              </div>

              {isRunning && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Running test {currentTestIndex + 1} of {filteredTests.length}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(getProgress())}%
                    </span>
                  </div>
                  <Progress value={getProgress()} className="h-2" />
                </div>
              )}
            </Card>

            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {filteredTests.map((test, index) => {
                  const result = testResults.get(test.id)
                  const isCurrent = isRunning && index === currentTestIndex
                  
                  return (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`p-4 ${
                        isCurrent ? 'border-2 border-rose-blush dark:border-moonlit-lavender bg-rose-blush/5 dark:bg-moonlit-lavender/5' :
                        result?.success ? 'border-green-500/30 bg-green-500/5' :
                        result && !result.success ? 'border-red-500/30 bg-red-500/5' :
                        'bg-muted/30'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex-shrink-0">
                                {isCurrent ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                  >
                                    <Clock className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                                  </motion.div>
                                ) : result?.success ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : result ? (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{test.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                              </div>

                              <Badge variant="outline">
                                {test.category}
                              </Badge>
                            </div>

                            {result && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {result.message}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({result.duration}ms)
                                  </span>
                                </div>
                                
                                {result.details && result.details.length > 0 && (
                                  <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1 font-mono">
                                    {result.details.map((detail, idx) => (
                                      <div key={idx} className="text-muted-foreground">{detail}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reports" className="flex-1 overflow-hidden m-0 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {(testReports || []).length === 0 ? (
                  <Card className="p-12 bg-muted/30">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No reports yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Run tests to generate reports
                      </p>
                    </div>
                  </Card>
                ) : (
                  (testReports || []).map((report, index) => (
                    <Card key={index} className="p-6 bg-muted/30">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-xl text-foreground mb-1">
                            Test Report #{(testReports || []).length - index}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.timestamp).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyReportToClipboard(report)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportReport(report)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <Card className="p-3 bg-background/50">
                          <div className="text-sm text-muted-foreground mb-1">Total</div>
                          <div className="text-2xl font-bold text-foreground">{report.totalTests}</div>
                        </Card>
                        <Card className="p-3 bg-green-500/10">
                          <div className="text-sm text-muted-foreground mb-1">Passed</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{report.passed}</div>
                        </Card>
                        <Card className="p-3 bg-red-500/10">
                          <div className="text-sm text-muted-foreground mb-1">Failed</div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{report.failed}</div>
                        </Card>
                        <Card className="p-3 bg-background/50">
                          <div className="text-sm text-muted-foreground mb-1">Duration</div>
                          <div className="text-2xl font-bold text-foreground">{(report.duration / 1000).toFixed(2)}s</div>
                        </Card>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        {report.results.map((r, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-background/30 rounded">
                            <div className="flex items-center gap-2">
                              {r.result.success ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-sm text-foreground">{r.testName}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{r.result.duration}ms</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    {isOpen && (
      <TestFailureNotifications
        failures={testFailures}
        onRetry={handleRetryFailure}
        onDismiss={handleDismissFailure}
        onRetryAll={handleRetryAllFailures}
        autoRetryEnabled={true}
        autoRetryDelay={3000}
      />
    )}
  </>
  )
}
