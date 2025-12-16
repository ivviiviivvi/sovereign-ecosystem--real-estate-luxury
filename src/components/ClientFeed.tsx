import { useState } from 'react'
import { motion, useMotionValue, PanInfo, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { FlippablePropertyCard } from './FlippablePropertyCard'
import { ARPropertyViewer } from './ARPropertyViewer'
import { PropertyComparisonSlider } from './PropertyComparisonSlider'
import { Button } from './ui/button'
import { Camera, ArrowLeftRight } from 'lucide-react'
import { soundManager } from '@/lib/sound-manager'

interface ClientFeedProps {
  properties: Property[]
  onBack: () => void
}

export function ClientFeed({ properties, onBack }: ClientFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [arProperty, setArProperty] = useState<Property | null>(null)
  const [comparisonPair, setComparisonPair] = useState<[Property, Property] | null>(null)
  const y = useMotionValue(0)

  const currentProperty = properties[currentIndex]

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -100 && currentIndex < properties.length - 1) {
      soundManager.play('glassTap')
      setCurrentIndex(currentIndex + 1)
    } else if (info.offset.y > 100 && currentIndex > 0) {
      soundManager.play('glassTap')
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleARView = () => {
    setArProperty(currentProperty)
    soundManager.play('glassTap')
  }

  const handleComparisonSlider = () => {
    if (properties.length > 1) {
      const otherIndex = currentIndex === 0 ? 1 : currentIndex - 1
      setComparisonPair([currentProperty, properties[otherIndex]])
      soundManager.play('glassTap')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-white via-background to-lavender-mist/20 dark:from-midnight-blue dark:via-background dark:to-moonlit-indigo/30 overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-card/70 via-card/40 to-transparent backdrop-blur-2xl border-b border-border/20">
        <h1 className="text-2xl font-light text-foreground tracking-wide">Sovereign</h1>
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-rose-blush dark:hover:text-moonlit-lavender transition-colors text-sm font-light focus:outline-none focus:ring-2 focus:ring-rose-blush/50 dark:focus:ring-moonlit-lavender/50 rounded-lg px-3 py-2"
          aria-label="Exit to main menu"
        >
          Exit
        </button>
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
          onClick={handleARView}
          className="bg-card/90 backdrop-blur-xl border border-border/40 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 shadow-lg flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          AR View
        </Button>
        {properties.length > 1 && (
          <Button
            onClick={handleComparisonSlider}
            variant="secondary"
            className="bg-card/90 backdrop-blur-xl border border-border/40 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50 shadow-lg flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Compare
          </Button>
        )}
      </div>

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
    </div>
  )
}
