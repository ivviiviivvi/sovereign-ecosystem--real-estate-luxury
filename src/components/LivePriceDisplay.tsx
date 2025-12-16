import { useMarketData } from '@/hooks/use-market-data'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LivePriceDisplayProps {
  propertyId: string
  originalPrice: number
  compact?: boolean
  showTrend?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LivePriceDisplay({
  propertyId,
  originalPrice,
  compact = false,
  showTrend = true,
  size = 'md'
}: LivePriceDisplayProps) {
  const marketData = useMarketData(propertyId)
  const [isFlashing, setIsFlashing] = useState(false)
  const [previousPrice, setPreviousPrice] = useState(originalPrice)

  useEffect(() => {
    if (marketData && marketData.currentPrice !== previousPrice) {
      setIsFlashing(true)
      setPreviousPrice(marketData.currentPrice)
      const timer = setTimeout(() => setIsFlashing(false), 500)
      return () => clearTimeout(timer)
    }
  }, [marketData?.currentPrice, previousPrice])

  const currentPrice = marketData?.currentPrice ?? originalPrice
  const priceChange = marketData?.priceChange ?? 0
  const priceChangePercent = marketData?.priceChangePercent ?? 0
  const trend = marketData?.trend ?? 'stable'

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  const changeSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={compact ? 'flex items-center gap-2' : 'space-y-1'}>
      <motion.div
        className={`font-bold text-champagne-gold ${sizeClasses[size]} relative`}
        animate={{
          scale: isFlashing ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={currentPrice}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            ${currentPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </motion.span>
        </AnimatePresence>
        
        {isFlashing && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-champagne-gold/20"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>

      {showTrend && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${trend}-${priceChangePercent}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`flex items-center gap-1 ${changeSizeClasses[size]} font-semibold ${
              trend === 'up'
                ? 'text-green-500'
                : trend === 'down'
                ? 'text-red-500'
                : 'text-slate-grey'
            }`}
          >
            {trend === 'up' && <TrendingUp className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />}
            {trend === 'down' && <TrendingDown className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />}
            {trend === 'stable' && <Minus className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />}
            <span>
              {priceChange >= 0 ? '+' : ''}${Math.abs(priceChange).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-muted-foreground">
              ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
