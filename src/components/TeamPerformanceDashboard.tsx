import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Button } from './ui/button'
import { TeamManager } from './TeamManager'
import { TeamComparisonView } from './TeamComparisonView'
import { EmailScheduler } from './EmailScheduler'
import { Team } from '@/lib/team-performance-service'
import {
  Users,
  ChartBar,
  EnvelopeSimple,
  ArrowLeft,
  Trophy,
  Target,
  Lightning
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function TeamPerformanceDashboard({ onBack }: { onBack: () => void }) {
  const [teams] = useKV<Team[]>('teams', [])
  const [activeTab, setActiveTab] = useState('teams')

  const stats = {
    totalTeams: (teams || []).length,
    totalMembers: (teams || []).reduce((sum, team) => sum + team.members.length, 0),
    activeLeads: (teams || []).reduce(
      (sum, team) => sum + team.members.filter(m => m.role === 'lead').length,
      0
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/20 dark:from-midnight-blue dark:via-background dark:to-moonlit-indigo/30">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground">
                Team Performance Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage teams, compare performance, and automate reports
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Teams</p>
                    <p className="text-3xl font-bold font-serif text-primary mt-1">
                      {stats.totalTeams}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" weight="fill" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-3xl font-bold font-serif text-blue-600 mt-1">
                      {stats.totalMembers}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" weight="fill" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Leads</p>
                    <p className="text-3xl font-bold font-serif text-amber-600 mt-1">
                      {stats.activeLeads}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-600/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-amber-600" weight="fill" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="teams" className="gap-2">
                  <Users className="w-5 h-5" />
                  <span className="hidden sm:inline">Team Management</span>
                  <span className="sm:hidden">Teams</span>
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2">
                  <ChartBar className="w-5 h-5" />
                  <span className="hidden sm:inline">Performance Comparison</span>
                  <span className="sm:hidden">Compare</span>
                </TabsTrigger>
                <TabsTrigger value="scheduler" className="gap-2">
                  <EnvelopeSimple className="w-5 h-5" />
                  <span className="hidden sm:inline">Email Scheduler</span>
                  <span className="sm:hidden">Email</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teams" className="space-y-6">
                <TeamManager />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <TeamComparisonView />
              </TabsContent>

              <TabsContent value="scheduler" className="space-y-6">
                <EmailScheduler />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Lightning className="w-6 h-6 text-primary" weight="fill" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab('teams')}
              >
                <Users className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">Create Team</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Set up a new team
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab('comparison')}
                disabled={(teams || []).length < 2}
              >
                <ChartBar className="w-8 h-8 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold">Compare Teams</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    View performance data
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab('scheduler')}
              >
                <EnvelopeSimple className="w-8 h-8 text-green-600" />
                <div className="text-center">
                  <div className="font-semibold">Schedule Report</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Automate email reports
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab('comparison')}
                disabled={(teams || []).length === 0}
              >
                <Trophy className="w-8 h-8 text-amber-600" />
                <div className="text-center">
                  <div className="font-semibold">Export PDF</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Download reports
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
