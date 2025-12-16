import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Property, Document } from '@/lib/types'
import { 
  X, ArrowLeftRight, TrendingUp, TrendingDown, Home, DollarSign, 
  Maximize2, Calendar, MapPin, Check, Sparkles, ChevronLeft, ChevronRight,
  RefreshCw, Save, Download
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface PropertyComparisonSliderProps {
  propertyA: Property
  propertyB: Property
  onClose: () => void
}

export function PropertyComparisonSlider({ propertyA, propertyB, onClose }: PropertyComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flippedSide, setFlippedSide] = useState<'left' | 'right' | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [documents, setDocuments] = useKV<Document[]>('documents', [])
  const [isSaving, setIsSaving] = useState(false)

  const handleDrag = (_: any, info: PanInfo) => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    const newPosition = ((info.point.x / containerWidth) * 100)
    setSliderPosition(Math.max(0, Math.min(100, newPosition)))
  }

  const handleFlip = (side: 'left' | 'right') => {
    if (isFlipping) return
    setIsFlipping(true)
    setFlippedSide(flippedSide === side ? null : side)
    soundManager.play('cardFlip')
    setTimeout(() => setIsFlipping(false), 600)
  }

  const syncFlip = () => {
    setIsFlipping(true)
    const currentFlipped = flippedSide
    setFlippedSide(null)
    
    setTimeout(() => {
      if (currentFlipped === 'left') {
        setFlippedSide('right')
      } else if (currentFlipped === 'right') {
        setFlippedSide('left')
      } else {
        setFlippedSide('left')
        setTimeout(() => {
          setFlippedSide('right')
        }, 300)
      }
      soundManager.play('cardFlip')
    }, 300)

    setTimeout(() => setIsFlipping(false), 900)
  }

  const captureSnapshot = async () => {
    const container = containerRef.current
    if (!container) return

    setIsSaving(true)
    soundManager.play('glassTap')

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight

      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const propertyAImg = new Image()
      propertyAImg.crossOrigin = 'anonymous'
      propertyAImg.src = propertyA.imageUrl

      const propertyBImg = new Image()
      propertyBImg.crossOrigin = 'anonymous'
      propertyBImg.src = propertyB.imageUrl

      await Promise.all([
        new Promise((resolve) => {
          propertyAImg.onload = resolve
          if (propertyAImg.complete) resolve(null)
        }),
        new Promise((resolve) => {
          propertyBImg.onload = resolve
          if (propertyBImg.complete) resolve(null)
        })
      ])

      const clipWidth = (canvas.width * sliderPosition) / 100
      ctx.drawImage(propertyAImg, 0, 0, clipWidth, canvas.height, 0, 0, clipWidth, canvas.height)
      ctx.drawImage(propertyBImg, clipWidth, 0, canvas.width - clipWidth, canvas.height, clipWidth, 0, canvas.width - clipWidth, canvas.height)

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(clipWidth, 0)
      ctx.lineTo(clipWidth, canvas.height)
      ctx.stroke()

      const dataUrl = canvas.toDataURL('image/png')
      
      const newDocument: Document = {
        id: `comparison-snapshot-${Date.now()}`,
        propertyId: `${propertyA.id}-${propertyB.id}`,
        title: `Comparison: ${propertyA.title} vs ${propertyB.title}`,
        type: 'other',
        thumbnailUrl: dataUrl,
        uploadDate: new Date().toISOString(),
        size: `${Math.round(dataUrl.length / 1024)} KB`
      }

      setDocuments((currentDocs) => [...currentDocs, newDocument])
      
      soundManager.play('success')
      toast.success('Comparison saved to Private Vault', {
        description: 'View it in the Vault tab'
      })
    } catch (error) {
      console.error('Failed to save snapshot:', error)
      toast.error('Failed to save comparison')
    } finally {
      setIsSaving(false)
    }
  }

  const downloadSnapshot = async () => {
    const container = containerRef.current
    if (!container) return

    soundManager.play('glassTap')

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight

      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const propertyAImg = new Image()
      propertyAImg.crossOrigin = 'anonymous'
      propertyAImg.src = propertyA.imageUrl

      const propertyBImg = new Image()
      propertyBImg.crossOrigin = 'anonymous'
      propertyBImg.src = propertyB.imageUrl

      await Promise.all([
        new Promise((resolve) => {
          propertyAImg.onload = resolve
          if (propertyAImg.complete) resolve(null)
        }),
        new Promise((resolve) => {
          propertyBImg.onload = resolve
          if (propertyBImg.complete) resolve(null)
        })
      ])

      const clipWidth = (canvas.width * sliderPosition) / 100
      ctx.drawImage(propertyAImg, 0, 0, clipWidth, canvas.height, 0, 0, clipWidth, canvas.height)
      ctx.drawImage(propertyBImg, clipWidth, 0, canvas.width - clipWidth, canvas.height, clipWidth, 0, canvas.width - clipWidth, canvas.height)

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(clipWidth, 0)
      ctx.lineTo(clipWidth, canvas.height)
      ctx.stroke()

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `comparison-${propertyA.title.replace(/\s+/g, '-')}-vs-${propertyB.title.replace(/\s+/g, '-')}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      
      toast.success('Comparison downloaded')
    } catch (error) {
      console.error('Failed to download snapshot:', error)
      toast.error('Failed to download comparison')
    }
  }

  const getComparison = (valueA: number | undefined, valueB: number | undefined, higherIsBetter = true) => {
    if (!valueA || !valueB) return 'neutral'
    if (higherIsBetter) {
      return valueA > valueB ? 'better' : valueA < valueB ? 'worse' : 'neutral'
    }
    return valueA < valueB ? 'better' : valueA > valueB ? 'worse' : 'neutral'
  }

  const ComparisonIndicator = ({ result }: { result: string }) => {
    if (result === 'better') return <TrendingUp className="w-4 h-4 text-green-400" />
    if (result === 'worse') return <TrendingDown className="w-4 h-4 text-red-400" />
    return <div className="w-4 h-4 flex items-center justify-center text-muted-foreground">-</div>
  }

  const PropertyCard = ({ property, side, isFlipped }: { property: Property; side: 'left' | 'right'; isFlipped: boolean }) => {
    const otherProperty = side === 'left' ? propertyB : propertyA

    return (
      <div 
        className="relative w-full h-full perspective-1000 cursor-pointer"
        onClick={() => handleFlip(side)}
      >
        <motion.div
          className="relative w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 backface-hidden">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <img
                src={property.imageUrl}
                alt={property.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                {property.isCurated && (
                  <Badge className="bg-rose-blush dark:bg-moonlit-lavender text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Curated
                  </Badge>
                )}
                <Badge className="ml-auto bg-white/20 backdrop-blur-md text-white border-white/30">
                  Tap to flip
                </Badge>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                <h3 className="text-2xl font-serif text-white font-semibold">
                  {property.title}
                </h3>
                
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.city}, {property.state}</span>
                </div>

                <div className="text-3xl font-semibold text-white">
                  ${property.price.toLocaleString()}
                </div>

                <div className="flex gap-4 text-sm text-white/80">
                  <span>{property.bedrooms} bed</span>
                  <span>•</span>
                  <span>{property.bathrooms} bath</span>
                  <span>•</span>
                  <span>{property.sqft.toLocaleString()} sq ft</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="absolute inset-0 backface-hidden bg-card border border-border rounded-2xl p-6 overflow-auto"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-serif text-foreground mb-1">
                    Detailed Comparison
                  </h4>
                  <p className="text-sm text-muted-foreground">vs {otherProperty.title}</p>
                </div>
                <Badge variant="secondary">
                  Tap to flip back
                </Badge>
              </div>

              <div className="space-y-3">
                <ComparisonRow
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Price"
                  valueA={property.price}
                  valueB={otherProperty.price}
                  format={(v) => `$${v.toLocaleString()}`}
                  higherIsBetter={false}
                  side={side}
                />

                <ComparisonRow
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Cap Rate"
                  valueA={property.capRate}
                  valueB={otherProperty.capRate}
                  format={(v) => `${v?.toFixed(2)}%`}
                  higherIsBetter={true}
                  side={side}
                />

                <ComparisonRow
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="ROI"
                  valueA={property.roi}
                  valueB={otherProperty.roi}
                  format={(v) => `${v?.toFixed(2)}%`}
                  higherIsBetter={true}
                  side={side}
                />

                <ComparisonRow
                  icon={<Home className="w-4 h-4" />}
                  label="Current Rent"
                  valueA={property.currentRent}
                  valueB={otherProperty.currentRent}
                  format={(v) => v ? `$${v.toLocaleString()}/mo` : 'N/A'}
                  higherIsBetter={true}
                  side={side}
                />

                <ComparisonRow
                  icon={<Home className="w-4 h-4" />}
                  label="Projected Rent"
                  valueA={property.projectedRent}
                  valueB={otherProperty.projectedRent}
                  format={(v) => v ? `$${v.toLocaleString()}/mo` : 'N/A'}
                  higherIsBetter={true}
                  side={side}
                />

                <ComparisonRow
                  icon={<Maximize2 className="w-4 h-4" />}
                  label="Square Feet"
                  valueA={property.sqft}
                  valueB={otherProperty.sqft}
                  format={(v) => `${v?.toLocaleString()} sq ft`}
                  higherIsBetter={true}
                  side={side}
                />

                <ComparisonRow
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Price per Sq Ft"
                  valueA={property.sqft > 0 ? property.price / property.sqft : 0}
                  valueB={otherProperty.sqft > 0 ? otherProperty.price / otherProperty.sqft : 0}
                  format={(v) => `$${v?.toFixed(2)}`}
                  higherIsBetter={false}
                  side={side}
                />

                <ComparisonRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Year Built"
                  valueA={property.yearBuilt}
                  valueB={otherProperty.yearBuilt}
                  format={(v) => v?.toString()}
                  side={side}
                />
              </div>

              {property.complianceFlags.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Compliance Flags</h5>
                  <div className="space-y-2">
                    {property.complianceFlags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                          flag.severity === 'URGENT'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : flag.severity === 'WARNING'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {flag.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const ComparisonRow = ({ 
    icon, 
    label, 
    valueA, 
    valueB, 
    format, 
    higherIsBetter,
    side 
  }: { 
    icon: React.ReactNode
    label: string
    valueA: any
    valueB: any
    format: (v: any) => string
    higherIsBetter?: boolean
    side: 'left' | 'right'
  }) => {
    const comparison = getComparison(valueA, valueB, higherIsBetter)
    const thisValue = side === 'left' ? valueA : valueB
    const otherValue = side === 'left' ? valueB : valueA
    const thisComparison = side === 'left' ? comparison : 
      comparison === 'better' ? 'worse' : comparison === 'worse' ? 'better' : 'neutral'

    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            thisComparison === 'better' ? 'text-green-400' :
            thisComparison === 'worse' ? 'text-red-400' :
            'text-foreground'
          }`}>
            {format(thisValue)}
          </span>
          <ComparisonIndicator result={thisComparison} />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-7xl h-full max-h-[90vh] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-6 h-6 text-rose-blush dark:text-moonlit-lavender" />
            <div>
              <h2 className="text-2xl font-serif text-white">Side-by-Side Comparison</h2>
              <p className="text-sm text-white/70">Drag the slider to compare properties</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={captureSnapshot}
              disabled={isSaving}
              className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Vault
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={downloadSnapshot}
              className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={syncFlip}
              disabled={isFlipping}
              className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Flip
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative flex-1 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 grid grid-cols-2 gap-0">
            <div 
              className="relative overflow-hidden"
              style={{ 
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                transition: isDragging ? 'none' : 'clip-path 0.1s ease-out'
              }}
            >
              <PropertyCard 
                property={propertyA} 
                side="left"
                isFlipped={flippedSide === 'left'}
              />
            </div>

            <div 
              className="relative overflow-hidden"
              style={{ 
                clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                transition: isDragging ? 'none' : 'clip-path 0.1s ease-out'
              }}
            >
              <PropertyCard 
                property={propertyB} 
                side="right"
                isFlipped={flippedSide === 'right'}
              />
            </div>
          </div>

          <motion.div
            drag="x"
            dragConstraints={containerRef}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragStart={() => {
              setIsDragging(true)
              soundManager.play('glassTap')
            }}
            onDragEnd={() => setIsDragging(false)}
            className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-10"
            style={{ 
              left: `${sliderPosition}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm shadow-2xl" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center">
              <div className="flex gap-1">
                <ChevronLeft className="w-4 h-4 text-gray-700" />
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </div>
            </div>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-gray-700" />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-gray-700" />
            </div>
          </motion.div>

          <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 text-white border border-white/20">
            <div className="text-xs text-white/70 mb-1">Property A</div>
            <div className="font-semibold">{propertyA.title}</div>
          </div>

          <div className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 text-white border border-white/20">
            <div className="text-xs text-white/70 mb-1">Property B</div>
            <div className="font-semibold">{propertyB.title}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Progress value={sliderPosition} className="h-2" />
          </div>
          <div className="text-sm text-white/70 font-mono w-16 text-right">
            {sliderPosition.toFixed(0)}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}
