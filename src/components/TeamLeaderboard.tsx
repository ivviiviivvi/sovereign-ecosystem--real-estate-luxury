import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, Target, TrendingUp, Crown, Medal, Award, Star, Calendar, Filter } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Avatar } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
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
  userName: string
  userAvatar?: string
  teamId?: string
}

interface TeamMember {
  userName: string
  userAvatar?: string
  teamId: string
  fastestCompletion: number
  totalModulesCompleted: number
  totalTestsRun: number
  totalTestsPassed: number
  averageCompletionTime: number
  successRate: number
  sessions: TestSession[]
  rank?: number
  badges: string[]
  lastActive: string
}

interface TeamStats {
  teamName: string
  totalMembers: number
  totalSessions: number
  averageSuccessRate: number
  totalModulesCompleted: number
  fastestMember: string
}

export function TeamLeaderboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [testSessions] = useKV<TestSession[]>('test-sessions-history', [])
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all')
  const [viewType, setViewType] = useState<'individual' | 'team'>('individual')

  const teams = useMemo(() => {
    if (!testSessions) return []
    const teamSet = new Set<string>()
    testSessions.forEach(session => {
      if (session.teamId) teamSet.add(session.teamId)
    })
    return Array.from(teamSet)
  }, [testSessions])

  const filteredSessions = useMemo(() => {
    if (!testSessions) return []
    
    let filtered = [...testSessions]

    if (selectedTeam !== 'all') {
      filtered = filtered.filter(s => s.teamId === selectedTeam)
    }

    if (timeRange !== 'all') {
      const now = new Date()
      const cutoff = new Date()
      if (timeRange === 'week') {
        cutoff.setDate(now.getDate() - 7)
      } else if (timeRange === 'month') {
        cutoff.setMonth(now.getMonth() - 1)
      }
      filtered = filtered.filter(s => new Date(s.startTime) >= cutoff)
    }

    return filtered
  }, [testSessions, selectedTeam, timeRange])

  const teamMembers = useMemo((): TeamMember[] => {
    if (!filteredSessions || filteredSessions.length === 0) return []

    const userMap = new Map<string, TeamMember>()

    filteredSessions.forEach(session => {
      const userName = session.userName || 'Anonymous'
      const key = `${userName}-${session.teamId || 'default'}`
      
      if (!userMap.has(key)) {
        userMap.set(key, {
          userName,
          userAvatar: session.userAvatar,
          teamId: session.teamId || 'default',
          fastestCompletion: session.duration,
          totalModulesCompleted: session.completedModules.length,
          totalTestsRun: session.totalTests || 0,
          totalTestsPassed: session.passedTests || 0,
          averageCompletionTime: session.duration,
          successRate: session.totalTests ? ((session.passedTests || 0) / session.totalTests) * 100 : 0,
          sessions: [session],
          badges: [],
          lastActive: session.startTime
        })
      } else {
        const entry = userMap.get(key)!
        entry.fastestCompletion = Math.min(entry.fastestCompletion, session.duration)
        entry.totalModulesCompleted += session.completedModules.length
        entry.totalTestsRun += session.totalTests || 0
        entry.totalTestsPassed += session.passedTests || 0
        entry.sessions.push(session)
        entry.lastActive = session.startTime
        
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
      if (entry.sessions.length >= 5 && entry.successRate >= 90) entry.badges.push('Team MVP')
    })

    const sortedEntries = entries.sort((a, b) => {
      const scoreA = (a.successRate * 0.4) + ((1 / a.fastestCompletion) * 10000 * 0.3) + (a.totalModulesCompleted * 0.3)
      const scoreB = (b.successRate * 0.4) + ((1 / b.fastestCompletion) * 10000 * 0.3) + (b.totalModulesCompleted * 0.3)
      return scoreB - scoreA
    })

    sortedEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return sortedEntries
  }, [filteredSessions])

  const teamStats = useMemo((): Map<string, TeamStats> => {
    const statsMap = new Map<string, TeamStats>()

    teamMembers.forEach(member => {
      if (!statsMap.has(member.teamId)) {
        statsMap.set(member.teamId, {
          teamName: member.teamId,
          totalMembers: 0,
          totalSessions: 0,
          averageSuccessRate: 0,
          totalModulesCompleted: 0,
          fastestMember: ''
        })
      }

      const stats = statsMap.get(member.teamId)!
      stats.totalMembers += 1
      stats.totalSessions += member.sessions.length
      stats.averageSuccessRate += member.successRate
      stats.totalModulesCompleted += member.totalModulesCompleted

      if (!stats.fastestMember || member.fastestCompletion < (teamMembers.find(m => m.userName === stats.fastestMember)?.fastestCompletion || Infinity)) {
        stats.fastestMember = member.userName
      }
    })

    statsMap.forEach(stats => {
      stats.averageSuccessRate = stats.averageSuccessRate / stats.totalMembers
    })

    return statsMap
  }, [teamMembers])

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
      case 'Team MVP':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
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
            toast.info('Opening Team Leaderboard', { description: 'Compare team performance' })
          }}
        >
          <Users className="w-4 h-4" />
          Team Leaderboard
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
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
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div>Team Leaderboard</div>
              <p className="text-sm text-muted-foreground mt-1 font-normal">
                Compare performance across multiple team members
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>
                    Team {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto">
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as any)}>
              <TabsList>
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="team">Team Stats</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {viewType === 'individual' ? (
          <ScrollArea className="flex-1 pr-4">
            {teamMembers.length === 0 ? (
              <Card className="p-12 bg-muted/30">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No team data yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete test sessions with team members to see rankings
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={`${member.userName}-${member.teamId}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`p-4 ${
                      member.rank === 1 ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                      member.rank === 2 ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/30' :
                      member.rank === 3 ? 'bg-gradient-to-br from-orange-600/10 to-red-600/10 border-orange-600/30' :
                      'bg-muted/30'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 flex items-center justify-center">
                          {getRankIcon(member.rank!)}
                        </div>

                        <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                          {member.userName.charAt(0).toUpperCase()}
                        </Avatar>

                        <div className="flex-1">
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {member.userName}
                            {member.rank === 1 && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                            {member.teamId && member.teamId !== 'default' && (
                              <Badge variant="outline" className="text-xs">
                                Team {member.teamId}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-3">
                            <span>{member.sessions.length} session{member.sessions.length !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {getRelativeTime(member.lastActive)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Fastest</div>
                            <div className="text-sm font-bold text-rose-blush dark:text-moonlit-lavender">
                              {formatDuration(member.fastestCompletion)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Modules</div>
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {member.totalModulesCompleted}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                              {member.successRate.toFixed(0)}%
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.badges.slice(0, 2).map((badge) => (
                            <Badge
                              key={badge}
                              className={`text-xs ${getBadgeColor(badge)}`}
                            >
                              {badge}
                            </Badge>
                          ))}
                          {member.badges.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.badges.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            {Array.from(teamStats.entries()).length === 0 ? (
              <Card className="p-12 bg-muted/30">
                <div className="text-center">
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No team stats available</h3>
                  <p className="text-sm text-muted-foreground">
                    Teams need to complete sessions to see aggregated statistics
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(teamStats.entries()).map(([teamId, stats], index) => (
                  <motion.div
                    key={teamId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-gradient-to-br from-card to-card/50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-serif font-semibold text-foreground">
                            Team {stats.teamName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {stats.totalMembers} member{stats.totalMembers !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Trophy className="w-8 h-8 text-rose-blush dark:text-moonlit-lavender" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Target className="w-3 h-3" />
                            Total Sessions
                          </div>
                          <div className="text-2xl font-bold text-foreground">
                            {stats.totalSessions}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <TrendingUp className="w-3 h-3" />
                            Avg Success Rate
                          </div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.averageSuccessRate.toFixed(0)}%
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Trophy className="w-3 h-3" />
                            Total Modules
                          </div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.totalModulesCompleted}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Star className="w-3 h-3" />
                            Top Performer
                          </div>
                          <div className="text-sm font-bold text-foreground truncate">
                            {stats.fastestMember}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
