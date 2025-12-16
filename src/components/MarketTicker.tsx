import { useMarketTickers } from '@/hooks/use-market-data'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function MarketTicker() {
  const tickers = useMarketTickers()

  return (
    <div className="bg-onyx-surface border-y border-border py-2 overflow-hidden">
      <div className="flex items-center gap-8 animate-marquee">
        {tickers.map((ticker, index) => (
          <TickerItem key={ticker.symbol} ticker={ticker} index={index} />
        ))}
        {tickers.map((ticker, index) => (
          <TickerItem key={`${ticker.symbol}-duplicate`} ticker={ticker} index={index} />
        ))}
      </div>
    </div>
  )
}

function TickerItem({ ticker, index }: { ticker: any; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 whitespace-nowrap"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <span className="text-slate-grey text-xs font-semibold">{ticker.symbol}</span>
      <span className="text-foreground text-sm font-medium">
        {ticker.value.toFixed(2)}
      </span>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${ticker.symbol}-${ticker.trend}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`flex items-center gap-1 text-xs font-semibold ${
            ticker.trend === 'up'
              ? 'text-green-500'
              : ticker.trend === 'down'
              ? 'text-red-500'
              : 'text-slate-grey'
          }`}
        >
          {ticker.trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {ticker.trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {ticker.trend === 'stable' && <Minus className="w-3 h-3" />}
          <span>
            {ticker.changePercent >= 0 ? '+' : ''}
            {ticker.changePercent.toFixed(2)}%
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
