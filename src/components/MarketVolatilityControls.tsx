import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Play, Pause, Zap, Clock, Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Card } from './ui/card'
import { Slider } from './ui/slider'
import { Button } from './ui/button'
import { useMarketConfig } from '@/hooks/use-market-data'
import { marketDataService } from '@/lib/market-data'
import { soundManager } from '@/lib/sound-manager'

type PresetScenario = 'bull' | 'bear' | 'crash' | null

interface ScenarioPreset {
  name: string
  icon: React.ReactNode
  volatility: number
  frequency: number
  color: string
  bgColor: string
  description: string
}

const scenarios: Record<PresetScenario & string, ScenarioPreset> = {
  bull: {
    name: 'Bull Market',
    icon: <TrendingUp className="w-4 h-4" />,
    volatility: 0.005,
    frequency: 0.5,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    description: 'Steady upward growth, low volatility'
  },
  bear: {
    name: 'Bear Market',
    icon: <TrendingDown className="w-4 h-4" />,
    volatility: 0.015,
    frequency: 0.3,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    description: 'Downward pressure, moderate volatility'
  },
  crash: {
    name: 'Flash Crash',
    icon: <AlertTriangle className="w-4 h-4" />,
    volatility: 0.08,
    frequency: 2.5,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    description: 'Extreme volatility, rapid price swings'
  }
}

const MarketVolatilityControls = memo(function MarketVolatilityControls() {
  const config = useMarketConfig()
  const [isExpanded, setIsExpanded] = useState(false)
  const [volatility, setVolatility] = useState(config.volatility)
  const [frequency, setFrequency] = useState(1 / (config.updateFrequency / 1000))
  const [activeScenario, setActiveScenario] = useState<PresetScenario>(null)

  const handleTogglePause = () => {
    soundManager.play('glassTap')
    if (config.isPaused) {
      marketDataService.resume()
    } else {
      marketDataService.pause()
    }
  }

  const handleVolatilityChange = (value: number[]) => {
    const newVolatility = value[0] / 100
    setVolatility(newVolatility)
    marketDataService.setVolatility(newVolatility)
    setActiveScenario(null)
    soundManager.play('glassTap')
  }

  const handleFrequencyChange = (value: number[]) => {
    const newFrequency = value[0] / 10
    setFrequency(newFrequency)
    const multiplier = 1 / newFrequency
    marketDataService.setUpdateFrequency(multiplier)
    setActiveScenario(null)
    soundManager.play('glassTap')
  }

  const applyScenario = (scenario: string) => {
    const preset = scenarios[scenario]
    if (!preset) return
    
    setVolatility(preset.volatility)
    setFrequency(preset.frequency)
    marketDataService.setVolatility(preset.volatility)
    const multiplier = 1 / preset.frequency
    marketDataService.setUpdateFrequency(multiplier)
    setActiveScenario(scenario as PresetScenario)
    soundManager.play('glassTap')
  }

  const getVolatilityLevel = () => {
    if (volatility < 0.01) return 'Calm'
    if (volatility < 0.03) return 'Moderate'
    if (volatility < 0.06) return 'High'
    return 'Extreme'
  }

  const getFrequencyLabel = () => {
    if (frequency < 0.2) return 'Slow'
    if (frequency < 0.5) return 'Normal'
    if (frequency < 1) return 'Fast'
    return 'Real-time'
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Button
              onClick={() => {
                setIsExpanded(true)
                soundManager.play('glassTap')
              }}
              className="w-14 h-14 rounded-full bg-onyx-surface border-2 border-champagne-gold hover:bg-onyx-surface hover:border-champagne-gold/80 shadow-lg"
              size="icon"
            >
              <Settings className="w-6 h-6 text-champagne-gold" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
          >
            <Card className="bg-onyx-surface border-champagne-gold/30 p-6 w-80 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-champagne-gold/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-champagne-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-champagne-gold">Market Controls</h3>
                </div>
                <Button
                  onClick={() => {
                    setIsExpanded(false)
                    soundManager.play('glassTap')
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-slate-grey hover:text-champagne-gold"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-champagne-gold" />
                    <span className="text-sm font-semibold text-foreground">
                      Scenario Presets
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(scenarios).map(([key, preset]) => (
                      <motion.button
                        key={key}
                        onClick={() => applyScenario(key)}
                        className={`relative p-3 rounded-lg border transition-all text-left ${
                          activeScenario === key
                            ? preset.bgColor
                            : 'bg-onyx-deep/30 border-border hover:border-champagne-gold/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`${preset.color}`}>
                              {preset.icon}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${
                                activeScenario === key ? preset.color : 'text-foreground'
                              }`}>
                                {preset.name}
                              </p>
                              <p className="text-xs text-slate-grey mt-0.5">
                                {preset.description}
                              </p>
                            </div>
                          </div>
                          {activeScenario === key && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-2 h-2 rounded-full ${preset.color.replace('text-', 'bg-')}`}
                            />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-champagne-gold" />
                      <span className="text-sm font-semibold text-foreground">
                        Volatility
                      </span>
                    </div>
                    <motion.span
                      key={getVolatilityLevel()}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xs font-bold text-champagne-gold bg-champagne-gold/10 px-2 py-1 rounded"
                    >
                      {getVolatilityLevel()}
                    </motion.span>
                  </div>
                  <Slider
                    value={[volatility * 100]}
                    onValueChange={handleVolatilityChange}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-grey mt-2">
                    <span>Low</span>
                    <span>{(volatility * 100).toFixed(1)}%</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-champagne-gold" />
                      <span className="text-sm font-semibold text-foreground">
                        Update Speed
                      </span>
                    </div>
                    <motion.span
                      key={getFrequencyLabel()}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xs font-bold text-champagne-gold bg-champagne-gold/10 px-2 py-1 rounded"
                    >
                      {getFrequencyLabel()}
                    </motion.span>
                  </div>
                  <Slider
                    value={[frequency * 10]}
                    onValueChange={handleFrequencyChange}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-grey mt-2">
                    <span>Slow</span>
                    <span>{(config.updateFrequency / 1000).toFixed(1)}s</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <Button
                    onClick={handleTogglePause}
                    className={`w-full ${
                      config.isPaused
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {config.isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume Market
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Market
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-onyx-deep/50 rounded-lg p-3 border border-border">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-xs text-slate-grey uppercase tracking-wider mb-1">
                        Status
                      </p>
                      <motion.div
                        animate={{
                          scale: config.isPaused ? 1 : [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: config.isPaused ? 0 : Infinity
                        }}
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          config.isPaused ? 'text-slate-grey' : 'text-green-500'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            config.isPaused ? 'bg-slate-grey' : 'bg-green-500'
                          }`}
                        />
                        {config.isPaused ? 'Paused' : 'Live'}
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-grey uppercase tracking-wider mb-1">
                        Interval
                      </p>
                      <p className="text-xs font-semibold text-champagne-gold">
                        {(config.updateFrequency / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export { MarketVolatilityControls }
