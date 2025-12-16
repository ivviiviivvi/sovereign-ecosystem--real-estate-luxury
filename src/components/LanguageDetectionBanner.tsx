import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, X, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { notificationDeliveryService } from '@/lib/notification-delivery'
import { getLanguageName, SupportedLanguage } from '@/lib/translations'
import { getLanguageDisplayInfo, LanguageDetectionResult } from '@/lib/language-detection'

export function LanguageDetectionBanner() {
  const [detectionResult, setDetectionResult] = useState<LanguageDetectionResult | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('language-detection-dismissed') === 'true'
  })

  useEffect(() => {
    const checkLanguage = async () => {
      if (isDismissed) return
      
      if (!notificationDeliveryService.hasDetectedLanguage()) {
        const result = await notificationDeliveryService.autoDetectLanguage(false)
        
        if (result.detected !== 'en' && result.confidence >= 0.7) {
          setDetectionResult(result)
          setIsVisible(true)
        }
      }
    }

    checkLanguage()
  }, [isDismissed])

  const handleAccept = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('language-detection-dismissed', 'true')
  }

  const handleDismiss = () => {
    if (detectionResult) {
      notificationDeliveryService.updatePreferences({
        whatsapp: {
          ...notificationDeliveryService.getPreferences().whatsapp,
          language: 'en'
        },
        telegram: {
          ...notificationDeliveryService.getPreferences().telegram,
          language: 'en'
        }
      })
    }
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('language-detection-dismissed', 'true')
  }

  if (!detectionResult || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
      >
        <Card className="bg-onyx-surface border-champagne-gold/30 shadow-2xl">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-champagne-gold/10">
                <Globe className="w-5 h-5 text-champagne-gold" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Language Detected
                </h3>
                <p className="text-xs text-slate-grey mb-3">
                  We detected <span className="text-champagne-gold font-semibold">{getLanguageName(detectionResult.detected)}</span> from your {getLanguageDisplayInfo(detectionResult).toLowerCase()}. 
                  Would you like to receive notifications in this language?
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    className="flex-1 gap-2 bg-champagne-gold hover:bg-champagne-gold/90 text-onyx-deep"
                  >
                    <Check className="w-4 h-4" />
                    Yes, use {getLanguageName(detectionResult.detected)}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismiss}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Keep English
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
