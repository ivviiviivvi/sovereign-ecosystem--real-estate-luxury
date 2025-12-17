import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, Target, TrendingUp, Medal, Award, Crown, Star, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Avatar } from './ui/avatar'
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
  userAvatar?: string
  teamId?: string
}

interface LeaderboardEntry {
  userName: string
  userAvatar?: string
  fastestCompletion: number
  totalModulesCompleted: number
  totalTestsRun: number
  totalTestsPassed: number
  averageCompletionTime: number
  successRate: number
  sessions: TestSession[]
  rank?: number
  badges: string[]
}

export function TestLeaderboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [testSessions, setTestSessions] = useKV<TestSession[]>('test-sessions-history', [])
  const [selectedCategory, setSelectedCategory] = useState<'speed' | 'completion' | 'accuracy'>('speed')

  const leaderboardData = useMemo(() => {
    if (!testSessions || testSessions.length === 0) return []

    const userMap = new Map<string, LeaderboardEntry>()

    testSessions.forEach(session => {
      const userName = session.userName || 'Anonymous'
      
      if (!userMap.has(userName)) {
        userMap.set(userName, {
          userName,
          userAvatar: session.userAvatar,
          fastestCompletion: session.duration,
          totalModulesCompleted: session.completedModules.length,
          totalTestsRun: session.totalTests || 0,
          totalTestsPassed: session.passedTests || 0,
          averageCompletionTime: session.duration,
          successRate: session.totalTests ? ((session.passedTests || 0) / session.totalTests) * 100 : 0,
          sessions: [session],
          badges: []
        })
      } else {
        const entry = userMap.get(userName)!
        entry.fastestCompletion = Math.min(entry.fastestCompletion, session.duration)
        entry.totalModulesCompleted += session.completedModules.length
        entry.totalTestsRun += session.totalTests || 0
        entry.totalTestsPassed += session.passedTests || 0
        entry.sessions.push(session)
        
        const totalDuration = entry.sessions.reduce((sum, s) => sum + s.duration, 0)
        entry.averageCompletionTime = totalDuration / entry.sessions.length
        entry.successRate = entry.totalTestsRun ? (entry.totalTestsPassed / entry.totalTestsRun) * 100 : 0
      }
    })

    const entries = Array.from(userMap.values())

    entries.forEach(entry => {
      entry.badges = []
      if (entry.fastestCompletion < 60000) entry.badges.push('Speed Demon')
      if (entry.totalModulesCompleted >= 50) entry.badges.push('Module Master')
      if (entry.successRate >= 95) entry.badges.push('Perfectionist')
      if (entry.sessions.length >= 10) entry.badges.push('Veteran')
      if (entry.totalTestsPassed >= 100) entry.badges.push('Century Club')
    })

    let sortedEntries: LeaderboardEntry[]
    
    switch (selectedCategory) {
      case 'speed':
        sortedEntries = entries.sort((a, b) => a.fastestCompletion - b.fastestCompletion)
        break
      case 'completion':
        sortedEntries = entries.sort((a, b) => b.totalModulesCompleted - a.totalModulesCompleted)
        break
      case 'accuracy':
        sortedEntries = entries.sort((a, b) => b.successRate - a.successRate)
        break
      default:
        sortedEntries = entries
    }

    sortedEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return sortedEntries
  }, [testSessions, selectedCategory])

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Speed Demon':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
      case 'Module Master':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
      case 'Perfectionist':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
      case 'Veteran':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
      case 'Century Club':
        return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const stats = {
    totalSessions: testSessions?.length || 0,
    totalTests: testSessions?.reduce((sum, s) => sum + (s.totalTests || 0), 0) || 0,
    averageSuccessRate: testSessions?.length 
      ? testSessions.reduce((sum, s) => {
          const rate = s.totalTests ? ((s.passedTests || 0) / s.totalTests) * 100 : 0
          return sum + rate
        }, 0) / testSessions.length
      : 0,
    fastestTime: testSessions?.length 
      ? Math.min(...testSessions.map(s => s.duration))
      : 0
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
            toast.info('Opening Leaderboard', { description: 'View top performers' })
          }}
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Trophy className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div>Testing Leaderboard</div>
              <p className="text-sm text-muted-foreground mt-1 font-normal">
                Top performers by speed, completion, and accuracy
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card className="p-3 bg-gradient-to-br from-rose-blush/5 to-rose-gold/5 dark:from-moonlit-violet/5 dark:to-moonlit-lavender/5 border-rose-blush/20 dark:border-moonlit-lavender/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-rose-blush dark:text-moonlit-lavender" />
              <span className="text-xs text-muted-foreground">Total Sessions</span>
            </div>
            <div className="text-2xl font-bold text-rose-blush dark:text-moonlit-lavender">
              {stats.totalSessions}
            </div>
          </Card>

          <Card className="p-3 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-muted-foreground">Total Tests</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalTests}
            </div>
          </Card>

          <Card className="p-3 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-muted-foreground">Avg Success</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.averageSuccessRate.toFixed(0)}%
            </div>
          </Card>

          <Card className="p-3 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-muted-foreground">Fastest Time</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.fastestTime ? formatDuration(stats.fastestTime) : '-'}
            </div>
          </Card>
        </div>

        <Tabs defaultValue="speed" onValueChange={(v) => setSelectedCategory(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="speed" className="gap-2">
              <Zap className="w-4 h-4" />
              Fastest Times
            </TabsTrigger>
            <TabsTrigger value="completion" className="gap-2">
              <Target className="w-4 h-4" />
              Most Modules
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Best Accuracy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speed" className="flex-1 overflow-hidden m-0 mt-4">
            <ScrollArea className="h-full pr-4">
              {leaderboardData.length === 0 ? (
                <Card className="p-12 bg-muted/30">
                  <div className="text-center">
                    <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No data yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete test sessions to see leaderboard rankings
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {leaderboardData.map((entry, index) => (
                    <motion.div
                      key={entry.userName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`p-4 ${
                        entry.rank === 1 ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/30' :
                        entry.rank === 3 ? 'bg-gradient-to-br from-orange-600/10 to-red-600/10 border-orange-600/30' :
                        'bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 flex items-center justify-center">
                            {getRankIcon(entry.rank!)}
                          </div>

                          <Avatar className="w-10 h-10 bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center text-white font-semibold">
                            {entry.userName.charAt(0).toUpperCase()}
                          </Avatar>

                          <div className="flex-1">
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              {entry.userName}
                              {entry.rank === 1 && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.sessions.length} session{entry.sessions.length !== 1 ? 's' : ''}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-rose-blush dark:text-moonlit-lavender">
                              {formatDuration(entry.fastestCompletion)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Avg: {formatDuration(entry.averageCompletionTime)}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {entry.badges.slice(0, 3).map((badge) => (
                              <Badge
                                key={badge}
                                className={`text-xs ${getBadgeColor(badge)}`}
                              >
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="completion" className="flex-1 overflow-hidden m-0 mt-4">
            <ScrollArea className="h-full pr-4">
              {leaderboardData.length === 0 ? (
                <Card className="p-12 bg-muted/30">
                  <div className="text-center">
                    <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No data yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete test modules to see completion rankings
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {leaderboardData.map((entry, index) => (
                    <motion.div
                      key={entry.userName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`p-4 ${
                        entry.rank === 1 ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/30' :
                        entry.rank === 3 ? 'bg-gradient-to-br from-orange-600/10 to-red-600/10 border-orange-600/30' :
                        'bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 flex items-center justify-center">
                            {getRankIcon(entry.rank!)}
                          </div>

                          <Avatar className="w-10 h-10 bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center text-white font-semibold">
                            {entry.userName.charAt(0).toUpperCase()}
                          </Avatar>

                          <div className="flex-1">
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              {entry.userName}
                              {entry.rank === 1 && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.totalTestsRun} total tests
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {entry.totalModulesCompleted}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Modules
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {entry.badges.slice(0, 3).map((badge) => (
                              <Badge
                                key={badge}
                                className={`text-xs ${getBadgeColor(badge)}`}
                              >
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="accuracy" className="flex-1 overflow-hidden m-0 mt-4">
            <ScrollArea className="h-full pr-4">
              {leaderboardData.length === 0 ? (
                <Card className="p-12 bg-muted/30">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No data yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete tests to see accuracy rankings
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {leaderboardData.map((entry, index) => (
                    <motion.div
                      key={entry.userName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`p-4 ${
                        entry.rank === 1 ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/30' :
                        entry.rank === 3 ? 'bg-gradient-to-br from-orange-600/10 to-red-600/10 border-orange-600/30' :
                        'bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 flex items-center justify-center">
                            {getRankIcon(entry.rank!)}
                          </div>

                          <Avatar className="w-10 h-10 bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center text-white font-semibold">
                            {entry.userName.charAt(0).toUpperCase()}
                          </Avatar>

                          <div className="flex-1">
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              {entry.userName}
                              {entry.rank === 1 && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.totalTestsPassed}/{entry.totalTestsRun} passed
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {entry.successRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Success Rate
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {entry.badges.slice(0, 3).map((badge) => (
                              <Badge
                                key={badge}
                                className={`text-xs ${getBadgeColor(badge)}`}
                              >
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
