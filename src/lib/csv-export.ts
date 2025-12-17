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

interface ComparisonData {
  session1: TestSession
  session2: TestSession
  durationChange: number
  durationChangePercent: number
  completionChange: number
  accuracyChange: number
  testsRunChange: number
  improvementScore: number
}

export const exportSessionsToCSV = (sessions: TestSession[]): string => {
  if (!sessions || sessions.length === 0) {
    return 'No data to export'
  }

  const headers = [
    'Session ID',
    'User Name',
    'Team ID',
    'Start Time',
    'End Time',
    'Duration (ms)',
    'Duration (formatted)',
    'Completed Modules',
    'Module Count',
    'Total Tests',
    'Passed Tests',
    'Failed Tests',
    'Success Rate (%)',
    'Tests Per Minute'
  ]

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = sessions.map(session => {
    const successRate = session.totalTests > 0 
      ? ((session.passedTests / session.totalTests) * 100).toFixed(2)
      : '0.00'
    
    const testsPerMinute = session.duration > 0
      ? ((session.totalTests / (session.duration / 60000))).toFixed(2)
      : '0.00'

    return [
      escapeCSV(session.id),
      escapeCSV(session.userName || 'Anonymous'),
      escapeCSV(session.teamId || 'N/A'),
      escapeCSV(new Date(session.startTime).toISOString()),
      escapeCSV(new Date(session.endTime).toISOString()),
      escapeCSV(session.duration),
      escapeCSV(formatDuration(session.duration)),
      escapeCSV(session.completedModules.join('; ')),
      escapeCSV(session.completedModules.length),
      escapeCSV(session.totalTests),
      escapeCSV(session.passedTests),
      escapeCSV(session.failedTests),
      escapeCSV(successRate),
      escapeCSV(testsPerMinute)
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

export const exportComparisonToCSV = (comparisons: ComparisonData[]): string => {
  if (!comparisons || comparisons.length === 0) {
    return 'No comparison data to export'
  }

  const headers = [
    'Session 1 ID',
    'Session 1 User',
    'Session 1 Date',
    'Session 1 Duration (ms)',
    'Session 1 Modules',
    'Session 1 Success Rate (%)',
    'Session 2 ID',
    'Session 2 User',
    'Session 2 Date',
    'Session 2 Duration (ms)',
    'Session 2 Modules',
    'Session 2 Success Rate (%)',
    'Duration Change (ms)',
    'Duration Change (%)',
    'Completion Change',
    'Accuracy Change (%)',
    'Tests Run Change',
    'Improvement Score'
  ]

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = comparisons.map(comp => {
    const successRate1 = comp.session1.totalTests > 0
      ? ((comp.session1.passedTests / comp.session1.totalTests) * 100).toFixed(2)
      : '0.00'
    
    const successRate2 = comp.session2.totalTests > 0
      ? ((comp.session2.passedTests / comp.session2.totalTests) * 100).toFixed(2)
      : '0.00'

    return [
      escapeCSV(comp.session1.id),
      escapeCSV(comp.session1.userName || 'Anonymous'),
      escapeCSV(new Date(comp.session1.startTime).toLocaleDateString()),
      escapeCSV(comp.session1.duration),
      escapeCSV(comp.session1.completedModules.length),
      escapeCSV(successRate1),
      escapeCSV(comp.session2.id),
      escapeCSV(comp.session2.userName || 'Anonymous'),
      escapeCSV(new Date(comp.session2.startTime).toLocaleDateString()),
      escapeCSV(comp.session2.duration),
      escapeCSV(comp.session2.completedModules.length),
      escapeCSV(successRate2),
      escapeCSV(comp.durationChange),
      escapeCSV(comp.durationChangePercent.toFixed(2)),
      escapeCSV(comp.completionChange),
      escapeCSV(comp.accuracyChange.toFixed(2)),
      escapeCSV(comp.testsRunChange),
      escapeCSV(comp.improvementScore)
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

export const exportLeaderboardToCSV = (
  leaderboard: Array<{
    userName: string
    teamId?: string
    rank: number
    fastestCompletion: number
    totalModulesCompleted: number
    totalTestsRun: number
    totalTestsPassed: number
    averageCompletionTime: number
    successRate: number
    sessions: number
    badges: string[]
  }>
): string => {
  if (!leaderboard || leaderboard.length === 0) {
    return 'No leaderboard data to export'
  }

  const headers = [
    'Rank',
    'User Name',
    'Team ID',
    'Fastest Completion (ms)',
    'Average Completion (ms)',
    'Total Modules Completed',
    'Total Tests Run',
    'Total Tests Passed',
    'Success Rate (%)',
    'Total Sessions',
    'Badges'
  ]

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = leaderboard.map(entry => {
    return [
      escapeCSV(entry.rank),
      escapeCSV(entry.userName),
      escapeCSV(entry.teamId || 'N/A'),
      escapeCSV(entry.fastestCompletion),
      escapeCSV(entry.averageCompletionTime),
      escapeCSV(entry.totalModulesCompleted),
      escapeCSV(entry.totalTestsRun),
      escapeCSV(entry.totalTestsPassed),
      escapeCSV(entry.successRate.toFixed(2)),
      escapeCSV(entry.sessions),
      escapeCSV(entry.badges.join('; '))
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
