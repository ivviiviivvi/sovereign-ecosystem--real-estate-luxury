import { useState } from 'react'
import { Property } from '@/lib/types'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { AlertTriangle, Calendar, Shield, TrendingUp, Camera, ArrowLeftRight, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedPropertyCard } from './AnimatedPropertyCard'
import { MarketTicker } from './MarketTicker'
import { MarketActivityIndicator } from './MarketActivityIndicator'
import { LivePriceDisplay } from './LivePriceDisplay'
import { PriceSparkline } from './PriceSparkline'
import { PortfolioValueTracker } from './PortfolioValueTracker'
import { MarketVolatilityControls } from './MarketVolatilityControls'
import { PatternAlertNotifications } from './PatternAlertNotifications'
import { PropertyComparisonSelector, PropertyCardWithSelection } from './PropertyComparisonSelector'
import { ARPropertyViewer } from './ARPropertyViewer'
import { PropertyComparisonSlider } from './PropertyComparisonSlider'
import { FeatureDemoGuide } from './FeatureDemoGuide'
import { soundManager } from '@/lib/sound-manager'

interface AgentDashboardProps {
  properties: Property[]
  watchlistProperties: Property[]
  riskProperties: Property[]
  onBack: () => void
}

export function AgentDashboard({ properties, watchlistProperties, riskProperties, onBack }: AgentDashboardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [arProperty, setArProperty] = useState<Property | null>(null)
  const [comparisonPair, setComparisonPair] = useState<[Property, Property] | null>(null)
  const [showDemoGuide, setShowDemoGuide] = useState(false)

  const toggleProperty = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pid => pid !== id)
      } else if (prev.length < 4) {
        return [...prev, id]
      }
      return prev
    })
  }

  const handleARView = (property: Property) => {
    setArProperty(property)
    soundManager.play('glassTap')
  }

  const handleComparisonSlider = (propA: Property, propB: Property) => {
    setComparisonPair([propA, propB])
    soundManager.play('glassTap')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/20 dark:from-midnight-blue dark:via-background dark:to-moonlit-indigo/30 text-foreground transition-colors duration-700">
      <header className="border-b border-border/30 bg-card/60 backdrop-blur-xl sticky top-0 z-40 shadow-sm transition-colors duration-500">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-foreground tracking-wide">Portfolio Shield</h1>
            <p className="text-muted-foreground text-sm font-light tracking-wide">Compliance Intelligence Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDemoGuide(true)
                soundManager.play('glassTap')
              }}
              className="gap-2 border-rose-blush/30 dark:border-moonlit-lavender/30 hover:bg-rose-blush/10 dark:hover:bg-moonlit-lavender/10"
            >
              <BookOpen className="w-4 h-4" />
              Feature Demo
            </Button>
            <PatternAlertNotifications />
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-primary dark:hover:text-moonlit-lavender transition-colors font-light duration-300"
            >
              Switch View
            </button>
          </div>
        </div>
        <MarketTicker />
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <PortfolioValueTracker properties={properties} />
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Shield className="w-6 h-6" />}
            label="Total Properties"
            value={properties.length}
            color="text-champagne-gold"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Watchlist (90 Days)"
            value={watchlistProperties.length}
            color="text-yellow-500"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Risk Flags Active"
            value={riskProperties.length}
            color="text-destructive"
          />
          <div className="lg:row-span-1">
            <MarketActivityIndicator />
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-champagne-gold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Lease Watchlist
            </h2>
            {watchlistProperties.length === 0 ? (
              <Card className="bg-card/90 dark:bg-card/70 backdrop-blur-sm border-border p-8 text-center">
                <p className="text-muted-foreground">No properties with leases expiring in the next 90 days</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {watchlistProperties.map((property, index) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    index={index} 
                    selectedIds={selectedIds} 
                    onToggle={toggleProperty}
                    onARView={handleARView}
                    onCompare={(prop) => {
                      if (properties.length > 1) {
                        const otherProp = properties.find(p => p.id !== prop.id)
                        if (otherProp) handleComparisonSlider(prop, otherProp)
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-champagne-gold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Risk Map
            </h2>
            {riskProperties.length === 0 ? (
              <Card className="bg-card/90 dark:bg-card/70 backdrop-blur-sm border-border p-8 text-center">
                <p className="text-muted-foreground">No active compliance flags</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {riskProperties.map((property, index) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    index={index} 
                    showMap 
                    selectedIds={selectedIds} 
                    onToggle={toggleProperty}
                    onARView={handleARView}
                    onCompare={(prop) => {
                      if (properties.length > 1) {
                        const otherProp = properties.find(p => p.id !== prop.id)
                        if (otherProp) handleComparisonSlider(prop, otherProp)
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-champagne-gold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              All Properties
            </h2>
            <div className="grid gap-4">
              {properties.map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  index={index} 
                  selectedIds={selectedIds} 
                  onToggle={toggleProperty}
                  onARView={handleARView}
                  onCompare={(prop) => {
                    if (properties.length > 1) {
                      const otherProp = properties.find(p => p.id !== prop.id)
                      if (otherProp) handleComparisonSlider(prop, otherProp)
                    }
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <PropertyComparisonSelector properties={properties} initialSelectedIds={selectedIds} />
      <MarketVolatilityControls />

      <AnimatePresence>
        {arProperty && (
          <ARPropertyViewer
            property={arProperty}
            onClose={() => setArProperty(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {comparisonPair && (
          <PropertyComparisonSlider
            propertyA={comparisonPair[0]}
            propertyB={comparisonPair[1]}
            onClose={() => setComparisonPair(null)}
          />
        )}
      </AnimatePresence>

      <FeatureDemoGuide
        isOpen={showDemoGuide}
        onClose={() => setShowDemoGuide(false)}
      />
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="bg-card/90 dark:bg-card/70 backdrop-blur-sm border-border p-6 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-moonlit-lavender/20 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className={`${color}`}>{icon}</div>
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function PropertyCard({ property, index, showMap, selectedIds, onToggle, onARView, onCompare }: { 
  property: Property; 
  index: number; 
  showMap?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onARView?: (property: Property) => void;
  onCompare?: (property: Property) => void;
}) {
  const isSelected = selectedIds?.includes(property.id) || false
  const disabled = !isSelected && (selectedIds?.length || 0) >= 4

  const cardContent = (
    <AnimatedPropertyCard index={index}>
      <Card className="bg-card/90 dark:bg-card/70 backdrop-blur-sm border-border hover:border-primary/50 dark:hover:border-moonlit-lavender/50 transition-all duration-500 shadow-lg hover:shadow-primary/10 dark:hover:shadow-moonlit-lavender/20">
        <div className="flex gap-6 p-6">
          <motion.img
            src={property.imageUrl}
            alt={property.title}
            className="w-32 h-32 object-cover rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{property.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {property.address}, {property.city}, {property.state} {property.zip}
                </p>
              </div>
              <div className="text-right space-y-2">
                <LivePriceDisplay
                  propertyId={property.id}
                  originalPrice={property.price}
                  size="sm"
                  showTrend={true}
                  compact={false}
                />
                <PriceSparkline propertyId={property.id} width={120} height={30} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-muted-foreground text-sm">
                {property.bedrooms} bed • {property.bathrooms} bath • {property.sqft.toLocaleString()} sqft
              </span>
              {property.yearBuilt && (
                <span className="text-muted-foreground text-sm">• Built {property.yearBuilt}</span>
              )}
            </div>

            {property.complianceFlags.length > 0 && (
              <div className="space-y-2 mb-3">
                {property.complianceFlags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <Badge
                      variant={flag.severity === 'URGENT' ? 'destructive' : 'secondary'}
                      className="shrink-0"
                    >
                      {flag.severity}
                    </Badge>
                    <p className="text-sm text-foreground">{flag.message}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {(onARView || onCompare) && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                {onARView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onARView(property)}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    AR View
                  </Button>
                )}
                {onCompare && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCompare(property)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Compare
                  </Button>
                )}
              </div>
            )}

            {showMap && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="bg-muted/50 dark:bg-moonlit-indigo/20 rounded-lg p-4 flex items-center justify-center backdrop-blur-sm">
                  <p className="text-muted-foreground text-sm">
                    📍 {property.city}, {property.state}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </AnimatedPropertyCard>
  )

  if (onToggle) {
    return (
      <PropertyCardWithSelection
        property={property}
        isSelected={isSelected}
        onToggle={() => onToggle(property.id)}
        disabled={disabled}
      >
        {cardContent}
      </PropertyCardWithSelection>
    )
  }

  return cardContent
}
