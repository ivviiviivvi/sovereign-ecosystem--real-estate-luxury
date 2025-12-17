import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileSpreadsheet, Calendar, Users, GitCompare, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { useKV } from '@github/spark/hooks'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'
import { 
  exportSessionsToCSV, 
  exportComparisonToCSV, 
  exportLeaderboardToCSV,
  downloadCSV 
} from '@/lib/csv-export'

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
  userAvatar?: string
  teamId?: string
}

export function TestDataExport() {
  const [isOpen, setIsOpen] = useState(false)
  const [testSessions] = useKV<TestSession[]>('test-sessions-history', [])
  const [exportType, setExportType] = useState<'sessions' | 'comparison' | 'leaderboard'>('sessions')
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)

  const teams = Array.from(new Set((testSessions || []).map(s => s.teamId).filter(Boolean)))

  const getFilteredSessions = (): TestSession[] => {
    if (!testSessions) return []
    
    let filtered = [...testSessions]

    if (teamFilter !== 'all') {
      filtered = filtered.filter(s => s.teamId === teamFilter)
    }

    if (dateRange !== 'all') {
      const now = new Date()
      const cutoff = new Date()
      
      switch (dateRange) {
        case 'week':
          cutoff.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoff.setMonth(now.getMonth() - 1)
          break
        case 'year':
          cutoff.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(s => new Date(s.startTime) >= cutoff)
    }

    return filtered
  }

  const handleExportSessions = () => {
    setIsExporting(true)
    soundManager.play('glassTap')

    try {
      const filtered = getFilteredSessions()
      
      if (filtered.length === 0) {
        toast.error('No data to export', {
          description: 'No sessions match the selected filters'
        })
        setIsExporting(false)
        return
      }

      const csvContent = exportSessionsToCSV(filtered)
      const filename = `test-sessions-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
      
      downloadCSV(csvContent, filename)
      
      toast.success('Sessions exported!', {
        description: `Downloaded ${filtered.length} sessions to ${filename}`
      })
      
      soundManager.play('success')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', {
        description: 'Unable to export session data'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportComparison = () => {
    setIsExporting(true)
    soundManager.play('glassTap')

    try {
      const filtered = getFilteredSessions()
      
      if (filtered.length < 2) {
        toast.error('Insufficient data', {
          description: 'Need at least 2 sessions to generate comparisons'
        })
        setIsExporting(false)
        return
      }

      const comparisons: any[] = []
      for (let i = 0; i < filtered.length - 1; i++) {
        const session1 = filtered[i]
        const session2 = filtered[i + 1]

        const durationChange = session2.duration - session1.duration
        const durationChangePercent = (durationChange / session1.duration) * 100

        const accuracy1 = session1.totalTests ? (session1.passedTests / session1.totalTests) * 100 : 0
        const accuracy2 = session2.totalTests ? (session2.passedTests / session2.totalTests) * 100 : 0
        const accuracyChange = accuracy2 - accuracy1

        const completionChange = session2.completedModules.length - session1.completedModules.length
        const testsRunChange = session2.totalTests - session1.totalTests

        let improvementScore = 0
        if (durationChange < 0) improvementScore += 30
        if (completionChange > 0) improvementScore += 30
        if (accuracyChange > 0) improvementScore += 40

        comparisons.push({
          session1,
          session2,
          durationChange,
          durationChangePercent,
          completionChange,
          accuracyChange,
          testsRunChange,
          improvementScore
        })
      }

      const csvContent = exportComparisonToCSV(comparisons)
      const filename = `test-comparisons-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
      
      downloadCSV(csvContent, filename)
      
      toast.success('Comparisons exported!', {
        description: `Downloaded ${comparisons.length} comparisons to ${filename}`
      })
      
      soundManager.play('success')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', {
        description: 'Unable to export comparison data'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportLeaderboard = () => {
    setIsExporting(true)
    soundManager.play('glassTap')

    try {
      const filtered = getFilteredSessions()
      
      if (filtered.length === 0) {
        toast.error('No data to export', {
          description: 'No sessions match the selected filters'
        })
        setIsExporting(false)
        return
      }

      const userMap = new Map<string, any>()

      filtered.forEach(session => {
        const userName = session.userName || 'Anonymous'
        const key = `${userName}-${session.teamId || 'default'}`
        
        if (!userMap.has(key)) {
          userMap.set(key, {
            userName,
            teamId: session.teamId,
            rank: 0,
            fastestCompletion: session.duration,
            totalModulesCompleted: session.completedModules.length,
            totalTestsRun: session.totalTests || 0,
            totalTestsPassed: session.passedTests || 0,
            averageCompletionTime: session.duration,
            successRate: session.totalTests ? ((session.passedTests || 0) / session.totalTests) * 100 : 0,
            sessions: 1,
            badges: []
          })
        } else {
          const entry = userMap.get(key)!
          entry.fastestCompletion = Math.min(entry.fastestCompletion, session.duration)
          entry.totalModulesCompleted += session.completedModules.length
          entry.totalTestsRun += session.totalTests || 0
          entry.totalTestsPassed += session.passedTests || 0
          entry.sessions += 1
          
          const totalDuration = entry.averageCompletionTime * (entry.sessions - 1) + session.duration
          entry.averageCompletionTime = totalDuration / entry.sessions
          entry.successRate = entry.totalTestsRun ? (entry.totalTestsPassed / entry.totalTestsRun) * 100 : 0
        }
      })

      const entries = Array.from(userMap.values())

      entries.forEach(entry => {
        entry.badges = []
        if (entry.fastestCompletion < 60000) entry.badges.push('Speed Demon')
        if (entry.totalModulesCompleted >= 50) entry.badges.push('Module Master')
        if (entry.successRate >= 95) entry.badges.push('Perfectionist')
        if (entry.sessions >= 10) entry.badges.push('Veteran')
        if (entry.totalTestsPassed >= 100) entry.badges.push('Century Club')
      })

      const sorted = entries.sort((a, b) => {
        const scoreA = (a.successRate * 0.4) + ((1 / a.fastestCompletion) * 10000 * 0.3) + (a.totalModulesCompleted * 0.3)
        const scoreB = (b.successRate * 0.4) + ((1 / b.fastestCompletion) * 10000 * 0.3) + (b.totalModulesCompleted * 0.3)
        return scoreB - scoreA
      })

      sorted.forEach((entry, index) => {
        entry.rank = index + 1
      })

      const csvContent = exportLeaderboardToCSV(sorted)
      const filename = `test-leaderboard-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
      
      downloadCSV(csvContent, filename)
      
      toast.success('Leaderboard exported!', {
        description: `Downloaded leaderboard with ${sorted.length} entries to ${filename}`
      })
      
      soundManager.play('success')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', {
        description: 'Unable to export leaderboard data'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = () => {
    switch (exportType) {
      case 'sessions':
        handleExportSessions()
        break
      case 'comparison':
        handleExportComparison()
        break
      case 'leaderboard':
        handleExportLeaderboard()
        break
    }
  }

  const getExportCount = (): number => {
    const filtered = getFilteredSessions()
    
    switch (exportType) {
      case 'sessions':
        return filtered.length
      case 'comparison':
        return Math.max(0, filtered.length - 1)
      case 'leaderboard':
        const uniqueUsers = new Set(filtered.map(s => `${s.userName}-${s.teamId || 'default'}`))
        return uniqueUsers.size
      default:
        return 0
    }
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
            toast.info('Opening Export Tool', { description: 'Export test data to CSV' })
          }}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Data
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
              animate={{
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div>Export Test Data</div>
              <p className="text-sm text-muted-foreground mt-1 font-normal">
                Export sessions, comparisons, and leaderboard to CSV
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={exportType} onValueChange={(v) => setExportType(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sessions" className="gap-2">
                <Calendar className="w-4 h-4" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2">
                <GitCompare className="w-4 h-4" />
                Comparisons
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-2">
                <Users className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-4 mt-4">
              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold text-foreground mb-2">Session History Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export detailed information about all test sessions including duration, modules completed, test results, and success rates.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4 mt-4">
              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold text-foreground mb-2">Session Comparison Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export sequential session comparisons showing performance changes, improvement scores, and detailed metrics for trend analysis.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4 mt-4">
              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold text-foreground mb-2">Leaderboard Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export aggregated user rankings with fastest times, total modules, accuracy rates, and earned badges for performance review.
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team Filter</Label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team} value={team!}>
                      Team {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="p-4 bg-gradient-to-br from-rose-blush/5 to-rose-gold/5 dark:from-moonlit-violet/5 dark:to-moonlit-lavender/5 border-rose-blush/20 dark:border-moonlit-lavender/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Records to export</div>
                <div className="text-2xl font-bold text-rose-blush dark:text-moonlit-lavender">
                  {getExportCount()}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-rose-blush dark:text-moonlit-lavender opacity-50" />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting || getExportCount() === 0}
              className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export to CSV'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
