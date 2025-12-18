import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Mail, 
  Crown,
  ChartBar,
  Calendar,
  Download,
  ArrowLeft,
  Sparkles,
  Pencil,
  Trophy,
  Plug
} from 'lucide-react'
import { Team, teamPerformanceService } from '../lib/team-performance-service'
import { TeamCreation } from './TeamCreation'
import { TeamComparisonView } from './TeamComparisonView'
import { EmailScheduler } from './EmailScheduler'
import { TeamEditor } from './TeamEditor'
import { IndustryBenchmarks } from './IndustryBenchmarks'
import { MessagingIntegrations } from './MessagingIntegrations'
import { toast } from 'sonner'

export function TeamManagementDashboard() {
  const [teams] = useKV<Team[]>('teams', [])
  const [showCreation, setShowCreation] = useState(false)
  const [selectedView, setSelectedView] = useState<'overview' | 'comparison' | 'scheduler'>('overview')

  const handleTeamCreated = (team: Team) => {
    setShowCreation(false)
    toast.success(`${team.name} is ready to track performance!`, {
      description: 'Compare teams and schedule reports in the tabs above'
    })
  }

  if (showCreation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/20 dark:from-midnight-blue dark:via-background dark:to-moonlit-indigo/30 p-8">
        <Button
          variant="ghost"
          onClick={() => setShowCreation(false)}
          className="mb-6 hover:bg-rose-blush/10 dark:hover:bg-moonlit-lavender/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <TeamCreation onTeamCreated={handleTeamCreated} onClose={() => setShowCreation(false)} />
      </div>
    )
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/20 dark:from-midnight-blue dark:via-background dark:to-moonlit-indigo/30 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-rose-blush/30 dark:border-moonlit-lavender/30 shadow-2xl bg-card/90 backdrop-blur-xl">
            <CardHeader className="text-center space-y-6 relative overflow-hidden p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-blush/10 via-transparent to-lavender-mist/10 dark:from-moonlit-violet/20 dark:via-transparent dark:to-moonlit-lavender/20" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="relative"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-blush to-lavender-mist dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center shadow-xl">
                  <Users className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              <div className="relative">
                <CardTitle className="text-5xl font-serif mb-4">Build Your First Team</CardTitle>
                <CardDescription className="text-lg">
                  Start tracking performance, comparing results, and automating reports
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-12">
              <div className="space-y-4">
                <FeatureItem
                  icon={<Users className="w-6 h-6" />}
                  title="Create Teams & Add Members"
                  description="Build teams with leads and members, assign roles and track individual contributions"
                />
                <FeatureItem
                  icon={<ChartBar className="w-6 h-6" />}
                  title="Compare Performance Side-by-Side"
                  description="View multiple teams with visual charts showing trends, success rates, and top performers"
                />
                <FeatureItem
                  icon={<Calendar className="w-6 h-6" />}
                  title="Automated Email Reports"
                  description="Schedule weekly or monthly reports with PDF exports sent directly to your team"
                />
              </div>

              <Button
                onClick={() => setShowCreation(true)}
                className="w-full h-16 text-lg bg-gradient-to-r from-rose-blush to-lavender-mist hover:shadow-2xl dark:from-moonlit-violet dark:to-moonlit-lavender text-white font-semibold"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                Create Your First Team
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/20 dark:from-midnight-blue dark:via-background dark:to-moonlit-indigo/30">
      <div className="container mx-auto p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-serif font-bold mb-2">Team Performance Hub</h1>
            <p className="text-muted-foreground text-lg">
              Track, compare, and optimize team performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <IndustryBenchmarks teams={teams} />
            <MessagingIntegrations teams={teams} />
            <Button
              onClick={() => setShowCreation(true)}
              className="bg-gradient-to-r from-rose-blush to-lavender-mist hover:shadow-xl dark:from-moonlit-violet dark:to-moonlit-lavender text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Team
            </Button>
          </div>
        </motion.div>

        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/70 backdrop-blur-xl p-2 h-auto">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-rose-blush dark:data-[state=active]:bg-moonlit-lavender data-[state=active]:text-white h-14 text-base"
            >
              <Users className="w-5 h-5 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="comparison" 
              className="data-[state=active]:bg-rose-blush dark:data-[state=active]:bg-moonlit-lavender data-[state=active]:text-white h-14 text-base"
            >
              <ChartBar className="w-5 h-5 mr-2" />
              Team Comparison
            </TabsTrigger>
            <TabsTrigger 
              value="scheduler" 
              className="data-[state=active]:bg-rose-blush dark:data-[state=active]:bg-moonlit-lavender data-[state=active]:text-white h-14 text-base"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Email Reports
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {teams.map((team, idx) => (
                  <TeamCard key={team.id} team={team} index={idx} />
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="comparison">
              <motion.div
                key="comparison"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <TeamComparisonView teams={teams} />
              </motion.div>
            </TabsContent>

            <TabsContent value="scheduler">
              <motion.div
                key="scheduler"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <EmailScheduler teams={teams} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  const performance = teamPerformanceService.generateMockTeamData(team.id, team.name)
  const leads = team.members.filter(m => m.role === 'lead')
  const members = team.members.filter(m => m.role === 'member')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-2 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 transition-all duration-300 hover:shadow-xl group">
        <CardHeader
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${team.color}15 0%, transparent 100%)`
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: team.color }}
            >
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-rose-blush/10 dark:bg-moonlit-lavender/10 text-rose-blush dark:text-moonlit-lavender border-0">
                {team.members.length} members
              </Badge>
              <TeamEditor 
                team={team} 
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-blush/10 dark:hover:bg-moonlit-lavender/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-serif group-hover:text-rose-blush dark:group-hover:text-moonlit-lavender transition-colors">
            {team.name}
          </CardTitle>
          {team.description && (
            <CardDescription className="text-sm mt-2">{team.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricBox
              label="Success Rate"
              value={`${performance.metrics.successRate}%`}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MetricBox
              label="Avg Score"
              value={performance.metrics.averageScore}
              icon={<ChartBar className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-border/50">
            {leads.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-rose-gold" />
                <span className="font-medium">{leads.map(l => l.name).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{members.length} team members</span>
            </div>
          </div>

          <TeamEditor 
            team={team}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-2 hover:bg-rose-blush/10 dark:hover:bg-moonlit-lavender/10 hover:border-rose-blush dark:hover:border-moonlit-lavender"
              >
                <Pencil className="w-4 h-4" />
                Edit Team
              </Button>
            }
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MetricBox({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-4 bg-muted/30 rounded-xl">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold font-serif">{value}</div>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/30">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-rose-blush to-lavender-mist dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center text-white">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
