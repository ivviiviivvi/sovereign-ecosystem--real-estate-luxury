import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Team, teamPerformanceService } from '@/lib/team-performance-service'
import {
  ChartBar,
  TrendUp,
  TrendDown,
  Minus,
  Trophy,
  Target,
  Lightning,
  Star,
  Users,
  Info,
  Medal,
  Crown,
  Sparkle,
  CaretDown,
  Check,
  X,
  Scales,
  ChartLine,
  Rows
} from '@phosphor-icons/react'
import { soundManager } from '@/lib/sound-manager'

interface IndustryBenchmark {
  metric: string
  industryAverage: number
  topPerformers: number
  bottomPerformers: number
  description: string
  unit: string
  category: 'efficiency' | 'quality' | 'engagement' | 'growth'
}

const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  {
    metric: 'Success Rate',
    industryAverage: 72,
    topPerformers: 92,
    bottomPerformers: 55,
    description: 'Percentage of tests passed successfully',
    unit: '%',
    category: 'quality'
  },
  {
    metric: 'Average Score',
    industryAverage: 75,
    topPerformers: 90,
    bottomPerformers: 62,
    description: 'Average assessment score across all tests',
    unit: '',
    category: 'quality'
  },
  {
    metric: 'Module Completion',
    industryAverage: 65,
    topPerformers: 88,
    bottomPerformers: 45,
    description: 'Percentage of modules completed on time',
    unit: '%',
    category: 'efficiency'
  },
  {
    metric: 'Active Engagement',
    industryAverage: 68,
    topPerformers: 85,
    bottomPerformers: 50,
    description: 'Percentage of team members actively participating',
    unit: '%',
    category: 'engagement'
  },
  {
    metric: 'Improvement Rate',
    industryAverage: 12,
    topPerformers: 25,
    bottomPerformers: 5,
    description: 'Monthly performance improvement percentage',
    unit: '%',
    category: 'growth'
  },
  {
    metric: 'Time to Completion',
    industryAverage: 45,
    topPerformers: 28,
    bottomPerformers: 65,
    description: 'Average minutes to complete standard modules',
    unit: 'min',
    category: 'efficiency'
  },
  {
    metric: 'Retention Score',
    industryAverage: 70,
    topPerformers: 88,
    bottomPerformers: 52,
    description: 'Knowledge retention after 30 days',
    unit: '%',
    category: 'quality'
  },
  {
    metric: 'Collaboration Index',
    industryAverage: 60,
    topPerformers: 82,
    bottomPerformers: 40,
    description: 'Team collaboration effectiveness score',
    unit: '',
    category: 'engagement'
  }
]

interface IndustryBenchmarksProps {
  teams: Team[]
}

export function IndustryBenchmarks({ teams }: IndustryBenchmarksProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showTeamSelector, setShowTeamSelector] = useState(false)
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

  const teamPerformances = useMemo(() => {
    return teams.map(team => ({
      team,
      performance: teamPerformanceService.generateMockTeamData(team.id, team.name)
    }))
  }, [teams])

  const teamsToCompare = useMemo(() => {
    if (selectedTeams.length === 0) return teamPerformances
    return teamPerformances.filter(tp => selectedTeams.includes(tp.team.id))
  }, [teamPerformances, selectedTeams])

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId)
      }
      return [...prev, teamId]
    })
    soundManager.play('glassTap')
  }

  const selectAllTeams = () => {
    setSelectedTeams(teams.map(t => t.id))
    soundManager.play('glassTap')
  }

  const clearTeamSelection = () => {
    setSelectedTeams([])
    soundManager.play('glassTap')
  }

  const getTeamMetrics = (teamId: string) => {
    const tp = teamPerformances.find(t => t.team.id === teamId)
    if (!tp) return null

    const perf = tp.performance
    const seed = teamId.charCodeAt(0) + teamId.charCodeAt(teamId.length - 1)
    return {
      'Success Rate': perf.metrics.successRate,
      'Average Score': perf.metrics.averageScore,
      'Module Completion': Math.round((perf.metrics.completedModules / perf.metrics.totalModules) * 100),
      'Active Engagement': Math.min(perf.metrics.activeMembers * 10, 100),
      'Improvement Rate': perf.metrics.improvementRate,
      'Time to Completion': 30 + (seed % 25),
      'Retention Score': 60 + (seed % 30),
      'Collaboration Index': 50 + (seed % 35)
    }
  }

  const aggregatedMetrics = useMemo(() => {
    if (teamsToCompare.length === 0) return null

    const avgSuccessRate = Math.round(
      teamsToCompare.reduce((sum, tp) => sum + tp.performance.metrics.successRate, 0) / teamsToCompare.length
    )
    const avgScore = Math.round(
      teamsToCompare.reduce((sum, tp) => sum + tp.performance.metrics.averageScore, 0) / teamsToCompare.length
    )
    const avgModuleCompletion = Math.round(
      teamsToCompare.reduce((sum, tp) => sum + (tp.performance.metrics.completedModules / tp.performance.metrics.totalModules * 100), 0) / teamsToCompare.length
    )
    const avgEngagement = Math.round(
      teamsToCompare.reduce((sum, tp) => sum + tp.performance.metrics.activeMembers * 10, 0) / teamsToCompare.length
    )
    const avgImprovement = Math.round(
      teamsToCompare.reduce((sum, tp) => sum + tp.performance.metrics.improvementRate, 0) / teamsToCompare.length
    )

    return {
      'Success Rate': avgSuccessRate,
      'Average Score': avgScore,
      'Module Completion': avgModuleCompletion,
      'Active Engagement': Math.min(avgEngagement, 100),
      'Improvement Rate': avgImprovement,
      'Time to Completion': 38,
      'Retention Score': 72,
      'Collaboration Index': 65
    }
  }, [teamsToCompare])

  const filteredBenchmarks = useMemo(() => {
    if (selectedCategory === 'all') return INDUSTRY_BENCHMARKS
    return INDUSTRY_BENCHMARKS.filter(b => b.category === selectedCategory)
  }, [selectedCategory])

  const getComparisonStatus = (yourValue: number, benchmark: IndustryBenchmark) => {
    const isLowerBetter = benchmark.metric === 'Time to Completion'
    
    if (isLowerBetter) {
      if (yourValue <= benchmark.topPerformers) return 'top'
      if (yourValue <= benchmark.industryAverage) return 'above'
      if (yourValue <= benchmark.bottomPerformers) return 'below'
      return 'bottom'
    } else {
      if (yourValue >= benchmark.topPerformers) return 'top'
      if (yourValue >= benchmark.industryAverage) return 'above'
      if (yourValue >= benchmark.bottomPerformers) return 'below'
      return 'bottom'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'top': return 'text-amber-500'
      case 'above': return 'text-green-500'
      case 'below': return 'text-orange-500'
      case 'bottom': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'top': return { label: 'Top Performer', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: Crown }
      case 'above': return { label: 'Above Average', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: TrendUp }
      case 'below': return { label: 'Below Average', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: TrendDown }
      case 'bottom': return { label: 'Needs Improvement', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: Target }
      default: return { label: 'N/A', color: 'bg-muted', icon: Minus }
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency': return Lightning
      case 'quality': return Star
      case 'engagement': return Users
      case 'growth': return TrendUp
      default: return ChartBar
    }
  }

  const overallScore = useMemo(() => {
    if (!aggregatedMetrics) return 0
    
    let totalScore = 0
    let count = 0
    
    INDUSTRY_BENCHMARKS.forEach(benchmark => {
      const yourValue = aggregatedMetrics[benchmark.metric as keyof typeof aggregatedMetrics]
      if (typeof yourValue === 'number') {
        const status = getComparisonStatus(yourValue, benchmark)
        if (status === 'top') totalScore += 4
        else if (status === 'above') totalScore += 3
        else if (status === 'below') totalScore += 2
        else totalScore += 1
        count++
      }
    })
    
    return Math.round((totalScore / (count * 4)) * 100)
  }, [aggregatedMetrics])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50"
          onClick={() => soundManager.play('glassTap')}
        >
          <Medal className="w-5 h-5" weight="fill" />
          Industry Benchmarks
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trophy className="w-6 h-6 text-white" weight="fill" />
            </motion.div>
            <div>
              <div>Industry Performance Benchmarks</div>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Compare your teams against industry standards
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {teams.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-12 bg-muted/30 max-w-md text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground">
                Create teams to compare their performance against industry benchmarks
              </p>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 py-4 flex-wrap">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowTeamSelector(!showTeamSelector)}
                  className="gap-2 min-w-[200px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Scales className="w-4 h-4" />
                    {selectedTeams.length === 0 
                      ? 'All Teams' 
                      : selectedTeams.length === 1
                        ? teams.find(t => t.id === selectedTeams[0])?.name
                        : `${selectedTeams.length} Teams Selected`
                    }
                  </div>
                  <CaretDown className={`w-4 h-4 transition-transform ${showTeamSelector ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {showTeamSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-border bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Select Teams to Compare</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTeamSelector(false)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAllTeams}
                            className="text-xs h-7"
                          >
                            Select All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearTeamSelection}
                            className="text-xs h-7"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="max-h-[200px]">
                        <div className="p-2 space-y-1">
                          {teams.map(team => (
                            <button
                              key={team.id}
                              onClick={() => toggleTeamSelection(team.id)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                selectedTeams.includes(team.id)
                                  ? 'bg-rose-blush/10 dark:bg-moonlit-lavender/10'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <div
                                className="w-4 h-4 rounded border-2 flex items-center justify-center"
                                style={{
                                  borderColor: team.color,
                                  backgroundColor: selectedTeams.includes(team.id) ? team.color : 'transparent'
                                }}
                              >
                                {selectedTeams.includes(team.id) && (
                                  <Check className="w-3 h-3 text-white" weight="bold" />
                                )}
                              </div>
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: team.color }}
                              />
                              <span className="text-sm flex-1 text-left">{team.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {team.members.length} members
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
                <Button
                  variant={viewMode === 'chart' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => { setViewMode('chart'); soundManager.play('glassTap') }}
                  className="h-8 gap-1.5"
                >
                  <ChartLine className="w-4 h-4" />
                  Chart
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => { setViewMode('table'); soundManager.play('glassTap') }}
                  className="h-8 gap-1.5"
                >
                  <Rows className="w-4 h-4" />
                  Side-by-Side
                </Button>
              </div>

              <div className="ml-auto flex items-center gap-3">
                {selectedTeams.length > 1 && (
                  <Badge variant="outline" className="gap-1 text-sm py-1.5 bg-rose-blush/10 dark:bg-moonlit-lavender/10 border-rose-blush/30 dark:border-moonlit-lavender/30">
                    <Scales className="w-4 h-4" />
                    Comparing {selectedTeams.length} teams
                  </Badge>
                )}
                <Card className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <Sparkle className="w-5 h-5 text-amber-500" weight="fill" />
                    <div>
                      <div className="text-xs text-muted-foreground">Overall Score</div>
                      <div className="text-2xl font-bold font-serif text-amber-600">{overallScore}%</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <AnimatePresence mode="wait">
                {viewMode === 'table' ? (
                  <motion.div
                    key="table-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-serif flex items-center gap-2">
                          <Rows className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                          Side-by-Side Team Comparison
                        </CardTitle>
                        <CardDescription>
                          Compare metrics across {teamsToCompare.length} team{teamsToCompare.length !== 1 ? 's' : ''} against industry benchmarks
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="sticky left-0 bg-muted/50 backdrop-blur-sm min-w-[180px] font-semibold z-10">
                                  Metric
                                </TableHead>
                                <TableHead className="text-center min-w-[100px] bg-amber-500/5">
                                  <div className="flex flex-col items-center gap-1">
                                    <Crown className="w-4 h-4 text-amber-500" weight="fill" />
                                    <span className="text-xs">Top Performers</span>
                                  </div>
                                </TableHead>
                                <TableHead className="text-center min-w-[100px] bg-green-500/5">
                                  <div className="flex flex-col items-center gap-1">
                                    <ChartBar className="w-4 h-4 text-green-500" />
                                    <span className="text-xs">Industry Avg</span>
                                  </div>
                                </TableHead>
                                {teamsToCompare.map(tp => (
                                  <TableHead key={tp.team.id} className="text-center min-w-[130px]">
                                    <div className="flex flex-col items-center gap-1.5">
                                      <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md"
                                        style={{ backgroundColor: tp.team.color }}
                                      >
                                        {tp.team.name.charAt(0)}
                                      </div>
                                      <span className="text-xs font-medium truncate max-w-[110px]">{tp.team.name}</span>
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredBenchmarks.map((benchmark, idx) => {
                                const CategoryIcon = getCategoryIcon(benchmark.category)
                                return (
                                  <TableRow key={benchmark.metric} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="sticky left-0 bg-card/95 backdrop-blur-sm font-medium z-10">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                          benchmark.category === 'efficiency' ? 'bg-blue-500/10 text-blue-500' :
                                          benchmark.category === 'quality' ? 'bg-purple-500/10 text-purple-500' :
                                          benchmark.category === 'engagement' ? 'bg-green-500/10 text-green-500' :
                                          'bg-orange-500/10 text-orange-500'
                                        }`}>
                                          <CategoryIcon className="w-4 h-4" weight="fill" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium">{benchmark.metric}</div>
                                          <div className="text-xs text-muted-foreground capitalize">{benchmark.category}</div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center bg-amber-500/5">
                                      <span className="font-semibold text-amber-600">
                                        {benchmark.topPerformers}{benchmark.unit}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center bg-green-500/5">
                                      <span className="text-muted-foreground">
                                        {benchmark.industryAverage}{benchmark.unit}
                                      </span>
                                    </TableCell>
                                    {teamsToCompare.map(tp => {
                                      const metrics = getTeamMetrics(tp.team.id)
                                      const value = metrics?.[benchmark.metric as keyof typeof metrics]
                                      const status = typeof value === 'number' ? getComparisonStatus(value, benchmark) : null
                                      const statusInfo = status ? getStatusBadge(status) : null
                                      
                                      return (
                                        <TableCell key={tp.team.id} className="text-center">
                                          <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="flex flex-col items-center gap-1"
                                          >
                                            <span className={`font-bold text-lg ${getStatusColor(status || '')}`}>
                                              {typeof value === 'number' ? Math.round(value) : '-'}{typeof value === 'number' ? benchmark.unit : ''}
                                            </span>
                                            {statusInfo && (
                                              <Badge className={`text-[10px] px-1.5 py-0 h-5 ${statusInfo.color}`}>
                                                <statusInfo.icon className="w-3 h-3 mr-0.5" weight="bold" />
                                                {status === 'top' ? '★' : status === 'above' ? '↑' : status === 'below' ? '↓' : '⚠'}
                                              </Badge>
                                            )}
                                          </motion.div>
                                        </TableCell>
                                      )
                                    })}
                                  </TableRow>
                                )
                              })}
                              <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 font-semibold border-t-2">
                                <TableCell className="sticky left-0 bg-muted/50 backdrop-blur-sm z-10">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                      <Trophy className="w-4 h-4 text-white" weight="fill" />
                                    </div>
                                    <span className="font-semibold">Overall Score</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center bg-amber-500/5">
                                  <span className="font-bold text-amber-600 text-lg">100%</span>
                                </TableCell>
                                <TableCell className="text-center bg-green-500/5">
                                  <span className="text-muted-foreground text-lg">75%</span>
                                </TableCell>
                                {teamsToCompare.map(tp => {
                                  const metrics = getTeamMetrics(tp.team.id)
                                  let teamScore = 0
                                  let count = 0
                                  INDUSTRY_BENCHMARKS.forEach(benchmark => {
                                    const value = metrics?.[benchmark.metric as keyof typeof metrics]
                                    if (typeof value === 'number') {
                                      const status = getComparisonStatus(value, benchmark)
                                      if (status === 'top') teamScore += 4
                                      else if (status === 'above') teamScore += 3
                                      else if (status === 'below') teamScore += 2
                                      else teamScore += 1
                                      count++
                                    }
                                  })
                                  const score = count > 0 ? Math.round((teamScore / (count * 4)) * 100) : 0
                                  
                                  return (
                                    <TableCell key={tp.team.id} className="text-center">
                                      <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="flex flex-col items-center gap-1"
                                      >
                                        <span 
                                          className="font-bold text-2xl"
                                          style={{ color: tp.team.color }}
                                        >
                                          {score}%
                                        </span>
                                        {score >= 80 && (
                                          <Crown className="w-5 h-5 text-amber-500" weight="fill" />
                                        )}
                                      </motion.div>
                                    </TableCell>
                                  )
                                })}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    {teamsToCompare.length > 1 && (
                      <Card className="bg-gradient-to-br from-rose-blush/5 to-lavender-mist/5 dark:from-moonlit-violet/10 dark:to-moonlit-lavender/10 border-rose-blush/20 dark:border-moonlit-lavender/20">
                        <CardHeader>
                          <CardTitle className="text-lg font-serif flex items-center gap-2">
                            <Sparkle className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" weight="fill" />
                            Comparison Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(() => {
                              const teamScores = teamsToCompare.map(tp => {
                                const metrics = getTeamMetrics(tp.team.id)
                                let score = 0
                                let count = 0
                                INDUSTRY_BENCHMARKS.forEach(benchmark => {
                                  const value = metrics?.[benchmark.metric as keyof typeof metrics]
                                  if (typeof value === 'number') {
                                    const status = getComparisonStatus(value, benchmark)
                                    if (status === 'top') score += 4
                                    else if (status === 'above') score += 3
                                    else if (status === 'below') score += 2
                                    else score += 1
                                    count++
                                  }
                                })
                                return { team: tp.team, score: count > 0 ? Math.round((score / (count * 4)) * 100) : 0 }
                              })
                              
                              const bestTeam = teamScores.reduce((a, b) => a.score > b.score ? a : b)
                              const avgScore = Math.round(teamScores.reduce((sum, t) => sum + t.score, 0) / teamScores.length)
                              const topMetricTeams = teamsToCompare.filter(tp => {
                                const metrics = getTeamMetrics(tp.team.id)
                                return INDUSTRY_BENCHMARKS.some(b => {
                                  const v = metrics?.[b.metric as keyof typeof metrics]
                                  return typeof v === 'number' && getComparisonStatus(v, b) === 'top'
                                })
                              }).length
                              
                              return [
                                { label: 'Leading Team', value: bestTeam.team.name, color: bestTeam.team.color, icon: Crown },
                                { label: 'Average Score', value: `${avgScore}%`, color: 'oklch(0.65 0.15 340)', icon: ChartBar },
                                { label: 'Teams Compared', value: teamsToCompare.length.toString(), color: 'oklch(0.55 0.18 290)', icon: Users },
                                { label: 'Top Performers', value: topMetricTeams.toString(), color: '#eab308', icon: Trophy }
                              ].map((stat, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="text-center p-4 bg-card rounded-xl border border-border/50"
                                >
                                  <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} weight="fill" />
                                  <div className="text-lg font-bold font-serif truncate" style={{ color: stat.color }}>
                                    {stat.value}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                                </motion.div>
                              ))
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="chart-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid gap-4">
                      {filteredBenchmarks.map((benchmark, idx) => {
                        const yourValue = aggregatedMetrics?.[benchmark.metric as keyof typeof aggregatedMetrics]
                        const status = typeof yourValue === 'number' ? getComparisonStatus(yourValue, benchmark) : null
                        const statusInfo = status ? getStatusBadge(status) : null
                        const CategoryIcon = getCategoryIcon(benchmark.category)

                        return (
                          <motion.div
                            key={benchmark.metric}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card className="overflow-hidden hover:border-rose-blush/30 dark:hover:border-moonlit-lavender/30 transition-colors">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    benchmark.category === 'efficiency' ? 'bg-blue-500/10 text-blue-500' :
                                    benchmark.category === 'quality' ? 'bg-purple-500/10 text-purple-500' :
                                    benchmark.category === 'engagement' ? 'bg-green-500/10 text-green-500' :
                                    'bg-orange-500/10 text-orange-500'
                                  }`}>
                                    <CategoryIcon className="w-6 h-6" weight="fill" />
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold">{benchmark.metric}</h3>
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {benchmark.category}
                                        </Badge>
                                      </div>
                                      {statusInfo && (
                                        <Badge className={`gap-1 ${statusInfo.color}`}>
                                          <statusInfo.icon className="w-3 h-3" weight="bold" />
                                          {statusInfo.label}
                                        </Badge>
                                      )}
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-4">{benchmark.description}</p>

                                    <div className="space-y-3">
                                      <div className="relative h-10 bg-muted/30 rounded-full overflow-hidden">
                                        <div 
                                          className="absolute left-0 top-0 h-full bg-red-400/30 rounded-l-full"
                                          style={{ width: `${(benchmark.bottomPerformers / 100) * 100}%` }}
                                        />
                                        <div 
                                          className="absolute top-0 h-full bg-yellow-400/30"
                                          style={{ 
                                            left: `${(benchmark.bottomPerformers / 100) * 100}%`,
                                            width: `${((benchmark.industryAverage - benchmark.bottomPerformers) / 100) * 100}%`
                                          }}
                                        />
                                        <div 
                                          className="absolute top-0 h-full bg-green-400/30"
                                          style={{ 
                                            left: `${(benchmark.industryAverage / 100) * 100}%`,
                                            width: `${((benchmark.topPerformers - benchmark.industryAverage) / 100) * 100}%`
                                          }}
                                        />
                                        <div 
                                          className="absolute top-0 h-full bg-amber-400/30 rounded-r-full"
                                          style={{ 
                                            left: `${(benchmark.topPerformers / 100) * 100}%`,
                                            width: `${((100 - benchmark.topPerformers) / 100) * 100}%`
                                          }}
                                        />

                                        {typeof yourValue === 'number' && (
                                          <motion.div
                                            initial={{ left: '0%' }}
                                            animate={{ left: `${Math.min(yourValue, 100)}%` }}
                                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute top-0 h-full w-1 bg-foreground"
                                            style={{ transform: 'translateX(-50%)' }}
                                          >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                              <Badge className="bg-foreground text-background text-xs">
                                                You: {Math.round(yourValue)}{benchmark.unit}
                                              </Badge>
                                            </div>
                                          </motion.div>
                                        )}
                                      </div>

                                      <div className="flex justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-3 h-3 rounded bg-red-400/30" />
                                          <span className="text-muted-foreground">Bottom: {benchmark.bottomPerformers}{benchmark.unit}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-3 h-3 rounded bg-yellow-400/30" />
                                          <span className="text-muted-foreground">Avg: {benchmark.industryAverage}{benchmark.unit}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-3 h-3 rounded bg-amber-400/30" />
                                          <span className="text-muted-foreground">Top: {benchmark.topPerformers}{benchmark.unit}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>

                    <Separator className="my-6" />

                    <Card className="bg-gradient-to-br from-rose-blush/5 to-lavender-mist/5 dark:from-moonlit-violet/10 dark:to-moonlit-lavender/10 border-rose-blush/20 dark:border-moonlit-lavender/20">
                      <CardHeader>
                        <CardTitle className="text-xl font-serif flex items-center gap-2">
                          <Info className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                          Benchmark Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Above Average', count: INDUSTRY_BENCHMARKS.filter(b => {
                              const v = aggregatedMetrics?.[b.metric as keyof typeof aggregatedMetrics]
                              return typeof v === 'number' && ['top', 'above'].includes(getComparisonStatus(v, b))
                            }).length, color: 'text-green-500' },
                            { label: 'Top Performer', count: INDUSTRY_BENCHMARKS.filter(b => {
                              const v = aggregatedMetrics?.[b.metric as keyof typeof aggregatedMetrics]
                              return typeof v === 'number' && getComparisonStatus(v, b) === 'top'
                            }).length, color: 'text-amber-500' },
                            { label: 'Needs Work', count: INDUSTRY_BENCHMARKS.filter(b => {
                              const v = aggregatedMetrics?.[b.metric as keyof typeof aggregatedMetrics]
                              return typeof v === 'number' && ['below', 'bottom'].includes(getComparisonStatus(v, b))
                            }).length, color: 'text-orange-500' },
                            { label: 'Total Metrics', count: INDUSTRY_BENCHMARKS.length, color: 'text-blue-500' }
                          ].map((stat, i) => (
                            <div key={i} className="text-center p-4 bg-card rounded-xl">
                              <div className={`text-3xl font-bold font-serif ${stat.color}`}>{stat.count}</div>
                              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {teamsToCompare.length > 1 && (
                      <>
                        <Separator className="my-6" />
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl font-serif flex items-center gap-2">
                              <Scales className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                              Team-by-Team Breakdown
                            </CardTitle>
                            <CardDescription>
                              Individual team scores compared to industry benchmarks
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {teamsToCompare.map((tp, teamIdx) => {
                                const metrics = getTeamMetrics(tp.team.id)
                                if (!metrics) return null
                                
                                let teamScore = 0
                                let count = 0
                                INDUSTRY_BENCHMARKS.forEach(benchmark => {
                                  const value = metrics[benchmark.metric as keyof typeof metrics]
                                  if (typeof value === 'number') {
                                    const status = getComparisonStatus(value, benchmark)
                                    if (status === 'top') teamScore += 4
                                    else if (status === 'above') teamScore += 3
                                    else if (status === 'below') teamScore += 2
                                    else teamScore += 1
                                    count++
                                  }
                                })
                                const score = Math.round((teamScore / (count * 4)) * 100)

                                return (
                                  <motion.div
                                    key={tp.team.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: teamIdx * 0.1 }}
                                    className="p-4 rounded-xl border border-border/50 hover:border-rose-blush/30 dark:hover:border-moonlit-lavender/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                                        style={{ backgroundColor: tp.team.color }}
                                      >
                                        {tp.team.name.charAt(0)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-semibold">{tp.team.name}</h4>
                                          <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold font-serif">{score}%</span>
                                            {score >= 80 && (
                                              <Crown className="w-5 h-5 text-amber-500" weight="fill" />
                                            )}
                                          </div>
                                        </div>
                                        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 0.8, delay: teamIdx * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ 
                                              background: `linear-gradient(90deg, ${tp.team.color}80, ${tp.team.color})`
                                            }}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                          <span>{tp.team.members.length} members</span>
                                          <span>
                                            {INDUSTRY_BENCHMARKS.filter(b => {
                                              const v = metrics[b.metric as keyof typeof metrics]
                                              return typeof v === 'number' && getComparisonStatus(v, b) === 'top'
                                            }).length} top performer metrics
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
