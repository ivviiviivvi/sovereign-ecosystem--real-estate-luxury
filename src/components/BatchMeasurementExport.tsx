import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Property, Measurement, BatchExportJob } from '@/lib/types'
import { 
  Download, FileText, FileSpreadsheet, FileJson, Package, 
  Check, X, Loader2, Plus, Trash2, FolderArchive
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface BatchMeasurementExportProps {
  properties: Property[]
  measurements: Measurement[]
}

export function BatchMeasurementExport({ properties, measurements }: BatchMeasurementExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf' | 'zip'>('zip')
  const [includeAnnotations, setIncludeAnnotations] = useState(true)
  const [includeSnapshots, setIncludeSnapshots] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportJobs, setExportJobs] = useKV<BatchExportJob[]>('batch-export-jobs', [])

  const toggleProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
    soundManager.play('glassTap')
  }

  const toggleAllProperties = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([])
    } else {
      setSelectedProperties(properties.map(p => p.id))
    }
    soundManager.play('glassTap')
  }

  const toggleMeasurement = (measurementId: string) => {
    setSelectedMeasurements(prev => 
      prev.includes(measurementId) 
        ? prev.filter(id => id !== measurementId)
        : [...prev, measurementId]
    )
    soundManager.play('glassTap')
  }

  const toggleAllMeasurements = () => {
    const filteredMeasurements = measurements.filter(m => 
      selectedProperties.length === 0 || selectedProperties.includes(m.propertyId)
    )
    
    if (selectedMeasurements.length === filteredMeasurements.length) {
      setSelectedMeasurements([])
    } else {
      setSelectedMeasurements(filteredMeasurements.map(m => m.id))
    }
    soundManager.play('glassTap')
  }

  const getPropertyMeasurements = (propertyId: string) => {
    return measurements.filter(m => m.propertyId === propertyId)
  }

  const generateBatchExport = async () => {
    if (selectedMeasurements.length === 0) {
      toast.error('Please select at least one measurement')
      return
    }

    if (!batchName.trim()) {
      toast.error('Please enter a batch name')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    soundManager.play('glassTap')

    const newJob: BatchExportJob = {
      id: `export-${Date.now()}`,
      name: batchName,
      properties: selectedProperties,
      measurements: selectedMeasurements,
      format: exportFormat,
      includeAnnotations,
      includeSnapshots,
      status: 'processing',
      createdAt: new Date().toISOString()
    }

    setExportJobs(prev => [newJob, ...(prev || [])])

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProgress(i)
    }

    const selectedMeasurementsData = measurements.filter(m => 
      selectedMeasurements.includes(m.id)
    )
    const selectedPropertiesData = properties.filter(p => 
      selectedProperties.includes(p.id)
    )

    if (exportFormat === 'csv') {
      await exportAsCSV(selectedPropertiesData, selectedMeasurementsData, batchName)
    } else if (exportFormat === 'json') {
      await exportAsJSON(selectedPropertiesData, selectedMeasurementsData, batchName)
    } else if (exportFormat === 'pdf') {
      await exportAsPDF(selectedPropertiesData, selectedMeasurementsData, batchName)
    } else if (exportFormat === 'zip') {
      await exportAsZip(selectedPropertiesData, selectedMeasurementsData, batchName)
    }

    const completedJob = {
      ...newJob,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      downloadUrl: '#'
    }

    setExportJobs(prev => (prev || []).map(job => 
      job.id === newJob.id ? completedJob : job
    ))

    setIsProcessing(false)
    setProgress(0)
    soundManager.play('success')
    toast.success('Batch export completed', {
      description: `${selectedMeasurements.length} measurements exported`
    })

    setSelectedProperties([])
    setSelectedMeasurements([])
    setBatchName('')
  }

  const exportAsCSV = async (props: Property[], meas: Measurement[], name: string) => {
    let csv = 'Batch Measurement Export\n\n'
    csv += `Export Name,${name}\n`
    csv += `Export Date,${new Date().toLocaleString()}\n`
    csv += `Total Properties,${props.length}\n`
    csv += `Total Measurements,${meas.length}\n\n`

    props.forEach(property => {
      const propertyMeasurements = meas.filter(m => m.propertyId === property.id)
      
      if (propertyMeasurements.length === 0) return

      csv += `\nProperty: ${property.title}\n`
      csv += `Address,"${property.address}, ${property.city}, ${property.state} ${property.zip}"\n`
      csv += `Price,$${property.price.toLocaleString()}\n`
      csv += `Details,${property.bedrooms} bed • ${property.bathrooms} bath • ${property.sqft} sq ft\n\n`
      
      csv += 'Measurement ID,Label,Distance (ft),Distance (in),Distance (m),Created At'
      if (includeAnnotations) {
        csv += ',Annotations Count,Annotation Types'
      }
      csv += '\n'
      
      propertyMeasurements.forEach(m => {
        csv += `${m.id},"${m.label || 'Unlabeled'}",${m.distance.toFixed(2)},${(m.distance * 12).toFixed(1)},${(m.distance * 0.3048).toFixed(2)},${new Date(m.createdAt).toLocaleString()}`
        
        if (includeAnnotations && m.annotations.length > 0) {
          const types = m.annotations.map(a => a.type).join('; ')
          csv += `,${m.annotations.length},"${types}"`
        } else if (includeAnnotations) {
          csv += ',0,""'
        }
        csv += '\n'
      })
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsJSON = async (props: Property[], meas: Measurement[], name: string) => {
    const data = {
      exportName: name,
      exportDate: new Date().toISOString(),
      totalProperties: props.length,
      totalMeasurements: meas.length,
      includeAnnotations,
      includeSnapshots,
      properties: props.map(property => ({
        ...property,
        measurements: meas.filter(m => m.propertyId === property.id).map(m => ({
          ...m,
          annotations: includeAnnotations ? m.annotations : []
        }))
      }))
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsPDF = async (props: Property[], meas: Measurement[], name: string) => {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Batch Measurement Export - ${name}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 1000px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #E088AA 0%, #D4AF77 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .property-section {
      background: #F9F9F9;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 30px;
      border-left: 4px solid #E088AA;
    }
    .property-title {
      font-size: 24px;
      color: #E088AA;
      margin-bottom: 15px;
    }
    .property-details {
      font-size: 14px;
      color: #666;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
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
    .annotation-badge {
      display: inline-block;
      background: #E088AA;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-right: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E088AA;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📦 ${name}</h1>
    <p style="margin: 0; opacity: 0.95;">Batch Measurement Export</p>
    <p style="margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleString()}</p>
  </div>

  <div style="background: #E8F4F8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <h3 style="margin-top: 0;">Export Summary</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
      <div>
        <strong>Properties:</strong> ${props.length}
      </div>
      <div>
        <strong>Measurements:</strong> ${meas.length}
      </div>
      <div>
        <strong>Annotations:</strong> ${includeAnnotations ? 'Included' : 'Excluded'}
      </div>
    </div>
  </div>

  ${props.map(property => {
    const propertyMeasurements = meas.filter(m => m.propertyId === property.id)
    if (propertyMeasurements.length === 0) return ''
    
    return `
    <div class="property-section">
      <div class="property-title">${property.title}</div>
      <div class="property-details">
        📍 ${property.address}, ${property.city}, ${property.state} ${property.zip}<br/>
        💰 $${property.price.toLocaleString()} • 🏠 ${property.bedrooms} bed, ${property.bathrooms} bath • 📐 ${property.sqft} sq ft
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Label</th>
            <th>Length (ft)</th>
            <th>Length (m)</th>
            ${includeAnnotations ? '<th>Annotations</th>' : ''}
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${propertyMeasurements.map((m, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${m.label || 'Unlabeled'}</strong></td>
              <td>${m.distance.toFixed(2)} ft</td>
              <td>${(m.distance * 0.3048).toFixed(2)} m</td>
              ${includeAnnotations ? `
                <td>
                  ${m.annotations.map(a => `<span class="annotation-badge">${a.type}</span>`).join('')}
                  ${m.annotations.length === 0 ? '-' : ''}
                </td>
              ` : ''}
              <td>${new Date(m.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `
  }).join('')}

  <div class="footer">
    <p><strong>The Sovereign Ecosystem</strong> - Batch Measurement Export</p>
    <p>Generated from AR measurement data with professional precision</p>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsZip = async (props: Property[], meas: Measurement[], name: string) => {
    await exportAsCSV(props, meas, name)
    await new Promise(resolve => setTimeout(resolve, 300))
    await exportAsJSON(props, meas, name)
    await new Promise(resolve => setTimeout(resolve, 300))
    await exportAsPDF(props, meas, name)
  }

  const deleteJob = (jobId: string) => {
    setExportJobs(prev => (prev || []).filter(job => job.id !== jobId))
    soundManager.play('glassTap')
    toast.success('Export job deleted')
  }

  const filteredMeasurements = measurements.filter(m => 
    selectedProperties.length === 0 || selectedProperties.includes(m.propertyId)
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
          onClick={() => soundManager.play('glassTap')}
        >
          <Package className="w-5 h-5" />
          Batch Export
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            Batch Measurement Export
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Export multiple property measurements at once in various formats
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-6">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              <Card className="p-4 bg-muted/30">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FolderArchive className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                  Export Configuration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Batch Name
                    </label>
                    <Input
                      placeholder="e.g., Downtown Properties Q1"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={exportFormat === 'csv' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('csv')}
                        disabled={isProcessing}
                        className={exportFormat === 'csv' ? 'bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender' : ''}
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                      <Button
                        variant={exportFormat === 'json' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('json')}
                        disabled={isProcessing}
                        className={exportFormat === 'json' ? 'bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender' : ''}
                      >
                        <FileJson className="w-4 h-4 mr-2" />
                        JSON
                      </Button>
                      <Button
                        variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('pdf')}
                        disabled={isProcessing}
                        className={exportFormat === 'pdf' ? 'bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender' : ''}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button
                        variant={exportFormat === 'zip' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('zip')}
                        disabled={isProcessing}
                        className={exportFormat === 'zip' ? 'bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender' : ''}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        All (ZIP)
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-annotations"
                        checked={includeAnnotations}
                        onCheckedChange={(checked) => setIncludeAnnotations(checked as boolean)}
                        disabled={isProcessing}
                      />
                      <label htmlFor="include-annotations" className="text-sm text-foreground cursor-pointer">
                        Include annotations (photos, voice notes)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-snapshots"
                        checked={includeSnapshots}
                        onCheckedChange={(checked) => setIncludeSnapshots(checked as boolean)}
                        disabled={isProcessing}
                      />
                      <label htmlFor="include-snapshots" className="text-sm text-foreground cursor-pointer">
                        Include AR snapshots
                      </label>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected Properties:</span>
                      <span className="font-semibold text-foreground">{selectedProperties.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected Measurements:</span>
                      <span className="font-semibold text-foreground">{selectedMeasurements.length}</span>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Processing...</span>
                        <span className="font-semibold text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <Button
                    onClick={generateBatchExport}
                    disabled={isProcessing || selectedMeasurements.length === 0 || !batchName.trim()}
                    className="w-full bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate Export
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {exportJobs && exportJobs.length > 0 && (
                <Card className="p-4 bg-muted/30">
                  <h3 className="font-semibold text-foreground mb-3">Recent Exports</h3>
                  <div className="space-y-2">
                    {(exportJobs || []).slice(0, 3).map(job => (
                      <div 
                        key={job.id}
                        className="flex items-center justify-between bg-background rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm">{job.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {job.measurements.length} measurements • {job.format.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={job.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {job.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteJob(job.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>

          <ScrollArea className="h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Select Properties & Measurements</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleAllProperties}
                  disabled={isProcessing}
                >
                  {selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-3">
                {properties.map(property => {
                  const propertyMeasurements = getPropertyMeasurements(property.id)
                  const isPropertySelected = selectedProperties.includes(property.id)
                  const selectedCount = propertyMeasurements.filter(m => 
                    selectedMeasurements.includes(m.id)
                  ).length

                  return (
                    <Card 
                      key={property.id}
                      className={`p-4 transition-all ${isPropertySelected ? 'ring-2 ring-rose-blush dark:ring-moonlit-lavender bg-muted/50' : 'bg-muted/20'}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isPropertySelected}
                          onCheckedChange={() => toggleProperty(property.id)}
                          disabled={isProcessing}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-sm mb-1">
                            {property.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            {property.address}, {property.city}
                          </p>

                          {isPropertySelected && propertyMeasurements.length > 0 && (
                            <div className="space-y-2 pl-4 border-l-2 border-rose-blush/30 dark:border-moonlit-lavender/30">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {propertyMeasurements.length} measurements
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={toggleAllMeasurements}
                                  disabled={isProcessing}
                                  className="h-6 text-xs"
                                >
                                  {selectedCount === propertyMeasurements.length ? 'Deselect' : 'Select'} All
                                </Button>
                              </div>
                              {propertyMeasurements.map(measurement => (
                                <div 
                                  key={measurement.id}
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    checked={selectedMeasurements.includes(measurement.id)}
                                    onCheckedChange={() => toggleMeasurement(measurement.id)}
                                    disabled={isProcessing}
                                    id={`measurement-${measurement.id}`}
                                  />
                                  <label 
                                    htmlFor={`measurement-${measurement.id}`}
                                    className="flex-1 text-xs text-foreground cursor-pointer flex items-center justify-between"
                                  >
                                    <span>{measurement.label || 'Unlabeled'}</span>
                                    <span className="text-muted-foreground">
                                      {measurement.distance.toFixed(2)} ft
                                    </span>
                                  </label>
                                  {measurement.annotations.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {measurement.annotations.length}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
