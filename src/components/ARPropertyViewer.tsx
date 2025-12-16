import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { 
  X, Camera, RotateCcw, Maximize2, Minimize2, Info, Eye, EyeOff,
  Home, DollarSign, Ruler, MapPin, Sparkles, ZoomIn, ZoomOut
} from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Slider } from './ui/slider'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

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
  }, [stream, scale, rotation, position, showOverlay])

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

    animationFrameRef.current = requestAnimationFrame(renderFrame)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
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
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const resetView = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    soundManager.play('glassTap')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    soundManager.play('glassTap')
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
                        Drag to reposition • Use controls to adjust scale and rotation • Point your camera to visualize the property in your space
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
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
