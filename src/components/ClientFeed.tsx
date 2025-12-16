import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Property } from '@/lib/types'
import { CuratedBadge } from './CuratedBadge'
import { TrendingUp, Home, Maximize } from 'lucide-react'
import { CircularYieldSlider } from './CircularYieldSlider'
import { LivePriceDisplay } from './LivePriceDisplay'
import { PriceSparkline } from './PriceSparkline'
import { soundManager } from '@/lib/sound-manager'

interface ClientFeedProps {
  properties: Property[]
  onBack: () => void
}

export function ClientFeed({ properties, onBack }: ClientFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showYieldCalculator, setShowYieldCalculator] = useState(false)
  const [pinchScale, setPinchScale] = useState(1)
  const y = useMotionValue(0)

  const currentProperty = properties[currentIndex]

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -100 && currentIndex < properties.length - 1) {
      soundManager.play('glassTap')
      setCurrentIndex(currentIndex + 1)
      setPinchScale(1)
      setShowYieldCalculator(false)
    } else if (info.offset.y > 100 && currentIndex > 0) {
      soundManager.play('glassTap')
      setCurrentIndex(currentIndex - 1)
      setPinchScale(1)
      setShowYieldCalculator(false)
    }
  }

  const handlePinch = (scale: number) => {
    if (scale < 0.8) {
      setPinchScale(0.7)
    } else {
      setPinchScale(1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/20 overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-card/60 via-card/40 to-transparent backdrop-blur-sm">
        <h1 className="text-2xl font-light text-foreground tracking-wide">Sovereign</h1>
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-rose-blush transition-colors text-sm font-light"
        >
          Exit
        </button>
      </header>

      <div className="h-screen flex items-center justify-center p-4">
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="w-full max-w-lg h-full max-h-[85vh] relative"
          animate={{ scale: pinchScale }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <PropertyCard
            property={currentProperty}
            onPinch={handlePinch}
            pinchScale={pinchScale}
            onToggleCalculator={() => setShowYieldCalculator(!showYieldCalculator)}
            showCalculator={showYieldCalculator}
          />
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-50">
        {properties.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-gradient-to-r from-rose-blush to-rose-gold'
                : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

interface PropertyCardProps {
  property: Property
  onPinch: (scale: number) => void
  pinchScale: number
  onToggleCalculator: () => void
  showCalculator: boolean
}

function PropertyCard({ property, onPinch, pinchScale, onToggleCalculator, showCalculator }: PropertyCardProps) {
  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-card/80 backdrop-blur-xl shadow-2xl shadow-rose-blush/10">
      {property.isCurated && <CuratedBadge />}

      <div className="relative h-3/5">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
        <div>
          <h2 className="text-4xl font-light text-foreground mb-2 leading-tight tracking-wide">
            {property.title}
          </h2>
          <p className="text-muted-foreground text-lg font-light">
            {property.city}, {property.state}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2 font-light">Live Price</p>
              <LivePriceDisplay
                propertyId={property.id}
                originalPrice={property.price}
                size="lg"
                showTrend={true}
              />
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2 font-light">24h Trend</p>
              <PriceSparkline propertyId={property.id} width={100} height={40} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1 font-light">Yield</p>
              <p className="text-2xl font-light text-foreground">
                {property.capRate ? `${property.capRate}%` : '—'}
              </p>
            </div>
            <div className="flex gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span>{property.bedrooms} bed</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="w-5 h-5" />
                <span>{property.sqft.toLocaleString()} sqft</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.play('glassTap')
            onToggleCalculator()
          }}
          className="w-full bg-champagne-gold text-onyx-deep py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-champagne-gold/90 transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          Calculate Returns
        </button>
      </div>

      {pinchScale < 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-onyx-deep/95 p-8 flex flex-col justify-center"
        >
          <h3 className="text-2xl font-bold text-champagne-gold mb-6">Financial Summary</h3>
          <div className="space-y-4">
            <div className="py-3 border-b border-border">
              <span className="text-slate-grey uppercase tracking-wide text-sm block mb-2">Live Price</span>
              <LivePriceDisplay
                propertyId={property.id}
                originalPrice={property.price}
                size="md"
                showTrend={true}
              />
            </div>
            <DataRow label="Current Rent" value={property.currentRent ? `$${property.currentRent.toLocaleString()}/mo` : '—'} />
            <DataRow label="Cap Rate" value={property.capRate ? `${property.capRate}%` : '—'} />
            <DataRow label="ROI (Annual)" value={property.roi ? `${property.roi}%` : '—'} />
            <div className="pt-4">
              <span className="text-slate-grey uppercase tracking-wide text-sm block mb-2">Price Trend</span>
              <PriceSparkline propertyId={property.id} width={280} height={60} />
            </div>
          </div>
        </motion.div>
      )}

      {showCalculator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 bg-onyx-deep/98 flex items-center justify-center p-8"
        >
          <CircularYieldSlider property={property} onClose={onToggleCalculator} />
        </motion.div>
      )}
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border">
      <span className="text-slate-grey uppercase tracking-wide text-sm">{label}</span>
      <span className="text-foreground font-semibold text-lg">{value}</span>
    </div>
  )
}
