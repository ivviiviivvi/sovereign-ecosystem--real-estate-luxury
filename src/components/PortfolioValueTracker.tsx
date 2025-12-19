import { useEffect, useState, memo } from 'react'
import { Property } from '@/lib/types'
import { marketDataService } from '@/lib/market-data'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { Card } from './ui/card'

interface PortfolioValueTrackerProps {
  properties: Property[]
}

const PortfolioValueTracker = memo(function PortfolioValueTracker({ properties }: PortfolioValueTrackerProps) {
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [totalChange, setTotalChange] = useState(0)
  const [totalChangePercent, setTotalChangePercent] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)
  const [previousValue, setPreviousValue] = useState(0)

  useEffect(() => {
    const updatePortfolioValue = () => {
      let totalCurrent = 0
      let totalOriginal = 0

      properties.forEach(property => {
        const marketData = marketDataService.getMarketData(property.id)
        if (marketData) {
          totalCurrent += marketData.currentPrice
          totalOriginal += marketData.originalPrice
        } else {
          totalCurrent += property.price
          totalOriginal += property.price
        }
      })

      if (totalCurrent !== previousValue) {
        setIsFlashing(true)
        setPreviousValue(totalCurrent)
        setTimeout(() => setIsFlashing(false), 500)
      }

      setPortfolioValue(totalCurrent)
      setTotalChange(totalCurrent - totalOriginal)
      setTotalChangePercent(totalOriginal > 0 ? ((totalCurrent - totalOriginal) / totalOriginal) * 100 : 0)
    }

    updatePortfolioValue()

    const unsubscribers = properties.map(property =>
      marketDataService.subscribe(property.id, updatePortfolioValue)
    )

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [properties, previousValue])

  const trend = totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'stable'

  return (
    <Card className="bg-gradient-to-br from-onyx-surface to-onyx-deep border-champagne-gold/30 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-champagne-gold/5 to-transparent" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="w-12 h-12 rounded-full bg-champagne-gold/10 flex items-center justify-center"
            animate={{ scale: isFlashing ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <DollarSign className="w-6 h-6 text-champagne-gold" />
          </motion.div>
          <div>
            <h3 className="text-sm uppercase tracking-wider text-slate-grey">
              Total Portfolio Value
            </h3>
            <p className="text-xs text-muted-foreground">Live across {properties.length} properties</p>
          </div>
        </div>

        <motion.div
          className="mb-4"
          animate={{ scale: isFlashing ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={portfolioValue}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-4xl font-bold text-champagne-gold"
            >
              ${portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${trend}-${totalChangePercent}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-2 ${
              trend === 'up'
                ? 'text-green-500'
                : trend === 'down'
                ? 'text-red-500'
                : 'text-slate-grey'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-5 h-5" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5" />}
            <span className="text-lg font-semibold">
              {totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-sm text-muted-foreground">
              ({totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
            </span>
          </motion.div>
        </AnimatePresence>

        {isFlashing && (
          <motion.div
            className="absolute inset-0 bg-champagne-gold/10 rounded-lg"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    </Card>
  )
})

export { PortfolioValueTracker }
