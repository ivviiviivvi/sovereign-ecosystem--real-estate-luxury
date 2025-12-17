import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, Award, CheckCircle2, Calendar, Clock, User, 
  FileText, Sparkles, Trophy, Share2, Copy
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface TestSession {
  startTime: string
  endTime: string
  completedModules: string[]
  audioEnabled: boolean
  notes: string[]
}

interface TestModule {
  id: string
  title: string
  duration: string
  features: string[]
}

interface TestCompletionCertificateProps {
  session: TestSession
  modules: TestModule[]
  userName?: string
}

export function TestCompletionCertificate({ 
  session, 
  modules,
  userName = 'Testing Professional'
}: TestCompletionCertificateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  const completedModules = modules.filter(m => 
    session.completedModules.includes(m.id)
  )

  const getSessionDuration = () => {
    const start = new Date(session.startTime)
    const end = new Date(session.endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return { hours, mins, total: diffMins }
  }

  const duration = getSessionDuration()
  const completionRate = (completedModules.length / modules.length) * 100
  const certificateId = `CERT-${Date.now()}-${session.startTime.slice(-4)}`

  const downloadAsPDF = async () => {
    setIsGenerating(true)
    soundManager.play('glassTap')
    
    try {
      const element = certificateRef.current
      if (!element) throw new Error('Certificate element not found')

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      const scale = 2
      canvas.width = element.offsetWidth * scale
      canvas.height = element.offsetHeight * scale
      ctx.scale(scale, scale)

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL('image/png')
      
      const link = document.createElement('a')
      link.download = `test-completion-certificate-${certificateId}.png`
      link.href = dataUrl
      link.click()

      soundManager.play('success')
      toast.success('Certificate downloaded', {
        description: 'Your certificate has been saved as an image'
      })
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download certificate', {
        description: 'Please try again'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadAsHTML = () => {
    soundManager.play('glassTap')

    const html = generateCertificateHTML()
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.download = `test-completion-certificate-${certificateId}.html`
    link.href = url
    link.click()
    
    URL.revokeObjectURL(url)

    soundManager.play('success')
    toast.success('Certificate downloaded', {
      description: 'Your certificate has been saved as HTML'
    })
  }

  const copyToClipboard = async () => {
    soundManager.play('glassTap')

    try {
      const text = `
Test Completion Certificate
${certificateId}

This certifies that ${userName} has successfully completed testing of:
${completedModules.map(m => `• ${m.title}`).join('\n')}

Completion Rate: ${completionRate.toFixed(0)}%
Duration: ${duration.hours}h ${duration.mins}m
Date: ${new Date(session.endTime).toLocaleDateString()}

Verified by The Sovereign Ecosystem Testing Dashboard
      `.trim()

      await navigator.clipboard.writeText(text)
      soundManager.play('success')
      toast.success('Certificate copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy certificate')
    }
  }

  const generateCertificateHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Completion Certificate - ${certificateId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #f5f1ef 0%, #e8dff5 100%);
      padding: 40px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .certificate {
      background: white;
      max-width: 900px;
      padding: 60px;
      border: 20px solid #c984a6;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      position: relative;
    }
    .certificate::before {
      content: '';
      position: absolute;
      inset: 10px;
      border: 2px solid #e8b4d0;
      border-radius: 4px;
      pointer-events: none;
    }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 48px; margin-bottom: 10px; }
    .title {
      font-size: 42px;
      color: #c984a6;
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 18px;
      color: #666;
      font-style: italic;
    }
    .content {
      text-align: center;
      margin: 40px 0;
      line-height: 2;
    }
    .name {
      font-size: 36px;
      color: #2d2d2d;
      font-weight: bold;
      margin: 20px 0;
      text-decoration: underline;
      text-decoration-color: #c984a6;
      text-underline-offset: 8px;
    }
    .description {
      font-size: 18px;
      color: #555;
      margin: 30px 0;
    }
    .modules {
      text-align: left;
      margin: 30px auto;
      max-width: 600px;
    }
    .module-item {
      padding: 12px 20px;
      margin: 10px 0;
      background: #f9f5f7;
      border-left: 4px solid #c984a6;
      border-radius: 4px;
      font-size: 16px;
      color: #333;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin: 40px 0;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #c984a6;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e8b4d0;
    }
    .cert-id {
      font-size: 12px;
      color: #999;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }
    .date {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }
    .signature {
      margin-top: 40px;
      display: flex;
      justify-content: space-around;
    }
    .signature-line {
      text-align: center;
    }
    .line {
      width: 200px;
      height: 2px;
      background: #c984a6;
      margin: 20px auto 10px;
    }
    .signature-title {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    @media print {
      body { background: white; padding: 0; }
      .certificate { border-width: 10px; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">🏆</div>
      <h1 class="title">Certificate of Completion</h1>
      <p class="subtitle">Testing Excellence Achievement</p>
    </div>

    <div class="content">
      <p class="description">This certifies that</p>
      <h2 class="name">${userName}</h2>
      <p class="description">has successfully completed comprehensive testing of</p>
      
      <div class="modules">
        ${completedModules.map(m => `
          <div class="module-item">
            ✓ ${m.title}
          </div>
        `).join('')}
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${completionRate.toFixed(0)}%</div>
          <div class="stat-label">Completion</div>
        </div>
        <div class="stat">
          <div class="stat-value">${completedModules.length}</div>
          <div class="stat-label">Modules</div>
        </div>
        <div class="stat">
          <div class="stat-value">${duration.hours}h ${duration.mins}m</div>
          <div class="stat-label">Duration</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="cert-id">Certificate ID: ${certificateId}</div>
      <div class="date">Issued on ${new Date(session.endTime).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
      
      <div class="signature">
        <div class="signature-line">
          <div class="line"></div>
          <div class="signature-title">Testing Dashboard</div>
        </div>
        <div class="signature-line">
          <div class="line"></div>
          <div class="signature-title">Verification</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-3 bg-gradient-to-r from-rose-blush via-rose-gold to-champagne-soft dark:from-moonlit-violet dark:via-moonlit-lavender dark:to-moonlit-silver text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => {
            soundManager.play('success')
            toast.success('Certificate unlocked!', {
              description: 'Download your achievement certificate'
            })
          }}
        >
          <Trophy className="w-5 h-5" />
          Get Certificate
          <Sparkles className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Award className="w-6 h-6 text-white" />
            </motion.div>
            Test Completion Certificate
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div 
              ref={certificateRef}
              className="bg-gradient-to-br from-white to-pearl-white dark:from-card dark:to-card/80 p-12 rounded-3xl border-8 border-rose-blush dark:border-moonlit-lavender relative overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-4 border-2 border-rose-blush/30 dark:border-moonlit-lavender/30 rounded-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <motion.div
                    className="inline-block text-6xl mb-4"
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🏆
                  </motion.div>
                  <h2 className="text-4xl font-serif text-rose-blush dark:text-moonlit-lavender mb-2 tracking-wider">
                    Certificate of Completion
                  </h2>
                  <p className="text-lg text-muted-foreground italic">
                    Testing Excellence Achievement
                  </p>
                </div>

                <div className="text-center space-y-6 my-12">
                  <p className="text-lg text-foreground">This certifies that</p>
                  <h3 className="text-5xl font-serif font-bold text-foreground underline decoration-rose-blush dark:decoration-moonlit-lavender decoration-2 underline-offset-8">
                    {userName}
                  </h3>
                  <p className="text-lg text-foreground">
                    has successfully completed comprehensive testing of
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-3 my-8">
                  {completedModules.map((module, idx) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-rose-blush/5 dark:bg-moonlit-lavender/5 border-l-4 border-rose-blush dark:border-moonlit-lavender rounded-r-xl"
                    >
                      <CheckCircle2 className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{module.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {module.features.length} features tested • {module.duration}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center gap-12 my-12">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-rose-blush dark:text-moonlit-lavender">
                      {completionRate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
                      Completion
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-rose-blush dark:text-moonlit-lavender">
                      {completedModules.length}
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
                      Modules
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-rose-blush dark:text-moonlit-lavender">
                      {duration.hours}h {duration.mins}m
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
                      Duration
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
                    <FileText className="w-3 h-3" />
                    Certificate ID: {certificateId}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Issued on {new Date(session.endTime).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>

                  <div className="flex justify-center gap-20 mt-8">
                    <div className="text-center">
                      <div className="w-48 h-0.5 bg-rose-blush dark:bg-moonlit-lavender mb-2" />
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">
                        Testing Dashboard
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-48 h-0.5 bg-rose-blush dark:bg-moonlit-lavender mb-2" />
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">
                        Verification
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6 bg-muted/30">
              <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                Download Certificate
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={downloadAsHTML}
                  variant="outline"
                  className="gap-2 hover:bg-rose-blush/10 dark:hover:bg-moonlit-lavender/10 hover:border-rose-blush/30 dark:hover:border-moonlit-lavender/30"
                >
                  <FileText className="w-4 h-4" />
                  Download HTML
                </Button>

                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="gap-2 hover:bg-rose-blush/10 dark:hover:bg-moonlit-lavender/10 hover:border-rose-blush/30 dark:hover:border-moonlit-lavender/30"
                >
                  <Copy className="w-4 h-4" />
                  Copy Text
                </Button>

                <Button
                  onClick={() => {
                    soundManager.play('glassTap')
                    toast.info('Share feature coming soon')
                  }}
                  variant="outline"
                  className="gap-2 hover:bg-rose-blush/10 dark:hover:bg-moonlit-lavender/10 hover:border-rose-blush/30 dark:hover:border-moonlit-lavender/30"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Your certificate is saved automatically. Download or share it anytime.
              </p>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
