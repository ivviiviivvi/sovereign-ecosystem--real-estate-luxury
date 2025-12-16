import { Property } from './types'

export interface MarketData {
  propertyId: string
  currentPrice: number
  originalPrice: number
  priceChange: number
  priceChangePercent: number
  trend: 'up' | 'down' | 'stable'
  lastUpdate: Date
  velocity: number
  marketIndex: number
}

export interface MarketTicker {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

class MarketDataService {
  private marketData: Map<string, MarketData> = new Map()
  private subscribers: Map<string, Set<(data: MarketData) => void>> = new Map()
  private marketTickers: MarketTicker[] = []
  private tickerSubscribers: Set<(tickers: MarketTicker[]) => void> = new Set()
  private updateInterval: number | null = null
  private tickerInterval: number | null = null
  private baseUpdateFrequency = 3000
  private volatility = 0.02

  initialize(properties: Property[]) {
    properties.forEach(property => {
      this.marketData.set(property.id, {
        propertyId: property.id,
        currentPrice: property.price,
        originalPrice: property.price,
        priceChange: 0,
        priceChangePercent: 0,
        trend: 'stable',
        lastUpdate: new Date(),
        velocity: 0,
        marketIndex: 100
      })
    })

    this.marketTickers = [
      { symbol: 'REX', name: 'Real Estate Index', value: 100, change: 0, changePercent: 0, trend: 'stable' },
      { symbol: 'LUX', name: 'Luxury Market', value: 100, change: 0, changePercent: 0, trend: 'stable' },
      { symbol: 'MET', name: 'Metro Properties', value: 100, change: 0, changePercent: 0, trend: 'stable' },
      { symbol: 'COM', name: 'Commercial RE', value: 100, change: 0, changePercent: 0, trend: 'stable' }
    ]

    this.startUpdates()
    this.startTickerUpdates()
  }

  private startUpdates() {
    if (this.updateInterval) return

    this.updateInterval = window.setInterval(() => {
      this.marketData.forEach((data, propertyId) => {
        const randomFactor = (Math.random() - 0.5) * 2
        const changeAmount = data.originalPrice * this.volatility * randomFactor
        
        const previousPrice = data.currentPrice
        const newPrice = data.currentPrice + changeAmount
        
        data.currentPrice = Math.max(newPrice, data.originalPrice * 0.85)
        data.currentPrice = Math.min(data.currentPrice, data.originalPrice * 1.25)
        
        data.priceChange = data.currentPrice - data.originalPrice
        data.priceChangePercent = (data.priceChange / data.originalPrice) * 100
        
        data.velocity = data.currentPrice - previousPrice
        
        if (Math.abs(data.priceChangePercent) < 0.1) {
          data.trend = 'stable'
        } else if (data.velocity > 0) {
          data.trend = 'up'
        } else {
          data.trend = 'down'
        }
        
        data.lastUpdate = new Date()
        
        const marketInfluence = this.marketTickers[0].changePercent * 0.3
        data.marketIndex = 100 + marketInfluence
        
        this.notifySubscribers(propertyId, data)
      })
    }, this.baseUpdateFrequency) as unknown as number
  }

  private startTickerUpdates() {
    if (this.tickerInterval) return

    this.tickerInterval = window.setInterval(() => {
      this.marketTickers = this.marketTickers.map(ticker => {
        const randomFactor = (Math.random() - 0.5) * 2
        const changeAmount = ticker.value * 0.005 * randomFactor
        const previousValue = ticker.value
        
        ticker.value = Math.max(ticker.value + changeAmount, 80)
        ticker.value = Math.min(ticker.value, 120)
        
        ticker.change = ticker.value - 100
        ticker.changePercent = ticker.change
        
        if (Math.abs(ticker.changePercent) < 0.1) {
          ticker.trend = 'stable'
        } else if (ticker.value > previousValue) {
          ticker.trend = 'up'
        } else {
          ticker.trend = 'down'
        }
        
        return ticker
      })
      
      this.notifyTickerSubscribers()
    }, 2000) as unknown as number
  }

  subscribe(propertyId: string, callback: (data: MarketData) => void) {
    if (!this.subscribers.has(propertyId)) {
      this.subscribers.set(propertyId, new Set())
    }
    this.subscribers.get(propertyId)!.add(callback)

    const currentData = this.marketData.get(propertyId)
    if (currentData) {
      callback(currentData)
    }

    return () => {
      const subs = this.subscribers.get(propertyId)
      if (subs) {
        subs.delete(callback)
      }
    }
  }

  subscribeTickers(callback: (tickers: MarketTicker[]) => void) {
    this.tickerSubscribers.add(callback)
    callback(this.marketTickers)

    return () => {
      this.tickerSubscribers.delete(callback)
    }
  }

  private notifySubscribers(propertyId: string, data: MarketData) {
    const subs = this.subscribers.get(propertyId)
    if (subs) {
      subs.forEach(callback => callback(data))
    }
  }

  private notifyTickerSubscribers() {
    this.tickerSubscribers.forEach(callback => callback(this.marketTickers))
  }

  getMarketData(propertyId: string): MarketData | undefined {
    return this.marketData.get(propertyId)
  }

  getAllMarketData(): MarketData[] {
    return Array.from(this.marketData.values())
  }

  getMarketTickers(): MarketTicker[] {
    return this.marketTickers
  }

  setVolatility(level: number) {
    this.volatility = Math.max(0.001, Math.min(0.1, level))
  }

  pause() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval)
      this.tickerInterval = null
    }
  }

  resume() {
    this.startUpdates()
    this.startTickerUpdates()
  }

  cleanup() {
    this.pause()
    this.subscribers.clear()
    this.tickerSubscribers.clear()
    this.marketData.clear()
  }
}

export const marketDataService = new MarketDataService()
