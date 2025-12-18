import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
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
  ArrowRight,
  Info,
  Medal,
  Crown,
  Sparkle
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
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const teamPerformances = useMemo(() => {
    return teams.map(team => ({
      team,
      performance: teamPerformanceService.generateMockTeamData(team.id, team.name)
    }))
  }, [teams])

  const aggregatedMetrics = useMemo(() => {
    if (teamPerformances.length === 0) return null

    const performances = selectedTeam === 'all' 
      ? teamPerformances 
      : teamPerformances.filter(tp => tp.team.id === selectedTeam)

    const avgSuccessRate = Math.round(
      performances.reduce((sum, tp) => sum + tp.performance.metrics.successRate, 0) / performances.length
    )
    const avgScore = Math.round(
      performances.reduce((sum, tp) => sum + tp.performance.metrics.averageScore, 0) / performances.length
    )
    const avgModuleCompletion = Math.round(
      performances.reduce((sum, tp) => sum + (tp.performance.metrics.completedModules / tp.performance.metrics.totalModules * 100), 0) / performances.length
    )
    const avgEngagement = Math.round(
      performances.reduce((sum, tp) => sum + tp.performance.metrics.activeMembers * 10, 0) / performances.length
    )
    const avgImprovement = Math.round(
      performances.reduce((sum, tp) => sum + tp.performance.metrics.improvementRate, 0) / performances.length
    )

    return {
      'Success Rate': avgSuccessRate,
      'Average Score': avgScore,
      'Module Completion': avgModuleCompletion,
      'Active Engagement': Math.min(avgEngagement, 100),
      'Improvement Rate': avgImprovement,
      'Time to Completion': 35 + Math.random() * 20,
      'Retention Score': 65 + Math.random() * 20,
      'Collaboration Index': 55 + Math.random() * 25
    }
  }, [teamPerformances, selectedTeam])

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

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
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
            <div className="flex items-center gap-4 py-4">
              <div className="flex items-center gap-2">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        <span className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="ml-auto flex items-center gap-3">
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
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
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
                        exit={{ opacity: 0, y: -20 }}
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
                </AnimatePresence>
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
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
