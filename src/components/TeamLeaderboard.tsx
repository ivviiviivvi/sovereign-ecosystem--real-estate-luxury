import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Trophy, Target, TrendingUp, Crown, Medal, Award, Star, Calendar, Filter, Mail, Settings, LineChart, Download, Copy, User, UserX } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Avatar } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
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

interface EmailTemplate {
  id: string
  name: string
  subject: string
  greeting: string
  bodyFormat: 'summary' | 'detailed' | 'chart'
  includeChart: boolean
  brandingColor: string
  logo?: string
  footer: string
  recipients: string[]
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual'
  createdAt: string
}

export function TeamLeaderboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [testSessions] = useKV<TestSession[]>('test-sessions-history', [])
  const [emailTemplates, setEmailTemplates] = useKV<EmailTemplate[]>('email-templates', [])
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all')
  const [viewType, setViewType] = useState<'individual' | 'team' | 'charts'>('individual')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showChartView, setShowChartView] = useState(false)

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

  const uniqueMembers = useMemo(() => {
    if (!testSessions) return []
    const memberSet = new Set<string>()
    testSessions.forEach(session => {
      if (session.userName) memberSet.add(session.userName)
    })
    return Array.from(memberSet).sort()
  }, [testSessions])

  const toggleMemberSelection = (member: string) => {
    setSelectedMembers(prev => 
      prev.includes(member) 
        ? prev.filter(m => m !== member)
        : [...prev, member]
    )
  }

  const teamMembers = useMemo((): TeamMember[] => {
    if (!filteredSessions || filteredSessions.length === 0) return []

    let sessions = filteredSessions
    if (selectedMembers.length > 0) {
      sessions = sessions.filter(s => selectedMembers.includes(s.userName || 'Anonymous'))
    }

    const userMap = new Map<string, TeamMember>()

    sessions.forEach(session => {
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
  }, [filteredSessions, selectedMembers])

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

        <div className="flex items-center gap-3 mb-4 flex-wrap">
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

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                Filter Members ({selectedMembers.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                  Filter by Team Members
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedMembers.length === 0 ? 'All members shown' : `${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''} selected`}
                  </p>
                  {selectedMembers.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMembers([])}
                      className="gap-1 text-xs"
                    >
                      <UserX className="w-3 h-3" />
                      Clear All
                    </Button>
                  )}
                </div>
                <Separator />
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {uniqueMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No team members found
                      </p>
                    ) : (
                      uniqueMembers.map(member => (
                        <div key={member} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={`member-${member}`}
                            checked={selectedMembers.includes(member)}
                            onCheckedChange={() => toggleMemberSelection(member)}
                          />
                          <Label htmlFor={`member-${member}`} className="flex-1 cursor-pointer flex items-center gap-2">
                            <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                              {member.charAt(0).toUpperCase()}
                            </Avatar>
                            <span className="text-sm">{member}</span>
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="w-4 h-4" />
              Email Reports
            </Button>
            
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as any)}>
              <TabsList>
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="team">Team Stats</TabsTrigger>
                <TabsTrigger value="charts">
                  <LineChart className="w-4 h-4" />
                </TabsTrigger>
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
        ) : viewType === 'team' ? (
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
        ) : (
          <PerformanceTrendsChart members={teamMembers} timeRange={timeRange} />
        )}
      </DialogContent>

      <EmailReportDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        teamMembers={teamMembers}
        teamStats={teamStats}
        emailTemplates={emailTemplates || []}
        setEmailTemplates={setEmailTemplates}
      />
    </Dialog>
  )
}

function PerformanceTrendsChart({ members, timeRange }: { members: TeamMember[], timeRange: string }) {
  if (members.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-12 bg-muted/30">
          <div className="text-center">
            <LineChart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No trend data available</h3>
            <p className="text-sm text-muted-foreground">
              Complete multiple test sessions to see performance trends
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
            Performance Trends Over Time
          </h3>
          <div className="space-y-6">
            {members.map((member, idx) => {
              const sortedSessions = [...member.sessions].sort((a, b) => 
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              )

              return (
                <motion.div
                  key={member.userName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {member.userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{member.userName}</div>
                      <div className="text-xs text-muted-foreground">{sortedSessions.length} sessions tracked</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Completion Time</span>
                        <Target className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="space-y-1">
                        {sortedSessions.map((session, i) => {
                          const prevDuration = i > 0 ? sortedSessions[i - 1].duration : session.duration
                          const improvement = prevDuration > session.duration
                          return (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Session {i + 1}</span>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">{(session.duration / 1000).toFixed(1)}s</span>
                                {i > 0 && (
                                  <TrendingUp className={`w-3 h-3 ${improvement ? 'text-green-500 rotate-180' : 'text-red-500'}`} />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>

                    <Card className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Accuracy Rate</span>
                        <Trophy className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="space-y-1">
                        {sortedSessions.map((session, i) => {
                          const accuracy = session.totalTests ? ((session.passedTests || 0) / session.totalTests) * 100 : 0
                          const prevAccuracy = i > 0 ? ((sortedSessions[i - 1].passedTests || 0) / (sortedSessions[i - 1].totalTests || 1)) * 100 : accuracy
                          const improvement = accuracy > prevAccuracy
                          return (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Session {i + 1}</span>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">{accuracy.toFixed(0)}%</span>
                                {i > 0 && (
                                  <TrendingUp className={`w-3 h-3 ${improvement ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>

                    <Card className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Modules Completed</span>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="space-y-1">
                        {sortedSessions.map((session, i) => {
                          const modules = session.completedModules.length
                          const prevModules = i > 0 ? sortedSessions[i - 1].completedModules.length : modules
                          const improvement = modules > prevModules
                          return (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Session {i + 1}</span>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">{modules}</span>
                                {i > 0 && (
                                  <TrendingUp className={`w-3 h-3 ${improvement ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  </div>

                  {idx < members.length - 1 && <Separator className="my-4" />}
                </motion.div>
              )
            })}
          </div>
        </Card>
      </div>
    </ScrollArea>
  )
}

function EmailReportDialog({ 
  isOpen, 
  onClose, 
  teamMembers, 
  teamStats,
  emailTemplates,
  setEmailTemplates
}: { 
  isOpen: boolean
  onClose: () => void
  teamMembers: TeamMember[]
  teamStats: Map<string, TeamStats>
  emailTemplates: EmailTemplate[]
  setEmailTemplates: (templates: EmailTemplate[] | ((prev: EmailTemplate[]) => EmailTemplate[])) => void
}) {
  const [templateName, setTemplateName] = useState('')
  const [subject, setSubject] = useState('Team Performance Report')
  const [greeting, setGreeting] = useState('Hello Team,')
  const [bodyFormat, setBodyFormat] = useState<'summary' | 'detailed' | 'chart'>('summary')
  const [includeChart, setIncludeChart] = useState(true)
  const [brandingColor, setBrandingColor] = useState('#E088AA')
  const [footer, setFooter] = useState('Best regards,\nYour Testing Team')
  const [recipients, setRecipients] = useState<string>('')
  const [schedule, setSchedule] = useState<'daily' | 'weekly' | 'monthly' | 'manual'>('manual')

  const createTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: templateName,
      subject,
      greeting,
      bodyFormat,
      includeChart,
      brandingColor,
      footer,
      recipients: recipients.split(',').map(r => r.trim()).filter(Boolean),
      schedule,
      createdAt: new Date().toISOString()
    }

    setEmailTemplates(prev => [...prev, newTemplate])
    soundManager.play('glassTap')
    toast.success('Email template created', { 
      description: `${templateName} will be sent ${schedule === 'manual' ? 'manually' : schedule}` 
    })
    
    setTemplateName('')
    setRecipients('')
  }

  const deleteTemplate = (id: string) => {
    setEmailTemplates(prev => prev.filter(t => t.id !== id))
    soundManager.play('glassTap')
    toast.success('Template deleted')
  }

  const previewEmail = () => {
    const totalSessions = teamMembers.reduce((sum, m) => sum + m.sessions.length, 0)
    const avgAccuracy = teamMembers.reduce((sum, m) => sum + m.successRate, 0) / teamMembers.length
    
    const preview = `
${greeting}

${bodyFormat === 'summary' ? `Here's a summary of team performance:
- Total team members: ${teamMembers.length}
- Total sessions completed: ${totalSessions}
- Average accuracy: ${avgAccuracy.toFixed(1)}%
- Top performer: ${teamMembers[0]?.userName || 'N/A'}` : ''}

${bodyFormat === 'detailed' ? teamMembers.map((m, i) => `
${i + 1}. ${m.userName}
   - Sessions: ${m.sessions.length}
   - Accuracy: ${m.successRate.toFixed(1)}%
   - Fastest: ${(m.fastestCompletion / 1000).toFixed(1)}s
   - Modules: ${m.totalModulesCompleted}`).join('\n') : ''}

${includeChart ? '\n[Performance trend chart would be included here]' : ''}

${footer}
    `.trim()

    return preview
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Mail className="w-6 h-6 text-rose-blush dark:text-moonlit-lavender" />
            Email Report Templates
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="create" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Template</TabsTrigger>
            <TabsTrigger value="manage">Manage Templates ({emailTemplates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-6">
              <ScrollArea className="pr-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Weekly Team Report"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="greeting">Greeting</Label>
                    <Input
                      id="greeting"
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Body Format</Label>
                    <Select value={bodyFormat} onValueChange={(v) => setBodyFormat(v as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="chart">Chart Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-chart"
                      checked={includeChart}
                      onCheckedChange={(checked) => setIncludeChart(checked as boolean)}
                    />
                    <Label htmlFor="include-chart" className="cursor-pointer">
                      Include performance trend chart
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="branding-color">Brand Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="branding-color"
                        type="color"
                        value={brandingColor}
                        onChange={(e) => setBrandingColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={brandingColor}
                        onChange={(e) => setBrandingColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="footer">Footer</Label>
                    <Input
                      id="footer"
                      value={footer}
                      onChange={(e) => setFooter(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipients">Recipients (comma-separated)</Label>
                    <Input
                      id="recipients"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Schedule</Label>
                    <Select value={schedule} onValueChange={(v) => setSchedule(v as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Send Manually</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={createTemplate} className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </ScrollArea>

              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Email Preview</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(previewEmail())
                      toast.success('Preview copied to clipboard')
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div 
                  className="p-4 bg-card rounded border border-border"
                  style={{ borderTopColor: brandingColor, borderTopWidth: '4px' }}
                >
                  <div className="text-sm font-semibold mb-2" style={{ color: brandingColor }}>
                    {subject}
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">
                    {previewEmail()}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="flex-1 overflow-auto">
            <ScrollArea className="h-[500px] pr-4">
              {emailTemplates.length === 0 ? (
                <Card className="p-12 bg-muted/30">
                  <div className="text-center">
                    <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No templates yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first email template to get started
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {emailTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{template.name}</h4>
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: template.brandingColor, color: template.brandingColor }}
                              >
                                {template.schedule}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Format: {template.bodyFormat}</span>
                              <span>•</span>
                              <span>{template.recipients.length} recipient{template.recipients.length !== 1 ? 's' : ''}</span>
                              {template.includeChart && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <LineChart className="w-3 h-3" />
                                    Chart included
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast.success('Email sent', { description: `Sent to ${template.recipients.length} recipients` })
                                soundManager.play('glassTap')
                              }}
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Send
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
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

