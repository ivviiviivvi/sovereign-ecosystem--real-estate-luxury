import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { 
  Download, Mail, FileText, Share2, Copy, Check, Send, 
  FileSpreadsheet, FileJson, Image, Calendar, MapPin, Home
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface Measurement {
  id: string
  start: { x: number; y: number }
  end: { x: number; y: number }
  distance: number
  label?: string
}

interface MeasurementExportProps {
  measurements: Measurement[]
  property: Property
  scaleFactor: number
  snapshotDataUrl?: string
}

export function MeasurementExport({ 
  measurements, 
  property, 
  scaleFactor,
  snapshotDataUrl 
}: MeasurementExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateMeasurementReport = () => {
    const timestamp = new Date().toLocaleString()
    const totalMeasurements = measurements.length
    
    const report = {
      property: {
        title: property.title,
        address: `${property.address}, ${property.city}, ${property.state} ${property.zip}`,
        details: `${property.bedrooms} bed • ${property.bathrooms} bath • ${property.sqft} sq ft`,
        yearBuilt: property.yearBuilt,
        price: `$${property.price.toLocaleString()}`
      },
      measurements: measurements.map((m, idx) => ({
        id: m.id,
        number: idx + 1,
        label: m.label || `Measurement ${idx + 1}`,
        lengthFeet: (m.distance * scaleFactor).toFixed(2),
        lengthInches: ((m.distance * scaleFactor) * 12).toFixed(1),
        lengthMeters: ((m.distance * scaleFactor) * 0.3048).toFixed(2),
        startPoint: `(${m.start.x.toFixed(0)}, ${m.start.y.toFixed(0)})`,
        endPoint: `(${m.end.x.toFixed(0)}, ${m.end.y.toFixed(0)})`
      })),
      summary: {
        totalMeasurements,
        averageLength: (
          measurements.reduce((sum, m) => sum + m.distance * scaleFactor, 0) / totalMeasurements
        ).toFixed(2),
        minLength: Math.min(...measurements.map(m => m.distance * scaleFactor)).toFixed(2),
        maxLength: Math.max(...measurements.map(m => m.distance * scaleFactor)).toFixed(2)
      },
      metadata: {
        exportedAt: timestamp,
        scaleFactor,
        source: 'The Sovereign Ecosystem - AR Measurement Tool'
      }
    }

    return report
  }

  const exportAsCSV = () => {
    const report = generateMeasurementReport()
    
    let csv = 'Property Measurements Report\n\n'
    csv += `Property,${report.property.title}\n`
    csv += `Address,${report.property.address}\n`
    csv += `Price,${report.property.price}\n`
    csv += `Year Built,${report.property.yearBuilt}\n\n`
    
    csv += 'Number,Label,Length (ft),Length (in),Length (m),Start Point,End Point\n'
    
    report.measurements.forEach(m => {
      csv += `${m.number},"${m.label}",${m.lengthFeet},${m.lengthInches},${m.lengthMeters},"${m.startPoint}","${m.endPoint}"\n`
    })
    
    csv += `\nSummary\n`
    csv += `Total Measurements,${report.summary.totalMeasurements}\n`
    csv += `Average Length (ft),${report.summary.averageLength}\n`
    csv += `Min Length (ft),${report.summary.minLength}\n`
    csv += `Max Length (ft),${report.summary.maxLength}\n\n`
    csv += `Exported At,${report.metadata.exportedAt}\n`
    csv += `Scale Factor,${report.metadata.scaleFactor}\n`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `measurements-${property.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)

    soundManager.play('success')
    toast.success('CSV file downloaded', {
      description: 'Open in Excel or Google Sheets'
    })
  }

  const exportAsJSON = () => {
    const report = generateMeasurementReport()
    const json = JSON.stringify(report, null, 2)

    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `measurements-${property.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    soundManager.play('success')
    toast.success('JSON file downloaded', {
      description: 'Use in apps or databases'
    })
  }

  const exportAsPDF = () => {
    const report = generateMeasurementReport()
    
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Property Measurements - ${property.title}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    .header {
      border-bottom: 3px solid #E088AA;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #E088AA;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .property-info {
      background: #F9F9F9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #E088AA;
      color: white;
      font-weight: bold;
    }
    tr:hover {
      background: #F9F9F9;
    }
    .summary {
      background: #F0F7FF;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #E088AA;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    ${snapshotDataUrl ? `
    .snapshot {
      margin: 20px 0;
      text-align: center;
    }
    .snapshot img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    ` : ''}
  </style>
</head>
<body>
  <div class="header">
    <h1>Property Measurements Report</h1>
    <p style="color: #666; margin: 0;">Generated on ${report.metadata.exportedAt}</p>
  </div>

  <div class="property-info">
    <h2 style="margin-top: 0; color: #333;">Property Information</h2>
    <div class="info-row">
      <span class="info-label">Property:</span>
      <span>${report.property.title}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Address:</span>
      <span>${report.property.address}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Details:</span>
      <span>${report.property.details}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Year Built:</span>
      <span>${report.property.yearBuilt}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Price:</span>
      <span>${report.property.price}</span>
    </div>
  </div>

  ${snapshotDataUrl ? `
  <div class="snapshot">
    <h3>AR Snapshot</h3>
    <img src="${snapshotDataUrl}" alt="AR Property Measurement Snapshot" />
  </div>
  ` : ''}

  <h2>Measurements</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Label</th>
        <th>Length (ft)</th>
        <th>Length (in)</th>
        <th>Length (m)</th>
      </tr>
    </thead>
    <tbody>
      ${report.measurements.map(m => `
        <tr>
          <td>${m.number}</td>
          <td><strong>${m.label}</strong></td>
          <td>${m.lengthFeet} ft</td>
          <td>${m.lengthInches} in</td>
          <td>${m.lengthMeters} m</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary">
    <h3 style="margin-top: 0;">Summary</h3>
    <div class="summary-item">
      <span class="info-label">Total Measurements:</span>
      <span>${report.summary.totalMeasurements}</span>
    </div>
    <div class="summary-item">
      <span class="info-label">Average Length:</span>
      <span>${report.summary.averageLength} ft</span>
    </div>
    <div class="summary-item">
      <span class="info-label">Min Length:</span>
      <span>${report.summary.minLength} ft</span>
    </div>
    <div class="summary-item">
      <span class="info-label">Max Length:</span>
      <span>${report.summary.maxLength} ft</span>
    </div>
  </div>

  <div class="footer">
    <p><strong>The Sovereign Ecosystem</strong> - AR Measurement Tool</p>
    <p>Scale Factor: ${report.metadata.scaleFactor}</p>
    <p>Note: Measurements are approximate and should be verified on-site for critical applications.</p>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `measurements-${property.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`
    link.click()
    URL.revokeObjectURL(url)

    soundManager.play('success')
    toast.success('Report downloaded', {
      description: 'Open in browser or print to PDF'
    })
  }

  const copyToClipboard = async () => {
    const report = generateMeasurementReport()
    
    let text = `PROPERTY MEASUREMENTS REPORT\n`
    text += `${'='.repeat(50)}\n\n`
    text += `Property: ${report.property.title}\n`
    text += `Address: ${report.property.address}\n`
    text += `Details: ${report.property.details}\n`
    text += `Year Built: ${report.property.yearBuilt}\n`
    text += `Price: ${report.property.price}\n\n`
    
    text += `MEASUREMENTS:\n`
    text += `${'='.repeat(50)}\n`
    
    report.measurements.forEach(m => {
      text += `${m.number}. ${m.label}\n`
      text += `   Length: ${m.lengthFeet} ft (${m.lengthInches} in / ${m.lengthMeters} m)\n`
    })
    
    text += `\nSUMMARY:\n`
    text += `${'='.repeat(50)}\n`
    text += `Total Measurements: ${report.summary.totalMeasurements}\n`
    text += `Average Length: ${report.summary.averageLength} ft\n`
    text += `Min Length: ${report.summary.minLength} ft\n`
    text += `Max Length: ${report.summary.maxLength} ft\n\n`
    
    text += `Exported: ${report.metadata.exportedAt}\n`
    text += `Source: ${report.metadata.source}\n`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      soundManager.play('success')
      toast.success('Copied to clipboard', {
        description: 'Paste into email or document'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareViaEmail = async () => {
    if (!recipientEmail.trim()) {
      toast.error('Please enter recipient email')
      return
    }

    setIsSending(true)
    soundManager.play('glassTap')

    const report = generateMeasurementReport()
    
    const subject = `Property Measurements: ${property.title}`
    const body = `
Hi${recipientName ? ` ${recipientName}` : ''},

${message ? `${message}\n\n` : ''}I'm sharing measurements for the property at ${property.address}.

PROPERTY DETAILS:
- Title: ${property.title}
- Address: ${report.property.address}
- Price: ${report.property.price}
- Details: ${report.property.details}

MEASUREMENTS (${report.summary.totalMeasurements} total):
${report.measurements.map(m => `${m.number}. ${m.label}: ${m.lengthFeet} ft (${m.lengthInches} in)`).join('\n')}

SUMMARY:
- Average Length: ${report.summary.averageLength} ft
- Min Length: ${report.summary.minLength} ft
- Max Length: ${report.summary.maxLength} ft

Generated on ${report.metadata.exportedAt}
From: The Sovereign Ecosystem - AR Measurement Tool

Note: These are AR-based measurements and should be verified on-site for critical applications.
    `.trim()

    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    setTimeout(() => {
      window.location.href = mailtoLink
      setIsSending(false)
      soundManager.play('success')
      toast.success('Email client opened', {
        description: 'Send the measurement report'
      })
      setIsOpen(false)
    }, 500)
  }

  const generateShareableLink = () => {
    const report = generateMeasurementReport()
    const data = btoa(JSON.stringify(report))
    const url = `${window.location.origin}?measurement-report=${data}`
    
    navigator.clipboard.writeText(url)
    soundManager.play('success')
    toast.success('Shareable link copied', {
      description: 'Share with contractors or team members'
    })
  }

  if (measurements.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
          onClick={() => soundManager.play('glassTap')}
        >
          <Share2 className="w-4 h-4" />
          Export & Share
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            Export Measurements
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Share detailed measurements with contractors, architects, and team members
          </p>
        </DialogHeader>

        <Tabs defaultValue="download" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download">
              <Download className="w-4 h-4 mr-2" />
              Download
            </TabsTrigger>
            <TabsTrigger value="share">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="preview">
              <FileText className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="download" className="space-y-4 m-0">
              <Card className="p-6 bg-muted/30">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <Home className="w-12 h-12 text-rose-blush dark:text-moonlit-lavender" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-foreground mb-1">{property.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {property.address}, {property.city}, {property.state}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{measurements.length} measurements</Badge>
                      <Badge variant="outline">Scale: {scaleFactor.toFixed(1)}x</Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground mb-3">Choose Format</h4>
                  
                  <Button
                    onClick={exportAsPDF}
                    variant="outline"
                    className="w-full justify-start h-auto py-4 hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-4 text-left">
                      <FileText className="w-8 h-8 text-rose-blush dark:text-moonlit-lavender flex-shrink-0" />
                      <div>
                        <div className="font-semibold">PDF/HTML Report</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Professional report with property details, measurements, and summary
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={exportAsCSV}
                    variant="outline"
                    className="w-full justify-start h-auto py-4 hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-4 text-left">
                      <FileSpreadsheet className="w-8 h-8 text-green-500 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">CSV Spreadsheet</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Open in Excel or Google Sheets for further analysis
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={exportAsJSON}
                    variant="outline"
                    className="w-full justify-start h-auto py-4 hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-4 text-left">
                      <FileJson className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">JSON Data</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Structured data for integration with apps and databases
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="w-full justify-start h-auto py-4 hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-4 text-left">
                      {copied ? (
                        <Check className="w-8 h-8 text-green-500 flex-shrink-0" />
                      ) : (
                        <Copy className="w-8 h-8 text-purple-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold">
                          {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Plain text format for emails and documents
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="share" className="space-y-4 m-0">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Recipient Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="contractor@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Recipient Name (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="John Smith"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Message (Optional)
                    </label>
                    <Textarea
                      placeholder="Add a personal message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full"
                    />
                  </div>

                  <Separator />

                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Preview:</h4>
                    <p className="text-xs text-muted-foreground">
                      Subject: Property Measurements: {property.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {measurements.length} measurements will be included with full details
                    </p>
                  </div>

                  <Button
                    onClick={shareViaEmail}
                    disabled={isSending}
                    className="w-full bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? 'Opening Email...' : 'Send via Email'}
                  </Button>

                  <Button
                    onClick={generateShareableLink}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Generate Shareable Link
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 m-0">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {property.address}, {property.city}, {property.state}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4" />
                      Generated: {new Date().toLocaleString()}
                    </div>
                  </div>

                  <Separator />

                  {snapshotDataUrl && (
                    <>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-3">AR Snapshot</h4>
                        <img 
                          src={snapshotDataUrl} 
                          alt="AR Measurement Snapshot" 
                          className="w-full rounded-lg border border-border"
                        />
                      </div>
                      <Separator />
                    </>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-3">Measurements</h4>
                    <div className="space-y-2">
                      {measurements.map((m, idx) => (
                        <div 
                          key={m.id}
                          className="flex justify-between items-center bg-muted/30 rounded-lg p-3"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              {m.label || `Measurement ${idx + 1}`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {((m.distance * scaleFactor) * 12).toFixed(1)} inches • {' '}
                              {((m.distance * scaleFactor) * 0.3048).toFixed(2)} meters
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-rose-blush dark:text-moonlit-lavender">
                            {(m.distance * scaleFactor).toFixed(2)} ft
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-foreground mb-3">Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total</div>
                        <div className="font-semibold text-foreground">{measurements.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Average</div>
                        <div className="font-semibold text-foreground">
                          {(
                            measurements.reduce((sum, m) => sum + m.distance * scaleFactor, 0) / 
                            measurements.length
                          ).toFixed(2)} ft
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Min</div>
                        <div className="font-semibold text-foreground">
                          {Math.min(...measurements.map(m => m.distance * scaleFactor)).toFixed(2)} ft
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Max</div>
                        <div className="font-semibold text-foreground">
                          {Math.max(...measurements.map(m => m.distance * scaleFactor)).toFixed(2)} ft
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
