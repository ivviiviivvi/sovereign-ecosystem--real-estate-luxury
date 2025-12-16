import { useMarketTickers } from '@/hooks/use-market-data'
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from './ui/card'
import { PortfolioValueTracker } from './PortfolioValueTracker'
import { Property } from '@/lib/types'

interface MarketOverviewProps {
  properties?: Property[]
}

export function MarketOverview({ properties = [] }: MarketOverviewProps) {
  const tickers = useMarketTickers()

  const averageChange =
    tickers.reduce((sum, ticker) => sum + ticker.changePercent, 0) / tickers.length

  const marketSentiment =
    averageChange > 1 ? 'bullish' : averageChange < -1 ? 'bearish' : 'neutral'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-champagne-gold mb-2">Market Overview</h2>
        <p className="text-slate-grey">Real-time market intelligence</p>
      </div>

      {properties.length > 0 && (
        <PortfolioValueTracker properties={properties} />
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tickers.map((ticker, index) => (
          <motion.div
            key={ticker.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-onyx-surface border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-grey text-xs uppercase tracking-wider mb-1">
                    {ticker.symbol}
                  </p>
                  <h3 className="text-sm font-medium text-foreground">{ticker.name}</h3>
                </div>
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ticker.trend === 'up'
                      ? 'bg-green-500/10'
                      : ticker.trend === 'down'
                      ? 'bg-red-500/10'
                      : 'bg-slate-grey/10'
                  }`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {ticker.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {ticker.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {ticker.trend === 'stable' && <Activity className="w-4 h-4 text-slate-grey" />}
                </motion.div>
              </div>

              <div className="space-y-2">
                <motion.p
                  className="text-2xl font-bold text-champagne-gold"
                  key={ticker.value}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {ticker.value.toFixed(2)}
                </motion.p>
                <motion.p
                  className={`text-sm font-semibold ${
                    ticker.trend === 'up'
                      ? 'text-green-500'
                      : ticker.trend === 'down'
                      ? 'text-red-500'
                      : 'text-slate-grey'
                  }`}
                  key={ticker.changePercent}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {ticker.changePercent >= 0 ? '+' : ''}
                  {ticker.changePercent.toFixed(2)}%
                </motion.p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-onyx-surface border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                marketSentiment === 'bullish'
                  ? 'bg-green-500/10'
                  : marketSentiment === 'bearish'
                  ? 'bg-red-500/10'
                  : 'bg-slate-grey/10'
              }`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3
                className={`w-6 h-6 ${
                  marketSentiment === 'bullish'
                    ? 'text-green-500'
                    : marketSentiment === 'bearish'
                    ? 'text-red-500'
                    : 'text-slate-grey'
                }`}
              />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Overall Market Sentiment</h3>
              <p className="text-slate-grey text-sm">Based on all indices</p>
            </div>
          </div>

          <div className="text-right">
            <motion.p
              className={`text-3xl font-bold ${
                marketSentiment === 'bullish'
                  ? 'text-green-500'
                  : marketSentiment === 'bearish'
                  ? 'text-red-500'
                  : 'text-slate-grey'
              }`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5 }}
              key={averageChange}
            >
              {averageChange >= 0 ? '+' : ''}
              {averageChange.toFixed(2)}%
            </motion.p>
            <p
              className={`text-sm font-semibold uppercase tracking-wider ${
                marketSentiment === 'bullish'
                  ? 'text-green-500'
                  : marketSentiment === 'bearish'
                  ? 'text-red-500'
                  : 'text-slate-grey'
              }`}
            >
              {marketSentiment}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-grey text-xs uppercase tracking-wider mb-1">
                Highest Gainer
              </p>
              <p className="text-champagne-gold font-semibold">
                {tickers.reduce((max, ticker) =>
                  ticker.changePercent > max.changePercent ? ticker : max
                ).symbol}
              </p>
            </div>
            <div>
              <p className="text-slate-grey text-xs uppercase tracking-wider mb-1">
                Lowest Performer
              </p>
              <p className="text-champagne-gold font-semibold">
                {tickers.reduce((min, ticker) =>
                  ticker.changePercent < min.changePercent ? ticker : min
                ).symbol}
              </p>
            </div>
            <div>
              <p className="text-slate-grey text-xs uppercase tracking-wider mb-1">
                Active Markets
              </p>
              <p className="text-champagne-gold font-semibold">{tickers.length}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
