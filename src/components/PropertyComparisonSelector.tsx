import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { GitCompare, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { soundManager } from '@/lib/sound-manager'
import { PropertyComparison } from './PropertyComparison'

interface PropertyComparisonSelectorProps {
  properties: Property[]
  initialSelectedIds?: string[]
}

export function PropertyComparisonSelector({ properties, initialSelectedIds = [] }: PropertyComparisonSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)
  const [showComparison, setShowComparison] = useState(false)

  const toggleProperty = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        soundManager.play('glassTap')
        return prev.filter(pid => pid !== id)
      } else if (prev.length < 4) {
        soundManager.play('success')
        return [...prev, id]
      } else {
        soundManager.play('error')
        return prev
      }
    })
  }

  const clearSelection = () => {
    setSelectedIds([])
    soundManager.play('glassTap')
  }

  const openComparison = () => {
    if (selectedIds.length >= 2) {
      setShowComparison(true)
      soundManager.play('success')
    }
  }

  const handleRemoveFromComparison = (id: string) => {
    setSelectedIds(prev => prev.filter(pid => pid !== id))
    if (selectedIds.length <= 2) {
      setShowComparison(false)
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedIds.length > 0 && !showComparison && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <div className="bg-onyx-surface border border-champagne-gold/30 rounded-lg shadow-2xl shadow-champagne-gold/20 p-4 min-w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-champagne-gold" />
                  <span className="text-sm font-semibold text-foreground">
                    Compare Properties
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {selectedIds.length}/4
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                {selectedIds.map(id => {
                  const property = properties.find(p => p.id === id)
                  if (!property) return null
                  return (
                    <div
                      key={id}
                      className="text-xs text-slate-grey bg-onyx-deep rounded px-2 py-1.5 flex items-center justify-between"
                    >
                      <span className="truncate flex-1">{property.title}</span>
                      <button
                        onClick={() => toggleProperty(id)}
                        className="text-slate-grey hover:text-champagne-gold ml-2"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="flex-1 text-xs"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={openComparison}
                  disabled={selectedIds.length < 2}
                  className="flex-1 text-xs bg-champagne-gold text-onyx-deep hover:bg-champagne-gold/90"
                >
                  Compare {selectedIds.length >= 2 && `(${selectedIds.length})`}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComparison && (
          <PropertyComparison
            properties={properties}
            selectedIds={selectedIds}
            onClose={() => setShowComparison(false)}
            onRemoveProperty={handleRemoveFromComparison}
          />
        )}
      </AnimatePresence>

      {!showComparison && (
        <PropertySelectionOverlay
          properties={properties}
          selectedIds={selectedIds}
          onToggle={toggleProperty}
        />
      )}
    </>
  )
}

interface PropertySelectionOverlayProps {
  properties: Property[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

function PropertySelectionOverlay({ properties, selectedIds, onToggle }: PropertySelectionOverlayProps) {
  return null
}

interface PropertyCardWithSelectionProps {
  property: Property
  isSelected: boolean
  onToggle: () => void
  children: React.ReactNode
  disabled?: boolean
}

export function PropertyCardWithSelection({ 
  property, 
  isSelected, 
  onToggle, 
  children,
  disabled = false
}: PropertyCardWithSelectionProps) {
  return (
    <div className="relative group">
      {children}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) {
            onToggle()
          }
        }}
        disabled={disabled}
        className={`absolute top-3 left-3 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
          isSelected
            ? 'bg-champagne-gold border-champagne-gold'
            : 'bg-onyx-surface/80 border-slate-grey/50 hover:border-champagne-gold'
        } ${disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <AnimatePresence mode="wait">
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-5 h-5 text-onyx-deep" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {disabled && !isSelected && (
        <div className="absolute top-12 left-3 bg-onyx-surface/90 text-xs text-slate-grey px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
          Max 4 properties
        </div>
      )}
    </div>
  )
}
