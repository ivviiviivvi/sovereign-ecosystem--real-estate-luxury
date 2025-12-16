import { useMarketTickers } from '@/hooks/use-market-data'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from './ui/card'

export function MarketActivityIndicator() {
  const tickers = useMarketTickers()

  const averageChange =
    tickers.reduce((sum, ticker) => sum + ticker.changePercent, 0) / tickers.length

  const marketSentiment =
    averageChange > 1 ? 'bullish' : averageChange < -1 ? 'bearish' : 'neutral'

  const sentimentColor =
    marketSentiment === 'bullish'
      ? 'text-green-500'
      : marketSentiment === 'bearish'
      ? 'text-red-500'
      : 'text-slate-grey'

  const sentimentBg =
    marketSentiment === 'bullish'
      ? 'bg-green-500/10'
      : marketSentiment === 'bearish'
      ? 'bg-red-500/10'
      : 'bg-slate-grey/10'

  return (
    <Card className="bg-onyx-surface border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-10 h-10 rounded-full ${sentimentBg} flex items-center justify-center`}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Activity className={`w-5 h-5 ${sentimentColor}`} />
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Market Activity</h3>
            <p className="text-xs text-slate-grey">Real-time sentiment</p>
          </div>
        </div>

        <div className="text-right">
          <div className={`flex items-center gap-1 ${sentimentColor} font-bold`}>
            {marketSentiment === 'bullish' && <TrendingUp className="w-4 h-4" />}
            {marketSentiment === 'bearish' && <TrendingDown className="w-4 h-4" />}
            <span className="text-lg">
              {averageChange >= 0 ? '+' : ''}
              {averageChange.toFixed(2)}%
            </span>
          </div>
          <p className={`text-xs font-semibold uppercase ${sentimentColor}`}>
            {marketSentiment}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {tickers.map((ticker) => (
          <div key={ticker.symbol} className="text-center">
            <p className="text-xs text-slate-grey mb-1">{ticker.symbol}</p>
            <motion.div
              className={`text-xs font-semibold ${
                ticker.trend === 'up'
                  ? 'text-green-500'
                  : ticker.trend === 'down'
                  ? 'text-red-500'
                  : 'text-slate-grey'
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
              key={ticker.changePercent}
            >
              {ticker.changePercent >= 0 ? '+' : ''}
              {ticker.changePercent.toFixed(1)}%
            </motion.div>
          </div>
        ))}
      </div>
    </Card>
  )
}
