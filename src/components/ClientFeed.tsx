import { useState } from 'react'
import { motion, useMotionValue, PanInfo, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { FlippablePropertyCard } from './FlippablePropertyCard'
import { ARPropertyViewer } from './ARPropertyViewer'
import { PropertyComparisonSlider } from './PropertyComparisonSlider'
import { PropertySelector } from './PropertySelector'
import { PriceAlerts } from './PriceAlerts'
import { ComparisonHistoryViewer } from './ComparisonHistoryViewer'
import { FeatureDemoGuide } from './FeatureDemoGuide'
import { ARTutorialVideo } from './ARTutorialVideo'
import { VoiceGuidedARTutorial } from './VoiceGuidedARTutorial'
import { CollaborationTestRunner } from './CollaborationTestRunner'
import { Button } from './ui/button'
import { Camera, ArrowLeftRight, BookOpen, GraduationCap } from 'lucide-react'
import { soundManager } from '@/lib/sound-manager'

interface ClientFeedProps {
  properties: Property[]
  onBack: () => void
}

export function ClientFeed({ properties, onBack }: ClientFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [arProperty, setArProperty] = useState<Property | null>(null)
  const [comparisonPair, setComparisonPair] = useState<[Property, Property] | null>(null)
  const [showARSelector, setShowARSelector] = useState(false)
  const [showComparisonSelector, setShowComparisonSelector] = useState(false)
  const [showDemoGuide, setShowDemoGuide] = useState(false)
  const y = useMotionValue(0)

  const currentProperty = properties[currentIndex]

  if (!properties || properties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h2 className="text-2xl font-light mb-4">No properties available</h2>
          <Button onClick={onBack}>Return to Menu</Button>
        </div>
      </div>
    )
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -100 && currentIndex < properties.length - 1) {
      soundManager.play('glassTap')
      setCurrentIndex(currentIndex + 1)
    } else if (info.offset.y > 100 && currentIndex > 0) {
      soundManager.play('glassTap')
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleARViewClick = () => {
    if (properties.length === 1) {
      setArProperty(properties[0])
    } else {
      setShowARSelector(true)
    }
    soundManager.play('glassTap')
  }

  const handleComparisonClick = () => {
    if (properties.length === 2) {
      setComparisonPair([properties[0], properties[1]])
    } else if (properties.length > 2) {
      setShowComparisonSelector(true)
    }
    soundManager.play('glassTap')
  }

  const handleARPropertySelected = (selectedProperties: Property[]) => {
    setArProperty(selectedProperties[0])
    setShowARSelector(false)
  }

  const handleComparisonPropertiesSelected = (selectedProperties: Property[]) => {
    setComparisonPair([selectedProperties[0], selectedProperties[1]])
    setShowComparisonSelector(false)
  }

  const handleRevisitComparison = (propertyIds: string[]) => {
    const selectedProperties = properties.filter(p => propertyIds.includes(p.id))
    if (selectedProperties.length >= 2) {
      setComparisonPair([selectedProperties[0], selectedProperties[1]])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/20 dark:from-midnight-blue dark:via-background dark:to-moonlit-indigo/30 overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-card/70 via-card/40 to-transparent backdrop-blur-2xl border-b border-border/20">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-light text-foreground tracking-wide">Sovereign</h1>
          <div className="hidden lg:flex items-center gap-2 bg-muted/30 rounded-full px-4 py-2">
            <GraduationCap className="w-4 h-4 text-rose-blush dark:text-moonlit-lavender" />
            <span className="text-sm text-muted-foreground">Tutorials Available</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <VoiceGuidedARTutorial />
          <ARTutorialVideo />
          <CollaborationTestRunner />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowDemoGuide(true)
              soundManager.play('glassTap')
            }}
            className="gap-2 text-muted-foreground hover:text-rose-blush dark:hover:text-moonlit-lavender"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Demo</span>
          </Button>
          <PriceAlerts properties={properties} />
          <ComparisonHistoryViewer 
            properties={properties} 
            onRevisit={handleRevisitComparison}
          />
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-rose-blush dark:hover:text-moonlit-lavender transition-colors text-sm font-light focus:outline-none focus:ring-2 focus:ring-rose-blush/50 dark:focus:ring-moonlit-lavender/50 rounded-lg px-3 py-2"
            aria-label="Exit to main menu"
          >
            Exit
          </button>
        </div>
      </header>

      <div className="h-screen flex items-center justify-center p-4">
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="w-full max-w-lg h-full max-h-[85vh] relative"
        >
          <FlippablePropertyCard property={currentProperty} index={currentIndex} />
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-50" role="navigation" aria-label="Property navigation">
        {properties.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender'
                : 'w-2 bg-muted-foreground/30'
            }`}
            role="progressbar"
            aria-valuenow={index === currentIndex ? 100 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Property ${index + 1} of ${properties.length}`}
          />
        ))}
      </div>

      <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-4 z-50">
        <Button
          onClick={handleARViewClick}
          className="bg-card/90 backdrop-blur-xl border border-border/40 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 shadow-lg flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          AR View
        </Button>
        {properties.length > 1 && (
          <Button
            onClick={handleComparisonClick}
            variant="secondary"
            className="bg-card/90 backdrop-blur-xl border border-border/40 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 shadow-lg flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Compare
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showARSelector && (
          <PropertySelector
            properties={properties}
            mode="ar"
            maxSelection={1}
            onConfirm={handleARPropertySelected}
            onClose={() => setShowARSelector(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComparisonSelector && (
          <PropertySelector
            properties={properties}
            mode="comparison"
            maxSelection={2}
            onConfirm={handleComparisonPropertiesSelected}
            onClose={() => setShowComparisonSelector(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {arProperty && (
          <ARPropertyViewer
            property={arProperty}
            onClose={() => setArProperty(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {comparisonPair && (
          <PropertyComparisonSlider
            propertyA={comparisonPair[0]}
            propertyB={comparisonPair[1]}
            onClose={() => setComparisonPair(null)}
          />
        )}
      </AnimatePresence>

      <FeatureDemoGuide
        isOpen={showDemoGuide}
        onClose={() => setShowDemoGuide(false)}
      />
    </div>
  )
}
