export interface EmailSchedule {
  id: string
  name: string
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  timezone: string
  recipients: string[]
  subject: string
  templateId: string
  lastSent?: string
  nextScheduled: string
  createdAt: string
  chartIds?: string[]
  includeCharts: boolean
  format: 'html' | 'pdf'
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  greeting: string
  bodyFormat: 'summary' | 'detailed' | 'chart-focused'
  includeChart: boolean
  brandingColor: string
  logo?: string
  footer: string
  customStyles?: string
  createdAt: string
}

export interface ScheduledReport {
  scheduleId: string
  sentAt: string
  recipients: string[]
  status: 'sent' | 'failed' | 'pending'
  errorMessage?: string
  chartsIncluded: number
  openRate?: number
}

export const emailScheduleService = {
  createSchedule(schedule: Omit<EmailSchedule, 'id' | 'createdAt' | 'nextScheduled'>): EmailSchedule {
    const id = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const createdAt = new Date().toISOString()
    const nextScheduled = this.calculateNextScheduledTime(schedule)

    return {
      ...schedule,
      id,
      createdAt,
      nextScheduled
    }
  },

  calculateNextScheduledTime(schedule: Partial<EmailSchedule>): string {
    const now = new Date()
    const [hours, minutes] = (schedule.time || '09:00').split(':').map(Number)
    
    const next = new Date(now)
    next.setHours(hours, minutes, 0, 0)

    if (schedule.frequency === 'daily') {
      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }
    } else if (schedule.frequency === 'weekly') {
      const targetDay = schedule.dayOfWeek || 1
      const currentDay = next.getDay()
      let daysToAdd = targetDay - currentDay
      
      if (daysToAdd <= 0 || (daysToAdd === 0 && next <= now)) {
        daysToAdd += 7
      }
      
      next.setDate(next.getDate() + daysToAdd)
    } else if (schedule.frequency === 'monthly') {
      const targetDate = schedule.dayOfMonth || 1
      next.setDate(targetDate)
      
      if (next <= now) {
        next.setMonth(next.getMonth() + 1)
      }
    }

    return next.toISOString()
  },

  generateEmailHTML(template: EmailTemplate, data: any): string {
    const { name, subject, greeting, brandingColor, footer, bodyFormat } = template

    const stats = data.stats || {}
    const charts = data.charts || []

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #f8f4f0 0%, #faf8f6 100%);
      padding: 40px 20px;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, ${brandingColor} 0%, ${this.adjustColorBrightness(brandingColor, -20)} 100%);
      padding: 40px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-family: 'Cormorant', serif;
      font-size: 36px;
      font-weight: 600;
      letter-spacing: 0.02em;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 24px;
      color: #555;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: linear-gradient(135deg, #f8f4f0 0%, #faf8f6 100%);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(224, 136, 170, 0.2);
    }
    .stat-value {
      font-family: 'Cormorant', serif;
      font-size: 36px;
      font-weight: 700;
      color: ${brandingColor};
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .chart-container {
      margin: 30px 0;
      padding: 20px;
      background: #f8f4f0;
      border-radius: 16px;
    }
    .chart-container img {
      width: 100%;
      height: auto;
      border-radius: 12px;
    }
    .chart-title {
      font-family: 'Cormorant', serif;
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }
    .summary-text {
      margin: 20px 0;
      padding: 20px;
      background: #f8f4f0;
      border-left: 4px solid ${brandingColor};
      border-radius: 8px;
      font-size: 15px;
      line-height: 1.7;
    }
    .footer {
      background: #1a1a1a;
      padding: 32px 40px;
      text-align: center;
      color: #999;
      font-size: 14px;
    }
    .footer-logo {
      font-family: 'Cormorant', serif;
      font-size: 24px;
      font-weight: 600;
      color: ${brandingColor};
      margin-bottom: 12px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: ${brandingColor};
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 500;
      margin: 20px 0;
      transition: all 0.3s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(224, 136, 170, 0.3);
    }
    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .header h1 {
        font-size: 28px;
      }
      .content {
        padding: 24px;
      }
    }
    ${template.customStyles || ''}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${name}</h1>
      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <div class="content">
      <div class="greeting">${greeting}</div>
      
      ${bodyFormat === 'summary' || bodyFormat === 'detailed' ? `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.totalTests || 0}</div>
            <div class="stat-label">Total Tests</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.successRate || 0}%</div>
            <div class="stat-label">Success Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.completedModules || 0}</div>
            <div class="stat-label">Modules Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.activeTeams || 0}</div>
            <div class="stat-label">Active Teams</div>
          </div>
        </div>
      ` : ''}
      
      ${charts.length > 0 ? charts.map((chart: any) => `
        <div class="chart-container">
          <div class="chart-title">${chart.title}</div>
          <img src="${chart.dataUrl}" alt="${chart.title}" />
        </div>
      `).join('') : ''}
      
      ${bodyFormat === 'detailed' ? `
        <div class="summary-text">
          <strong>Performance Highlights:</strong><br><br>
          ${data.highlights || 'Your team has shown excellent progress this period. Keep up the great work!'}
        </div>
      ` : ''}
      
      <div style="text-align: center;">
        <a href="#" class="button">View Full Dashboard</a>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-logo">The Sovereign Ecosystem</div>
      <p>${footer}</p>
      <p style="margin-top: 12px; font-size: 12px;">
        © ${new Date().getFullYear()} The Sovereign Ecosystem. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  },

  adjustColorBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1)
  },

  async simulateSendEmail(schedule: EmailSchedule, template: EmailTemplate, data: any): Promise<ScheduledReport> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const html = this.generateEmailHTML(template, data)
    
    console.log('Email Preview:', html)

    return {
      scheduleId: schedule.id,
      sentAt: new Date().toISOString(),
      recipients: schedule.recipients,
      status: 'sent',
      chartsIncluded: data.charts?.length || 0,
      openRate: Math.random() * 100
    }
  },

  checkSchedules(schedules: EmailSchedule[]): EmailSchedule[] {
    const now = new Date()
    
    return schedules.filter(schedule => {
      if (!schedule.enabled) return false
      
      const nextScheduled = new Date(schedule.nextScheduled)
      return nextScheduled <= now
    })
  },

  updateScheduleAfterSend(schedule: EmailSchedule): EmailSchedule {
    return {
      ...schedule,
      lastSent: new Date().toISOString(),
      nextScheduled: this.calculateNextScheduledTime(schedule)
    }
  }
}
