import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Team, teamPerformanceService, TeamPerformance, TeamComparison, PDFBranding } from '@/lib/team-performance-service'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DownloadSimple, Trophy, TrendUp, TrendDown, Users, Target, Clock, ChartLine } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function TeamComparisonView() {
  const [teams] = useKV<Team[]>('teams', [])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [comparison, setComparison] = useState<TeamComparison | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const selectedTeams = (teams || []).filter(t => selectedTeamIds.includes(t.id))

  useEffect(() => {
    if (selectedTeamIds.length > 0 && teams) {
      const teamsToCompare = teams.filter(t => selectedTeamIds.includes(t.id))
      const comparisonData = teamPerformanceService.compareTeams(teamsToCompare)
      setComparison(comparisonData)
    } else {
      setComparison(null)
    }
  }, [selectedTeamIds, teams])

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }

  const exportToPDF = async () => {
    if (!comparison) return

    setIsExporting(true)
    toast.loading('Generating PDF...', { id: 'pdf-export' })

    try {
      const chartDataUrls: { title: string; dataUrl: string }[] = []
      
      for (const [key, ref] of Object.entries(chartRefs.current)) {
        if (ref) {
          const canvas = document.createElement('canvas')
          canvas.width = 1200
          canvas.height = 400
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            const dataUrl = canvas.toDataURL('image/png')
            chartDataUrls.push({ title: key, dataUrl })
          }
        }
      }

      const branding: PDFBranding = {
        companyName: 'The Sovereign Ecosystem',
        primaryColor: '#E088AA',
        secondaryColor: '#BA94DA',
        accentColor: '#F7E7CE',
        tagline: 'Excellence Through Insight',
        contactInfo: 'Performance Analytics Division'
      }

      const pdfDataUrl = await teamPerformanceService.exportToPDF(
        comparison,
        branding,
        chartDataUrls
      )

      await teamPerformanceService.downloadPDF(pdfDataUrl, 'team-comparison-report')
      
      toast.success('PDF exported successfully!', { id: 'pdf-export' })
    } catch (error) {
      console.error('PDF export failed:', error)
      toast.error('Failed to export PDF', { id: 'pdf-export' })
    } finally {
      setIsExporting(false)
    }
  }

  if (!teams || teams.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">No Teams Available</h3>
          <p className="text-muted-foreground text-center">
            Create teams first to view comparison data
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-foreground">Team Comparison</h2>
          <p className="text-muted-foreground mt-1">Compare performance metrics across multiple teams</p>
        </div>
        
        {comparison && (
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            className="gap-2"
          >
            <DownloadSimple className="w-5 h-5" />
            {isExporting ? 'Exporting...' : 'Export to PDF'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Select Teams to Compare</CardTitle>
          <CardDescription>Choose at least 2 teams to view comparison data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => toggleTeam(team.id)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${selectedTeamIds.includes(team.id)
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{ backgroundColor: team.color }}
                />
                <div className="flex items-start justify-between mt-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {team.members.length} members
                    </p>
                  </div>
                  {selectedTeamIds.includes(team.id) && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: team.color }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {comparison && selectedTeams.length >= 2 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" weight="fill" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {comparison.insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{idx + 1}</span>
                    </div>
                    <p className="text-sm">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {comparison.comparisonMetrics.map((metric) => (
              <Card key={metric.metric}>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">{metric.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metric.teams.map((team, idx) => {
                      const teamColor = selectedTeams.find(t => t.id === team.teamId)?.color || '#E088AA'
                      const isTop3 = idx < 3
                      const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
                      
                      return (
                        <div
                          key={team.teamId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                        >
                          <div
                            className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                              ${isTop3 ? 'shadow-lg' : ''}
                            `}
                            style={{
                              backgroundColor: isTop3 ? medalColors[idx] : teamColor
                            }}
                          >
                            {team.rank}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{team.teamName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold font-serif" style={{ color: teamColor }}>
                              {team.value}{metric.metric.includes('Rate') ? '%' : ''}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <ChartLine className="w-6 h-6 text-primary" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tests" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tests">Tests Completed</TabsTrigger>
                  <TabsTrigger value="success">Success Rate</TabsTrigger>
                  <TabsTrigger value="scores">Average Score</TabsTrigger>
                </TabsList>

                <TabsContent value="tests" className="mt-6">
                  <div
                    ref={(el) => chartRefs.current['tests-completed'] = el}
                    className="w-full h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                          dataKey="label"
                          data={comparison.teams[0]?.trends.labels || []}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        {comparison.teams.map((team) => {
                          const teamColor = selectedTeams.find(t => t.id === team.teamId)?.color || '#E088AA'
                          const data = team.trends.labels.map((label, idx) => ({
                            label,
                            value: team.trends.testsCompleted[idx]
                          }))
                          
                          return (
                            <Line
                              key={team.teamId}
                              data={data}
                              type="monotone"
                              dataKey="value"
                              name={team.teamName}
                              stroke={teamColor}
                              strokeWidth={3}
                              dot={{ fill: teamColor, r: 4 }}
                            />
                          )
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="success" className="mt-6">
                  <div
                    ref={(el) => chartRefs.current['success-rate'] = el}
                    className="w-full h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                          dataKey="label"
                          data={comparison.teams[0]?.trends.labels || []}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} unit="%" />
                        <Tooltip />
                        <Legend />
                        {comparison.teams.map((team) => {
                          const teamColor = selectedTeams.find(t => t.id === team.teamId)?.color || '#E088AA'
                          const data = team.trends.labels.map((label, idx) => ({
                            label,
                            value: team.trends.successRates[idx]
                          }))
                          
                          return (
                            <Line
                              key={team.teamId}
                              data={data}
                              type="monotone"
                              dataKey="value"
                              name={team.teamName}
                              stroke={teamColor}
                              strokeWidth={3}
                              dot={{ fill: teamColor, r: 4 }}
                            />
                          )
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="scores" className="mt-6">
                  <div
                    ref={(el) => chartRefs.current['average-score'] = el}
                    className="w-full h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                          dataKey="label"
                          data={comparison.teams[0]?.trends.labels || []}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        {comparison.teams.map((team) => {
                          const teamColor = selectedTeams.find(t => t.id === team.teamId)?.color || '#E088AA'
                          const data = team.trends.labels.map((label, idx) => ({
                            label,
                            value: team.trends.scores[idx]
                          }))
                          
                          return (
                            <Line
                              key={team.teamId}
                              data={data}
                              type="monotone"
                              dataKey="value"
                              name={team.teamName}
                              stroke={teamColor}
                              strokeWidth={3}
                              dot={{ fill: teamColor, r: 4 }}
                            />
                          )
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {selectedTeamIds.length > 0 && selectedTeamIds.length < 2 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">Select More Teams</h3>
            <p className="text-muted-foreground text-center">
              Select at least 2 teams to view comparison data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
