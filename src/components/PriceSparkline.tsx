import { useEffect, useState } from 'react'
import { useMarketData } from '@/hooks/use-market-data'
import { motion } from 'framer-motion'

interface PriceSparklineProps {
  propertyId: string
  height?: number
  width?: number
  points?: number
}

export function PriceSparkline({
  propertyId,
  height = 40,
  width = 120,
  points = 20
}: PriceSparklineProps) {
  const marketData = useMarketData(propertyId)
  const [priceHistory, setPriceHistory] = useState<number[]>([])

  useEffect(() => {
    if (marketData) {
      setPriceHistory(prev => {
        const newHistory = [...prev, marketData.currentPrice]
        return newHistory.slice(-points)
      })
    }
  }, [marketData?.currentPrice, points])

  if (priceHistory.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-slate-grey text-xs"
      >
        Loading...
      </div>
    )
  }

  const min = Math.min(...priceHistory)
  const max = Math.max(...priceHistory)
  const range = max - min || 1

  const normalizedPoints = priceHistory.map((price, index) => ({
    x: (index / (priceHistory.length - 1)) * width,
    y: height - ((price - min) / range) * height
  }))

  const pathData = normalizedPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaData = `${pathData} L ${width} ${height} L 0 ${height} Z`

  const trend = marketData?.trend ?? 'stable'
  const strokeColor =
    trend === 'up'
      ? 'rgb(34, 197, 94)'
      : trend === 'down'
      ? 'rgb(239, 68, 68)'
      : 'rgb(148, 163, 184)'

  const fillColor =
    trend === 'up'
      ? 'rgba(34, 197, 94, 0.1)'
      : trend === 'down'
      ? 'rgba(239, 68, 68, 0.1)'
      : 'rgba(148, 163, 184, 0.1)'

  return (
    <motion.svg
      width={width}
      height={height}
      className="overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <defs>
        <linearGradient id={`gradient-${propertyId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <motion.path
        d={areaData}
        fill={`url(#gradient-${propertyId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      <motion.path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      <motion.circle
        cx={normalizedPoints[normalizedPoints.length - 1].x}
        cy={normalizedPoints[normalizedPoints.length - 1].y}
        r="3"
        fill={strokeColor}
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.svg>
  )
}
