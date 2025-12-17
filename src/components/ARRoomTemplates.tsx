import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Check, Info, ChevronRight, Ruler, Home
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { spatialRecognitionService, RoomTemplate, SpatialAnalysis } from '@/lib/spatial-recognition-service'
import { MeasurementPreset } from '@/lib/types'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface ARRoomTemplatesProps {
  onSelectTemplate: (template: RoomTemplate, preset: MeasurementPreset) => void
  currentDimensions?: { width: number; length: number; height: number }
}

export function ARRoomTemplates({ onSelectTemplate, currentDimensions }: ARRoomTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<RoomTemplate | null>(null)
  const [spatialAnalysis, setSpatialAnalysis] = useState<SpatialAnalysis | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const templates = spatialRecognitionService.getRoomTemplates()

  const handleAnalyzeSpace = () => {
    if (!currentDimensions) {
      toast.info('Measure room dimensions first', {
        description: 'Take width, length, and height measurements to enable auto-detection'
      })
      return
    }

    const analysis = spatialRecognitionService.analyzeSpace(
      currentDimensions.width,
      currentDimensions.length,
      currentDimensions.height
    )

    setSpatialAnalysis(analysis)
    setShowAnalysis(true)
    setSelectedTemplate(analysis.suggestedTemplate)
    
    soundManager.play('success')
    toast.success('Room detected!', {
      description: `${analysis.detectedRoomType} (${Math.round(analysis.confidence)}% confidence)`
    })
  }

  const handleSelectTemplate = (template: RoomTemplate) => {
    setSelectedTemplate(template)
    soundManager.play('glassTap')
  }

  const handleSelectPreset = (preset: MeasurementPreset) => {
    if (!selectedTemplate) return

    onSelectTemplate(selectedTemplate, preset)
    setIsOpen(false)
    soundManager.play('success')
    toast.success(`Using ${preset.name}`, {
      description: `From ${selectedTemplate.name} template`
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-500'
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-500'
    return 'text-orange-600 dark:text-orange-500'
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
          onClick={() => soundManager.play('glassTap')}
        >
          <Sparkles className="w-4 h-4" />
          Room Templates
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AR Room Templates
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Auto-detect room types and apply measurement templates
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {currentDimensions && (
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Spatial Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze current space to auto-detect room type and suggest measurements
                  </p>
                </div>
                <Button
                  onClick={handleAnalyzeSpace}
                  className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Space
                </Button>
              </div>
            </Card>
          )}

          <AnimatePresence>
            {showAnalysis && spatialAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-4 bg-gradient-to-br from-rose-blush/10 to-rose-gold/10 dark:from-moonlit-violet/10 dark:to-moonlit-lavender/10 border-2 border-rose-blush/30 dark:border-moonlit-lavender/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center text-2xl flex-shrink-0">
                      {spatialAnalysis.suggestedTemplate.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif text-xl text-foreground">
                          {spatialAnalysis.detectedRoomType}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={getConfidenceColor(spatialAnalysis.confidence)}
                        >
                          {Math.round(spatialAnalysis.confidence)}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {spatialAnalysis.suggestedTemplate.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Detection Confidence</span>
                          <span className="text-foreground font-medium">
                            {Math.round(spatialAnalysis.confidence)}%
                          </span>
                        </div>
                        <Progress 
                          value={spatialAnalysis.confidence} 
                          className="h-2"
                        />
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Width</p>
                          <p className="text-sm font-medium text-foreground">
                            {spatialAnalysis.dimensions.width.toFixed(1)} ft
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Length</p>
                          <p className="text-sm font-medium text-foreground">
                            {spatialAnalysis.dimensions.length.toFixed(1)} ft
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Area</p>
                          <p className="text-sm font-medium text-foreground">
                            {spatialAnalysis.dimensions.area.toFixed(0)} sq ft
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Volume</p>
                          <p className="text-sm font-medium text-foreground">
                            {spatialAnalysis.dimensions.volume.toFixed(0)} cu ft
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-3">Room Types</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {templates.map(template => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`p-3 cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'bg-rose-blush/10 dark:bg-moonlit-lavender/10 border-rose-blush dark:border-moonlit-lavender'
                            : 'bg-muted/20 hover:bg-muted/40'
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{template.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">
                                {template.name}
                              </h4>
                              {selectedTemplate?.id === template.id && (
                                <Check className="w-4 h-4 text-rose-blush dark:text-moonlit-lavender" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Ruler className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {template.measurements.length} measurements
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-3">
                {selectedTemplate ? `${selectedTemplate.name} Measurements` : 'Select a Room Type'}
              </h3>
              
              {selectedTemplate ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Info className="w-4 h-4" />
                        <span>Typical dimensions for {selectedTemplate.name.toLowerCase()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-background/50 rounded p-2">
                          <p className="text-muted-foreground mb-1">Width</p>
                          <p className="text-foreground font-medium">
                            {selectedTemplate.typicalDimensions.width.typical} ft
                          </p>
                        </div>
                        <div className="bg-background/50 rounded p-2">
                          <p className="text-muted-foreground mb-1">Length</p>
                          <p className="text-foreground font-medium">
                            {selectedTemplate.typicalDimensions.length.typical} ft
                          </p>
                        </div>
                        <div className="bg-background/50 rounded p-2">
                          <p className="text-muted-foreground mb-1">Height</p>
                          <p className="text-foreground font-medium">
                            {selectedTemplate.typicalDimensions.height.typical} ft
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {selectedTemplate.measurements.map(preset => (
                      <Card
                        key={preset.id}
                        className="p-3 bg-background/50 hover:bg-background transition-all cursor-pointer"
                        onClick={() => handleSelectPreset(preset)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-xl">{preset.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground text-sm mb-1">
                                {preset.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {preset.description}
                              </p>
                              {preset.defaultLength && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Default: {preset.defaultLength} ft
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectPreset(preset)
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Home className="w-16 h-16 text-muted-foreground mb-4" />
                  <h4 className="font-medium text-foreground mb-2">No Room Selected</h4>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Select a room type to see available measurement presets
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
