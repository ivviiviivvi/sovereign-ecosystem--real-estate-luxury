import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { 
  X, GitCompare, TrendingUp, TrendingDown, Home, DollarSign, Calendar, 
  Maximize2, Droplet, Zap, AlertCircle, CheckCircle, Sparkles, ChevronRight,
  Award, Target, AlertTriangle, Lightbulb, ArrowUpRight, ArrowDownRight,
  Minus
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface PropertyComparisonProps {
  properties: Property[]
  selectedIds: string[]
  onClose: () => void
  onRemoveProperty: (id: string) => void
}

interface ComparisonMetric {
  label: string
  getValue: (property: Property) => number | string | undefined
  format: (value: any) => string
  icon: React.ReactNode
  higherIsBetter?: boolean
}

interface AIInsight {
  type: 'winner' | 'consideration' | 'warning' | 'recommendation'
  title: string
  description: string
  propertyIds?: string[]
}

const metrics: ComparisonMetric[] = [
  {
    label: 'Price',
    getValue: (p) => p.price,
    format: (v) => `$${(v || 0).toLocaleString()}`,
    icon: <DollarSign className="w-4 h-4" />,
    higherIsBetter: false
  },
  {
    label: 'Cap Rate',
    getValue: (p) => p.capRate,
    format: (v) => v ? `${v.toFixed(2)}%` : 'N/A',
    icon: <TrendingUp className="w-4 h-4" />,
    higherIsBetter: true
  },
  {
    label: 'ROI',
    getValue: (p) => p.roi,
    format: (v) => v ? `${v.toFixed(2)}%` : 'N/A',
    icon: <Target className="w-4 h-4" />,
    higherIsBetter: true
  },
  {
    label: 'Current Rent',
    getValue: (p) => p.currentRent,
    format: (v) => v ? `$${v.toLocaleString()}/mo` : 'N/A',
    icon: <Home className="w-4 h-4" />
  },
  {
    label: 'Projected Rent',
    getValue: (p) => p.projectedRent,
    format: (v) => v ? `$${v.toLocaleString()}/mo` : 'N/A',
    icon: <ArrowUpRight className="w-4 h-4" />,
    higherIsBetter: true
  },
  {
    label: 'Bedrooms',
    getValue: (p) => p.bedrooms,
    format: (v) => `${v} bed`,
    icon: <Home className="w-4 h-4" />
  },
  {
    label: 'Bathrooms',
    getValue: (p) => p.bathrooms,
    format: (v) => `${v} bath`,
    icon: <Droplet className="w-4 h-4" />
  },
  {
    label: 'Square Feet',
    getValue: (p) => p.sqft,
    format: (v) => `${(v || 0).toLocaleString()} sq ft`,
    icon: <Maximize2 className="w-4 h-4" />
  },
  {
    label: 'Price per Sq Ft',
    getValue: (p) => p.sqft > 0 ? p.price / p.sqft : 0,
    format: (v) => `$${v.toFixed(2)}`,
    icon: <DollarSign className="w-4 h-4" />,
    higherIsBetter: false
  },
  {
    label: 'Year Built',
    getValue: (p) => p.yearBuilt,
    format: (v) => v ? v.toString() : 'N/A',
    icon: <Calendar className="w-4 h-4" />
  }
]

export function PropertyComparison({ properties, selectedIds, onClose, onRemoveProperty }: PropertyComparisonProps) {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [activeView, setActiveView] = useState<'grid' | 'details'>('grid')

  const selectedProperties = properties.filter(p => selectedIds.includes(p.id))

  useEffect(() => {
    if (selectedProperties.length >= 2) {
      generateAIInsights()
    }
  }, [selectedIds])

  const generateAIInsights = async () => {
    if (selectedProperties.length < 2) return

    setIsGeneratingInsights(true)
    
    try {
      const comparisonData = selectedProperties.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        capRate: p.capRate,
        roi: p.roi,
        sqft: p.sqft,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        currentRent: p.currentRent,
        projectedRent: p.projectedRent,
        yearBuilt: p.yearBuilt,
        hasLeadRisk: p.hasLeadRisk,
        complianceFlags: p.complianceFlags.length,
        isCurated: p.isCurated
      }))

      const prompt = spark.llmPrompt`You are a luxury real estate advisor analyzing properties for high-net-worth clients. Compare these properties and provide insights:

${JSON.stringify(comparisonData, null, 2)}

Provide 4-6 concise insights in the following categories:
1. winner - Which property stands out and why (focus on one clear winner)
2. consideration - Important factors to weigh when deciding
3. warning - Potential risks or concerns for any property
4. recommendation - Strategic advice based on the comparison

Format your response as a JSON object with a single property "insights" containing an array of insight objects. Each insight should have:
- type: "winner" | "consideration" | "warning" | "recommendation"
- title: A short compelling title (max 6 words)
- description: A detailed explanation (2-3 sentences, max 200 characters)
- propertyIds: Array of relevant property IDs (optional)

Be specific, use data points, and maintain a sophisticated tone appropriate for luxury real estate.`

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(response)
      
      if (parsed.insights && Array.isArray(parsed.insights)) {
        setAiInsights(parsed.insights)
        soundManager.play('success')
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error)
      toast.error('Unable to generate insights')
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const getBestValue = (metricIndex: number): string[] => {
    const metric = metrics[metricIndex]
    const values = selectedProperties.map(p => {
      const value = metric.getValue(p)
      return { id: p.id, value: typeof value === 'number' ? value : 0 }
    }).filter(v => v.value !== 0)

    if (values.length === 0) return []

    const best = metric.higherIsBetter === false
      ? Math.min(...values.map(v => v.value))
      : Math.max(...values.map(v => v.value))

    return values.filter(v => v.value === best).map(v => v.id)
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'winner':
        return <Award className="w-5 h-5 text-champagne-gold" />
      case 'consideration':
        return <Lightbulb className="w-5 h-5 text-blue-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />
      case 'recommendation':
        return <Sparkles className="w-5 h-5 text-purple-400" />
    }
  }

  const getInsightBorderColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'winner':
        return 'border-champagne-gold/30'
      case 'consideration':
        return 'border-blue-400/30'
      case 'warning':
        return 'border-orange-400/30'
      case 'recommendation':
        return 'border-purple-400/30'
    }
  }

  if (selectedProperties.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-onyx-surface border border-border rounded-lg p-8 max-w-md text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <GitCompare className="w-16 h-16 text-champagne-gold mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-foreground mb-2">Select Properties to Compare</h2>
          <p className="text-slate-grey mb-6">
            Choose at least 2 properties to view a detailed side-by-side comparison with AI insights.
          </p>
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        <div className="bg-onyx-surface border-b border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GitCompare className="w-6 h-6 text-champagne-gold" />
              <div>
                <h2 className="text-2xl font-serif text-foreground">Property Comparison</h2>
                <p className="text-sm text-slate-grey">Comparing {selectedProperties.length} properties</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView(activeView === 'grid' ? 'details' : 'grid')}
              >
                {activeView === 'grid' ? 'Detailed View' : 'Grid View'}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {selectedProperties.map(property => (
              <Badge
                key={property.id}
                variant="secondary"
                className="pl-3 pr-2 py-1.5 flex items-center gap-2"
              >
                <span className="text-sm">{property.title}</span>
                <button
                  onClick={() => {
                    onRemoveProperty(property.id)
                    soundManager.play('glassTap')
                  }}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <Card className="bg-gradient-to-br from-onyx-surface to-onyx-deep border-champagne-gold/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-champagne-gold" />
                  <div>
                    <h3 className="text-lg font-serif text-foreground">AI Analysis</h3>
                    <p className="text-sm text-slate-grey">Intelligent insights for your comparison</p>
                  </div>
                </div>
                {!isGeneratingInsights && aiInsights.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAIInsights}
                    className="text-champagne-gold border-champagne-gold/30 hover:bg-champagne-gold/10"
                  >
                    Regenerate
                  </Button>
                )}
              </div>

              {isGeneratingInsights ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="mb-4"
                    >
                      <Sparkles className="w-12 h-12 text-champagne-gold mx-auto" />
                    </motion.div>
                    <p className="text-slate-grey">Analyzing properties...</p>
                  </div>
                </div>
              ) : aiInsights.length > 0 ? (
                <div className="grid gap-3">
                  {aiInsights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-onyx-deep/50 border ${getInsightBorderColor(insight.type)} rounded-lg p-4 flex gap-3`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-slate-grey leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-grey">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>AI insights will appear here</p>
                </div>
              )}
            </Card>

            {activeView === 'grid' ? (
              <div className="grid gap-6">
                {metrics.map((metric, metricIdx) => {
                  const bestIds = getBestValue(metricIdx)
                  return (
                    <Card key={metric.label} className="bg-onyx-surface border-border p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="text-champagne-gold">{metric.icon}</div>
                        <h3 className="text-lg font-semibold text-foreground">{metric.label}</h3>
                      </div>
                      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedProperties.length}, minmax(0, 1fr))` }}>
                        {selectedProperties.map(property => {
                          const value = metric.getValue(property)
                          const formatted = metric.format(value)
                          const isBest = bestIds.includes(property.id) && bestIds.length < selectedProperties.length
                          
                          return (
                            <div
                              key={property.id}
                              className={`bg-onyx-deep rounded-lg p-4 text-center transition-all ${
                                isBest ? 'ring-2 ring-champagne-gold shadow-lg shadow-champagne-gold/20' : ''
                              }`}
                            >
                              <div className="text-xs text-slate-grey mb-2 truncate">
                                {property.title}
                              </div>
                              <div className={`text-lg font-semibold ${isBest ? 'text-champagne-gold' : 'text-foreground'}`}>
                                {formatted}
                              </div>
                              {isBest && (
                                <div className="mt-2">
                                  <Badge variant="secondary" className="text-xs bg-champagne-gold/10 text-champagne-gold border-champagne-gold/30">
                                    Best Value
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProperties.length}, minmax(0, 1fr))` }}>
                {selectedProperties.map(property => (
                  <Card key={property.id} className="bg-onyx-surface border-border overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      {property.isCurated && (
                        <Badge className="absolute top-3 right-3 bg-champagne-gold text-onyx-deep">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Curated
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <h3 className="text-lg font-serif text-foreground mb-1">{property.title}</h3>
                        <p className="text-sm text-slate-grey">{property.address}, {property.city}</p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        {metrics.map((metric, idx) => {
                          const value = metric.getValue(property)
                          const formatted = metric.format(value)
                          const bestIds = getBestValue(idx)
                          const isBest = bestIds.includes(property.id) && bestIds.length < selectedProperties.length

                          return (
                            <div key={metric.label} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-slate-grey">
                                <div className="w-4 h-4">{metric.icon}</div>
                                <span>{metric.label}</span>
                              </div>
                              <span className={`font-medium ${isBest ? 'text-champagne-gold' : 'text-foreground'}`}>
                                {formatted}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {property.complianceFlags.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            {property.complianceFlags.map((flag, idx) => (
                              <div
                                key={idx}
                                className={`text-xs px-2 py-1.5 rounded flex items-center gap-2 ${
                                  flag.severity === 'URGENT'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : flag.severity === 'WARNING'
                                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}
                              >
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{flag.message}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  )
}
