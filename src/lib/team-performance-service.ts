export interface Team {
  id: string
  name: string
  color: string
  members: TeamMember[]
  createdAt: string
  description?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'lead' | 'member'
  joinedAt: string
  avatar?: string
}

export interface TeamPerformance {
  teamId: string
  teamName: string
  period: string
  metrics: {
    totalTests: number
    completedTests: number
    successRate: number
    averageScore: number
    totalModules: number
    completedModules: number
    activeMembers: number
    totalTimeSpent: number
    improvementRate: number
  }
  trends: {
    testsCompleted: number[]
    successRates: number[]
    scores: number[]
    labels: string[]
  }
  topPerformers: {
    memberId: string
    memberName: string
    score: number
    completedTests: number
  }[]
  weakAreas: {
    module: string
    averageScore: number
    attempts: number
  }[]
}

export interface TeamComparison {
  teams: TeamPerformance[]
  period: string
  comparisonMetrics: {
    metric: string
    teams: {
      teamId: string
      teamName: string
      value: number
      rank: number
    }[]
  }[]
  insights: string[]
}

export interface PDFBranding {
  companyName: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  tagline?: string
  contactInfo?: string
}

export const teamPerformanceService = {
  generateMockTeamData(teamId: string, teamName: string): TeamPerformance {
    const weeks = 12
    const labels = Array.from({ length: weeks }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (weeks - i - 1) * 7)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const testsCompleted = Array.from({ length: weeks }, () => 
      Math.floor(Math.random() * 50) + 20
    )
    
    const successRates = Array.from({ length: weeks }, () => 
      Math.floor(Math.random() * 30) + 60
    )
    
    const scores = Array.from({ length: weeks }, () => 
      Math.floor(Math.random() * 30) + 65
    )

    return {
      teamId,
      teamName,
      period: `Last ${weeks} Weeks`,
      metrics: {
        totalTests: testsCompleted.reduce((a, b) => a + b, 0),
        completedTests: testsCompleted[testsCompleted.length - 1],
        successRate: Math.round(successRates.reduce((a, b) => a + b, 0) / weeks),
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / weeks),
        totalModules: 24,
        completedModules: Math.floor(Math.random() * 10) + 14,
        activeMembers: Math.floor(Math.random() * 15) + 5,
        totalTimeSpent: Math.floor(Math.random() * 500) + 200,
        improvementRate: Math.floor(Math.random() * 30) + 5
      },
      trends: {
        testsCompleted,
        successRates,
        scores,
        labels
      },
      topPerformers: Array.from({ length: 5 }, (_, i) => ({
        memberId: `member-${i + 1}`,
        memberName: `Team Member ${i + 1}`,
        score: Math.floor(Math.random() * 30) + 70,
        completedTests: Math.floor(Math.random() * 50) + 20
      })).sort((a, b) => b.score - a.score),
      weakAreas: [
        { module: 'AR Measurements', averageScore: Math.floor(Math.random() * 20) + 60, attempts: Math.floor(Math.random() * 50) + 30 },
        { module: 'Collaboration Tools', averageScore: Math.floor(Math.random() * 20) + 65, attempts: Math.floor(Math.random() * 40) + 25 },
        { module: 'Offline Sync', averageScore: Math.floor(Math.random() * 20) + 70, attempts: Math.floor(Math.random() * 30) + 20 }
      ].sort((a, b) => a.averageScore - b.averageScore)
    }
  },

  compareTeams(teams: Team[]): TeamComparison {
    const performances = teams.map(team => 
      this.generateMockTeamData(team.id, team.name)
    )

    const comparisonMetrics = [
      {
        metric: 'Success Rate',
        teams: performances.map((p, idx) => ({
          teamId: p.teamId,
          teamName: p.teamName,
          value: p.metrics.successRate,
          rank: idx + 1
        })).sort((a, b) => b.value - a.value).map((t, idx) => ({ ...t, rank: idx + 1 }))
      },
      {
        metric: 'Average Score',
        teams: performances.map((p, idx) => ({
          teamId: p.teamId,
          teamName: p.teamName,
          value: p.metrics.averageScore,
          rank: idx + 1
        })).sort((a, b) => b.value - a.value).map((t, idx) => ({ ...t, rank: idx + 1 }))
      },
      {
        metric: 'Completed Tests',
        teams: performances.map((p, idx) => ({
          teamId: p.teamId,
          teamName: p.teamName,
          value: p.metrics.totalTests,
          rank: idx + 1
        })).sort((a, b) => b.value - a.value).map((t, idx) => ({ ...t, rank: idx + 1 }))
      },
      {
        metric: 'Improvement Rate',
        teams: performances.map((p, idx) => ({
          teamId: p.teamId,
          teamName: p.teamName,
          value: p.metrics.improvementRate,
          rank: idx + 1
        })).sort((a, b) => b.value - a.value).map((t, idx) => ({ ...t, rank: idx + 1 }))
      }
    ]

    const topTeam = performances.reduce((prev, current) => 
      (prev.metrics.successRate > current.metrics.successRate) ? prev : current
    )

    const insights = [
      `${topTeam.teamName} leads with ${topTeam.metrics.successRate}% success rate`,
      `Average improvement across all teams: ${Math.round(performances.reduce((sum, p) => sum + p.metrics.improvementRate, 0) / performances.length)}%`,
      `Total tests completed: ${performances.reduce((sum, p) => sum + p.metrics.totalTests, 0)}`,
      `Most active team: ${performances.reduce((prev, current) => 
        (prev.metrics.activeMembers > current.metrics.activeMembers) ? prev : current
      ).teamName}`
    ]

    return {
      teams: performances,
      period: performances[0]?.period || 'Last 12 Weeks',
      comparisonMetrics,
      insights
    }
  },

  async exportToPDF(
    performance: TeamPerformance | TeamComparison,
    branding: PDFBranding,
    chartDataUrls: { title: string; dataUrl: string }[]
  ): Promise<string> {
    const isComparison = 'teams' in performance
    
    const canvas = document.createElement('canvas')
    canvas.width = 2100
    canvas.height = 2970
    const ctx = canvas.getContext('2d')
    
    if (!ctx) throw new Error('Canvas context not available')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 400)
    gradient.addColorStop(0, branding.primaryColor)
    gradient.addColorStop(1, branding.secondaryColor)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, 400)

    ctx.font = 'bold 72px Cormorant, serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText(branding.companyName, canvas.width / 2, 150)

    if (branding.tagline) {
      ctx.font = '32px Outfit, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillText(branding.tagline, canvas.width / 2, 220)
    }

    ctx.font = 'bold 56px Cormorant, serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(
      isComparison ? 'Team Performance Comparison Report' : `${(performance as TeamPerformance).teamName} Performance Report`,
      canvas.width / 2,
      320
    )

    ctx.font = '28px Outfit, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.fillText(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      canvas.width / 2,
      370
    )

    let yOffset = 480

    if (isComparison) {
      const comparison = performance as TeamComparison

      ctx.font = 'bold 40px Cormorant, serif'
      ctx.fillStyle = '#1a1a1a'
      ctx.textAlign = 'left'
      ctx.fillText('Executive Summary', 100, yOffset)
      yOffset += 60

      comparison.insights.forEach((insight, idx) => {
        ctx.font = '28px Outfit, sans-serif'
        ctx.fillStyle = '#555'
        ctx.fillText(`• ${insight}`, 120, yOffset)
        yOffset += 50
      })

      yOffset += 40

      ctx.font = 'bold 40px Cormorant, serif'
      ctx.fillStyle = '#1a1a1a'
      ctx.fillText('Performance Metrics', 100, yOffset)
      yOffset += 80

      comparison.comparisonMetrics.forEach(metric => {
        ctx.font = 'bold 32px Outfit, sans-serif'
        ctx.fillStyle = branding.accentColor
        ctx.fillText(metric.metric, 120, yOffset)
        yOffset += 50

        metric.teams.slice(0, 3).forEach((team, idx) => {
          const medalColor = idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'
          
          ctx.beginPath()
          ctx.arc(150, yOffset - 10, 20, 0, Math.PI * 2)
          ctx.fillStyle = medalColor
          ctx.fill()
          
          ctx.font = 'bold 24px Outfit, sans-serif'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.fillText(team.rank.toString(), 150, yOffset)
          
          ctx.font = '26px Outfit, sans-serif'
          ctx.fillStyle = '#333'
          ctx.textAlign = 'left'
          ctx.fillText(`${team.teamName}: ${team.value}${metric.metric.includes('Rate') ? '%' : ''}`, 200, yOffset)
          yOffset += 45
        })

        yOffset += 30
      })
    } else {
      const single = performance as TeamPerformance

      ctx.font = 'bold 40px Cormorant, serif'
      ctx.fillStyle = '#1a1a1a'
      ctx.textAlign = 'left'
      ctx.fillText('Key Metrics', 100, yOffset)
      yOffset += 80

      const metrics = [
        { label: 'Total Tests', value: single.metrics.totalTests },
        { label: 'Success Rate', value: `${single.metrics.successRate}%` },
        { label: 'Average Score', value: single.metrics.averageScore },
        { label: 'Completed Modules', value: `${single.metrics.completedModules}/${single.metrics.totalModules}` },
        { label: 'Active Members', value: single.metrics.activeMembers },
        { label: 'Improvement Rate', value: `+${single.metrics.improvementRate}%` }
      ]

      const cardWidth = 620
      const cardHeight = 200
      const cardsPerRow = 3
      const cardSpacing = 40

      metrics.forEach((metric, idx) => {
        const row = Math.floor(idx / cardsPerRow)
        const col = idx % cardsPerRow
        const x = 100 + col * (cardWidth + cardSpacing)
        const y = yOffset + row * (cardHeight + cardSpacing)

        const cardGradient = ctx.createLinearGradient(x, y, x + cardWidth, y + cardHeight)
        cardGradient.addColorStop(0, 'rgba(224, 136, 170, 0.1)')
        cardGradient.addColorStop(1, 'rgba(186, 148, 218, 0.1)')
        ctx.fillStyle = cardGradient
        ctx.fillRect(x, y, cardWidth, cardHeight)

        ctx.strokeStyle = branding.accentColor
        ctx.lineWidth = 3
        ctx.strokeRect(x, y, cardWidth, cardHeight)

        ctx.font = 'bold 56px Cormorant, serif'
        ctx.fillStyle = branding.primaryColor
        ctx.textAlign = 'center'
        ctx.fillText(metric.value.toString(), x + cardWidth / 2, y + 90)

        ctx.font = '24px Outfit, sans-serif'
        ctx.fillStyle = '#666'
        ctx.fillText(metric.label, x + cardWidth / 2, y + 140)
      })

      yOffset += Math.ceil(metrics.length / cardsPerRow) * (cardHeight + cardSpacing) + 80

      ctx.font = 'bold 40px Cormorant, serif'
      ctx.fillStyle = '#1a1a1a'
      ctx.textAlign = 'left'
      ctx.fillText('Top Performers', 100, yOffset)
      yOffset += 60

      single.topPerformers.slice(0, 5).forEach((performer, idx) => {
        const barWidth = 1500
        const barHeight = 50
        const maxScore = 100
        const fillWidth = (performer.score / maxScore) * barWidth

        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)'
        ctx.fillRect(200, yOffset - 35, barWidth, barHeight)

        const barGradient = ctx.createLinearGradient(200, yOffset - 35, 200 + fillWidth, yOffset - 35 + barHeight)
        barGradient.addColorStop(0, branding.primaryColor)
        barGradient.addColorStop(1, branding.accentColor)
        ctx.fillStyle = barGradient
        ctx.fillRect(200, yOffset - 35, fillWidth, barHeight)

        ctx.font = 'bold 28px Outfit, sans-serif'
        ctx.fillStyle = '#1a1a1a'
        ctx.textAlign = 'left'
        ctx.fillText(`${idx + 1}. ${performer.memberName}`, 200, yOffset - 50)

        ctx.font = '24px Outfit, sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'right'
        ctx.fillText(`${performer.score}`, 200 + fillWidth - 20, yOffset - 5)

        yOffset += 90
      })
    }

    if (chartDataUrls.length > 0 && yOffset < 2500) {
      yOffset = Math.max(yOffset, 1800)
      
      ctx.font = 'bold 40px Cormorant, serif'
      ctx.fillStyle = '#1a1a1a'
      ctx.textAlign = 'left'
      ctx.fillText('Performance Charts', 100, yOffset)
      yOffset += 60

      for (const chartData of chartDataUrls.slice(0, 2)) {
        try {
          const img = new Image()
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = chartData.dataUrl
          })

          const chartWidth = 1900
          const chartHeight = 400
          ctx.drawImage(img, 100, yOffset, chartWidth, chartHeight)
          yOffset += chartHeight + 40
        } catch (error) {
          console.error('Failed to load chart image:', error)
        }
      }
    }

    ctx.fillStyle = branding.primaryColor
    ctx.fillRect(0, 2870, canvas.width, 100)

    ctx.font = '24px Outfit, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText(branding.contactInfo || 'Generated by The Sovereign Ecosystem', canvas.width / 2, 2925)

    ctx.font = '20px Outfit, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText(`© ${new Date().getFullYear()} ${branding.companyName}. All rights reserved.`, canvas.width / 2, 2955)

    return canvas.toDataURL('image/png', 0.95)
  },

  async downloadPDF(dataUrl: string, filename: string) {
    const link = document.createElement('a')
    link.download = `${filename}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  calculateTrends(performances: TeamPerformance[]): {
    metric: string
    trend: 'up' | 'down' | 'stable'
    change: number
  }[] {
    return [
      {
        metric: 'Success Rate',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.floor(Math.random() * 20) - 5
      },
      {
        metric: 'Test Completion',
        trend: Math.random() > 0.3 ? 'up' : 'down',
        change: Math.floor(Math.random() * 30) - 10
      },
      {
        metric: 'Team Engagement',
        trend: Math.random() > 0.6 ? 'up' : 'stable',
        change: Math.floor(Math.random() * 15)
      }
    ]
  }
}
