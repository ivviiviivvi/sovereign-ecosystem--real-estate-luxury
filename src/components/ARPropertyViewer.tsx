import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Property, Document, MeasurementPreset } from '@/lib/types'
import { 
  X, Camera, RotateCcw, Maximize2, Minimize2, Info, Eye, EyeOff,
  Home, DollarSign, Ruler, MapPin, Sparkles, ZoomIn, ZoomOut, Save, Download,
  Pencil, Trash2, Check
} from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'
import { MeasurementPresets } from './MeasurementPresets'
import { MeasurementExport } from './MeasurementExport'

interface MeasurementPoint {
  x: number
  y: number
}

interface Measurement {
  id: string
  start: MeasurementPoint
  end: MeasurementPoint
  distance: number
  label?: string
}

interface ARPropertyViewerProps {
  property: Property
  onClose: () => void
}

export function ARPropertyViewer({ property, onClose }: ARPropertyViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(true)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const animationFrameRef = useRef<number | undefined>(undefined)
  
  const [documents, setDocuments] = useKV<Document[]>('documents', [])
  const [isSaving, setIsSaving] = useState(false)
  
  const [measurementMode, setMeasurementMode] = useState(false)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [currentMeasurement, setCurrentMeasurement] = useState<{ start: MeasurementPoint } | null>(null)
  const [scaleFactor, setScaleFactor] = useState(1)
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [labelInput, setLabelInput] = useState('')
  const [activePreset, setActivePreset] = useState<MeasurementPreset | null>(null)
  const [currentSnapshotUrl, setCurrentSnapshotUrl] = useState<string | undefined>(undefined)
  
  const lastTouchDistance = useRef<number>(0)
  const lastTouchAngle = useRef<number>(0)
  const gestureStartScale = useRef<number>(1)
  const gestureStartRotation = useRef<number>(0)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (stream && videoRef.current && canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(renderFrame)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [stream, scale, rotation, position, showOverlay, measurements, currentMeasurement, measurementMode])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsLoading(false)
          soundManager.play('success')
        }
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please grant camera permissions.')
      setIsLoading(false)
      toast.error('Camera access denied')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const renderFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !stream) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    if (showOverlay) {
      const centerX = canvas.width / 2 + position.x
      const centerY = canvas.height / 2 + position.y

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale, scale)

      const width = 600
      const height = 400
      const x = -width / 2
      const y = -height / 2
      const cornerRadius = 20

      ctx.shadowColor = 'rgba(224, 136, 170, 0.6)'
      ctx.shadowBlur = 40
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 10

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.strokeStyle = 'rgba(224, 136, 170, 0.8)'
      ctx.lineWidth = 3

      ctx.beginPath()
      ctx.moveTo(x + cornerRadius, y)
      ctx.lineTo(x + width - cornerRadius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius)
      ctx.lineTo(x + width, y + height - cornerRadius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height)
      ctx.lineTo(x + cornerRadius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius)
      ctx.lineTo(x, y + cornerRadius)
      ctx.quadraticCurveTo(x, y, x + cornerRadius, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = property.imageUrl
      
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x + cornerRadius, y)
      ctx.lineTo(x + width - cornerRadius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius)
      ctx.lineTo(x + width, y + height - cornerRadius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height)
      ctx.lineTo(x + cornerRadius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius)
      ctx.lineTo(x, y + cornerRadius)
      ctx.quadraticCurveTo(x, y, x + cornerRadius, y)
      ctx.closePath()
      ctx.clip()

      if (img.complete) {
        ctx.drawImage(img, x, y, width, height)
      }

      ctx.restore()

      const labelY = y + height + 40
      const labelHeight = 100
      const labelPadding = 20

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.strokeStyle = 'rgba(224, 136, 170, 0.6)'
      ctx.lineWidth = 2
      
      ctx.beginPath()
      ctx.moveTo(x + cornerRadius, labelY)
      ctx.lineTo(x + width - cornerRadius, labelY)
      ctx.quadraticCurveTo(x + width, labelY, x + width, labelY + cornerRadius)
      ctx.lineTo(x + width, labelY + labelHeight - cornerRadius)
      ctx.quadraticCurveTo(x + width, labelY + labelHeight, x + width - cornerRadius, labelY + labelHeight)
      ctx.lineTo(x + cornerRadius, labelY + labelHeight)
      ctx.quadraticCurveTo(x, labelY + labelHeight, x, labelY + labelHeight - cornerRadius)
      ctx.lineTo(x, labelY + cornerRadius)
      ctx.quadraticCurveTo(x, labelY, x + cornerRadius, labelY)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = 'rgba(224, 136, 170, 1)'
      ctx.font = 'bold 28px Cormorant'
      ctx.textAlign = 'left'
      ctx.fillText(property.title, x + labelPadding, labelY + 35)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = '20px Outfit'
      ctx.fillText(`$${property.price.toLocaleString()}`, x + labelPadding, labelY + 65)
      
      ctx.fillStyle = 'rgba(200, 200, 200, 0.8)'
      ctx.font = '16px Outfit'
      ctx.fillText(
        `${property.bedrooms} bed • ${property.bathrooms} bath • ${property.sqft.toLocaleString()} sq ft`,
        x + labelPadding,
        labelY + 88
      )

      const cornerSize = 25
      ctx.strokeStyle = 'rgba(224, 136, 170, 1)'
      ctx.lineWidth = 4;
      
      [
        { x: x - 10, y: y - 10 },
        { x: x + width + 10, y: y - 10 },
        { x: x - 10, y: y + height + 10 },
        { x: x + width + 10, y: y + height + 10 }
      ].forEach((corner, idx) => {
        ctx.beginPath()
        if (idx === 0) {
          ctx.moveTo(corner.x + cornerSize, corner.y)
          ctx.lineTo(corner.x, corner.y)
          ctx.lineTo(corner.x, corner.y + cornerSize)
        } else if (idx === 1) {
          ctx.moveTo(corner.x - cornerSize, corner.y)
          ctx.lineTo(corner.x, corner.y)
          ctx.lineTo(corner.x, corner.y + cornerSize)
        } else if (idx === 2) {
          ctx.moveTo(corner.x + cornerSize, corner.y)
          ctx.lineTo(corner.x, corner.y)
          ctx.lineTo(corner.x, corner.y - cornerSize)
        } else {
          ctx.moveTo(corner.x - cornerSize, corner.y)
          ctx.lineTo(corner.x, corner.y)
          ctx.lineTo(corner.x, corner.y - cornerSize)
        }
        ctx.stroke()
      })

      ctx.restore()
    }

    if (measurementMode || measurements.length > 0) {
      ctx.save()
      ctx.lineWidth = 3
      ctx.strokeStyle = 'rgba(58, 255, 165, 0.9)'
      ctx.fillStyle = 'rgba(58, 255, 165, 0.9)'

      measurements.forEach((measurement) => {
        ctx.beginPath()
        ctx.moveTo(measurement.start.x, measurement.start.y)
        ctx.lineTo(measurement.end.x, measurement.end.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(measurement.start.x, measurement.start.y, 6, 0, 2 * Math.PI)
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(measurement.end.x, measurement.end.y, 6, 0, 2 * Math.PI)
        ctx.fill()

        const midX = (measurement.start.x + measurement.end.x) / 2
        const midY = (measurement.start.y + measurement.end.y) / 2
        
        const distanceText = `${(measurement.distance * scaleFactor).toFixed(1)} ft`
        const labelText = measurement.label ? `${measurement.label}: ${distanceText}` : distanceText
        
        ctx.font = 'bold 18px Outfit'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const textMetrics = ctx.measureText(labelText)
        const padding = 8
        const boxWidth = textMetrics.width + padding * 2
        const boxHeight = 28
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight)
        
        ctx.strokeStyle = 'rgba(58, 255, 165, 0.9)'
        ctx.lineWidth = 2
        ctx.strokeRect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight)
        
        ctx.fillStyle = 'rgba(58, 255, 165, 1)'
        ctx.fillText(labelText, midX, midY)
      })

      if (currentMeasurement) {
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          const mouseX = position.x
          const mouseY = position.y

          ctx.setLineDash([10, 5])
          ctx.strokeStyle = 'rgba(255, 255, 100, 0.7)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(currentMeasurement.start.x, currentMeasurement.start.y)
          ctx.lineTo(mouseX, mouseY)
          ctx.stroke()
          ctx.setLineDash([])

          ctx.beginPath()
          ctx.arc(currentMeasurement.start.x, currentMeasurement.start.y, 6, 0, 2 * Math.PI)
          ctx.fillStyle = 'rgba(255, 255, 100, 0.9)'
          ctx.fill()
        }
      }

      ctx.restore()
    }

    animationFrameRef.current = requestAnimationFrame(renderFrame)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!measurementMode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height

    if (!currentMeasurement) {
      setCurrentMeasurement({ start: { x, y } })
      soundManager.play('glassTap')
    } else {
      const distance = Math.sqrt(
        Math.pow(x - currentMeasurement.start.x, 2) + 
        Math.pow(y - currentMeasurement.start.y, 2)
      )

      const newMeasurement: Measurement = {
        id: `measurement-${Date.now()}`,
        start: currentMeasurement.start,
        end: { x, y },
        distance: distance / 50
      }

      setMeasurements(prev => [...prev, newMeasurement])
      setCurrentMeasurement(null)
      soundManager.play('success')
      toast.success('Measurement added', {
        description: `${(distance / 50 * scaleFactor).toFixed(1)} ft`
      })
    }
  }

  const deleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id))
    soundManager.play('glassTap')
    toast.success('Measurement deleted')
  }

  const clearMeasurements = () => {
    setMeasurements([])
    setCurrentMeasurement(null)
    setActivePreset(null)
    soundManager.play('glassTap')
    toast.success('All measurements cleared')
  }

  const addLabelToMeasurement = (id: string, label: string) => {
    setMeasurements(prev => 
      prev.map(m => m.id === id ? { ...m, label } : m)
    )
    setEditingLabel(null)
    setLabelInput('')
    soundManager.play('success')
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (measurementMode) {
      handleCanvasClick(e)
      return
    }
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && !measurementMode) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (measurementMode && e.touches.length === 1) {
      const touch = e.touches[0]
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = ((touch.clientX - rect.left) / rect.width) * canvas.width
      const y = ((touch.clientY - rect.top) / rect.height) * canvas.height

      if (!currentMeasurement) {
        setCurrentMeasurement({ start: { x, y } })
        soundManager.play('glassTap')
      } else {
        const distance = Math.sqrt(
          Math.pow(x - currentMeasurement.start.x, 2) + 
          Math.pow(y - currentMeasurement.start.y, 2)
        )

        const newMeasurement: Measurement = {
          id: `measurement-${Date.now()}`,
          start: currentMeasurement.start,
          end: { x, y },
          distance: distance / 50
        }

        setMeasurements(prev => [...prev, newMeasurement])
        setCurrentMeasurement(null)
        soundManager.play('success')
        toast.success('Measurement added', {
          description: `${(distance / 50 * scaleFactor).toFixed(1)} ft`
        })
      }
      return
    }

    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      lastTouchDistance.current = distance
      
      const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      ) * (180 / Math.PI)
      lastTouchAngle.current = angle
      
      gestureStartScale.current = scale
      gestureStartRotation.current = rotation
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (measurementMode) return
    
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    } else if (e.touches.length === 2) {
      e.preventDefault()
      
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (lastTouchDistance.current > 0) {
        const scaleChange = distance / lastTouchDistance.current
        const newScale = Math.max(0.5, Math.min(3, gestureStartScale.current * scaleChange))
        setScale(newScale)
      }
      
      const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      ) * (180 / Math.PI)
      
      if (lastTouchAngle.current !== 0) {
        const angleDiff = angle - lastTouchAngle.current
        const newRotation = (gestureStartRotation.current + angleDiff + 360) % 360
        setRotation(newRotation)
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      setIsDragging(false)
      lastTouchDistance.current = 0
      lastTouchAngle.current = 0
    } else if (e.touches.length === 1) {
      lastTouchDistance.current = 0
      lastTouchAngle.current = 0
    }
  }

  const resetView = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    soundManager.play('glassTap')
  }

  const handlePresetSelect = (preset: MeasurementPreset) => {
    setActivePreset(preset)
    setMeasurementMode(true)
    setShowOverlay(false)
    
    if (preset.defaultLength) {
      setScaleFactor(preset.defaultLength / 10)
    }
    
    soundManager.play('success')
    toast.success(`Using "${preset.name}" preset`, {
      description: preset.description || 'Tap two points to measure'
    })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    soundManager.play('glassTap')
  }

  const captureSnapshot = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsSaving(true)
    soundManager.play('glassTap')

    try {
      const dataUrl = canvas.toDataURL('image/png')
      setCurrentSnapshotUrl(dataUrl)
      
      const newDocument: Document = {
        id: `ar-snapshot-${Date.now()}`,
        propertyId: property.id,
        title: `AR Snapshot - ${property.title}`,
        type: 'other',
        thumbnailUrl: dataUrl,
        uploadDate: new Date().toISOString(),
        size: `${Math.round(dataUrl.length / 1024)} KB`
      }

      setDocuments((currentDocs) => [...(currentDocs || []), newDocument])
      
      soundManager.play('success')
      toast.success('AR snapshot saved to Private Vault', {
        description: 'View it in the Vault tab'
      })
    } catch (error) {
      console.error('Failed to save snapshot:', error)
      toast.error('Failed to save snapshot')
    } finally {
      setIsSaving(false)
    }
  }

  const downloadSnapshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    soundManager.play('glassTap')

    try {
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `ar-view-${property.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      
      toast.success('AR snapshot downloaded')
    } catch (error) {
      console.error('Failed to download snapshot:', error)
      toast.error('Failed to download snapshot')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black z-50 ${isFullscreen ? '' : 'p-4 md:p-8'}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover cursor-move touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mb-4"
              >
                <Camera className="w-16 h-16 text-rose-blush dark:text-moonlit-lavender mx-auto" />
              </motion.div>
              <p className="text-white text-lg">Initializing camera...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <Card className="max-w-md p-6 text-center">
              <Camera className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-serif text-foreground mb-2">Camera Access Required</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
                <Button onClick={startCamera} className="flex-1">
                  Try Again
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && !error && (
        <>
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-4 z-10">
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card/90 backdrop-blur-xl border border-border rounded-xl p-4 max-w-sm"
                >
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground mb-1">AR Property View</h4>
                      <p className="text-xs text-muted-foreground">
                        • Drag with one finger to reposition<br />
                        • Pinch with two fingers to zoom<br />
                        • Rotate with two fingers to change angle<br />
                        • Use controls to save snapshot
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <MeasurementPresets onSelectPreset={handlePresetSelect} />
              <Button
                variant={measurementMode ? 'default' : 'secondary'}
                size="icon"
                onClick={() => {
                  setMeasurementMode(!measurementMode)
                  if (!measurementMode) {
                    setShowOverlay(false)
                  }
                  soundManager.play('glassTap')
                  toast.success(
                    measurementMode ? 'Measurement mode disabled' : 'Tap to start measuring',
                    { description: measurementMode ? '' : 'Tap two points to measure distance' }
                  )
                }}
                className={`bg-card/90 backdrop-blur-xl ${measurementMode ? 'ring-2 ring-green-400' : ''}`}
                title="Measurement tool"
              >
                <Ruler className="w-5 h-5" />
              </Button>
              {measurements.length > 0 && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={clearMeasurements}
                  className="bg-card/90 backdrop-blur-xl"
                  title="Clear all measurements"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  setShowInfo(!showInfo)
                  soundManager.play('glassTap')
                }}
                className="bg-card/90 backdrop-blur-xl"
              >
                {showInfo ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={captureSnapshot}
                disabled={isSaving}
                className="bg-card/90 backdrop-blur-xl"
              >
                <Save className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={downloadSnapshot}
                className="bg-card/90 backdrop-blur-xl"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={toggleFullscreen}
                className="bg-card/90 backdrop-blur-xl"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={onClose}
                className="bg-card/90 backdrop-blur-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="bg-card/90 backdrop-blur-xl border-border p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={showOverlay ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setShowOverlay(!showOverlay)
                        soundManager.play('glassTap')
                      }}
                    >
                      {showOverlay ? 'Hide' : 'Show'} Overlay
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetView}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {property.isCurated && (
                    <Badge className="bg-rose-blush dark:bg-moonlit-lavender text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Curated
                    </Badge>
                  )}
                </div>

                {measurements.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-foreground">Measurements</h5>
                      <div className="flex items-center gap-2">
                        <MeasurementExport
                          measurements={measurements}
                          property={property}
                          scaleFactor={scaleFactor}
                          snapshotDataUrl={currentSnapshotUrl}
                        />
                        <span className="text-xs text-muted-foreground">Scale:</span>
                        <Input
                          type="number"
                          value={scaleFactor}
                          onChange={(e) => setScaleFactor(parseFloat(e.target.value) || 1)}
                          className="w-20 h-7 text-xs"
                          step="0.1"
                          min="0.1"
                        />
                      </div>
                    </div>
                    <ScrollArea className="max-h-32">
                      <div className="space-y-2">
                        {measurements.map((measurement) => (
                          <div
                            key={measurement.id}
                            className="flex items-center justify-between bg-muted/30 rounded-lg p-2 text-sm"
                          >
                            <div className="flex-1">
                              {editingLabel === measurement.id ? (
                                <div className="flex gap-2">
                                  <Input
                                    value={labelInput}
                                    onChange={(e) => setLabelInput(e.target.value)}
                                    placeholder="Label..."
                                    className="h-7 text-xs"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        addLabelToMeasurement(measurement.id, labelInput)
                                      } else if (e.key === 'Escape') {
                                        setEditingLabel(null)
                                        setLabelInput('')
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => addLabelToMeasurement(measurement.id, labelInput)}
                                    className="h-7 px-2"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-foreground font-medium">
                                    {(measurement.distance * scaleFactor).toFixed(1)} ft
                                  </span>
                                  {measurement.label && (
                                    <Badge variant="secondary" className="text-xs">
                                      {measurement.label}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {!editingLabel && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingLabel(measurement.id)
                                    setLabelInput(measurement.label || '')
                                  }}
                                  className="h-7 px-2"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMeasurement(measurement.id)}
                                className="h-7 px-2 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <ZoomIn className="w-4 h-4" />
                        Scale
                      </span>
                      <span className="text-foreground font-medium">{scale.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[scale]}
                      onValueChange={([value]) => setScale(value)}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Rotation
                      </span>
                      <span className="text-foreground font-medium">{rotation}°</span>
                    </div>
                    <Slider
                      value={[rotation]}
                      onValueChange={([value]) => setRotation(value)}
                      min={0}
                      max={360}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">
                      {property.city}, {property.state}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  )
}
