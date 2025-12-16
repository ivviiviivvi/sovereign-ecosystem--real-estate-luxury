import { Property } from '@/lib/types'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { AlertTriangle, Calendar, Shield, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { MarketTicker } from './MarketTicker'
import { MarketActivityIndicator } from './MarketActivityIndicator'
import { LivePriceDisplay } from './LivePriceDisplay'
import { PriceSparkline } from './PriceSparkline'
import { PortfolioValueTracker } from './PortfolioValueTracker'

interface AgentDashboardProps {
  properties: Property[]
  watchlistProperties: Property[]
  riskProperties: Property[]
  onBack: () => void
}

export function AgentDashboard({ properties, watchlistProperties, riskProperties, onBack }: AgentDashboardProps) {
  return (
    <div className="min-h-screen bg-onyx-deep text-foreground">
      <header className="border-b border-border bg-onyx-surface sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-champagne-gold">Portfolio Shield</h1>
            <p className="text-slate-grey text-sm">Compliance Intelligence Dashboard</p>
          </div>
          <button
            onClick={onBack}
            className="text-slate-grey hover:text-champagne-gold transition-colors"
          >
            Switch View
          </button>
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
              <Card className="bg-onyx-surface border-border p-8 text-center">
                <p className="text-slate-grey">No properties with leases expiring in the next 90 days</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {watchlistProperties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
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
              <Card className="bg-onyx-surface border-border p-8 text-center">
                <p className="text-slate-grey">No active compliance flags</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {riskProperties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} showMap />
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
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-onyx-surface border-border p-6">
        <div className="flex items-center gap-4">
          <div className={`${color}`}>{icon}</div>
          <div>
            <p className="text-slate-grey text-sm uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function PropertyCard({ property, index, showMap }: { property: Property; index: number; showMap?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="bg-onyx-surface border-border p-6 hover:border-champagne-gold/50 transition-colors">
        <div className="flex gap-6">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-32 h-32 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{property.title}</h3>
                <p className="text-slate-grey text-sm">
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
              <span className="text-slate-grey text-sm">
                {property.bedrooms} bed • {property.bathrooms} bath • {property.sqft.toLocaleString()} sqft
              </span>
              {property.yearBuilt && (
                <span className="text-slate-grey text-sm">• Built {property.yearBuilt}</span>
              )}
            </div>

            {property.complianceFlags.length > 0 && (
              <div className="space-y-2">
                {property.complianceFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge
                      variant={flag.severity === 'URGENT' ? 'destructive' : 'secondary'}
                      className="shrink-0"
                    >
                      {flag.severity}
                    </Badge>
                    <p className="text-sm text-foreground">{flag.message}</p>
                  </div>
                ))}
              </div>
            )}

            {showMap && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="bg-onyx-deep rounded-lg p-4 flex items-center justify-center">
                  <p className="text-slate-grey text-sm">
                    📍 {property.city}, {property.state}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
