import { useState, useEffect } from 'react'
import { detectLanguage, LanguageDetectionResult } from '@/lib/language-detection'
import { SupportedLanguage } from '@/lib/translations'

export function useLanguageDetection(options: {
  autoDetect?: boolean
  useGeolocation?: boolean
} = {}) {
  const { autoDetect = false, useGeolocation = false } = options
  const [detectionResult, setDetectionResult] = useState<LanguageDetectionResult | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!autoDetect) return

    const performDetection = async () => {
      setIsDetecting(true)
      setError(null)

      try {
        const result = await detectLanguage({ useGeolocation })
        setDetectionResult(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsDetecting(false)
      }
    }

    performDetection()
  }, [autoDetect, useGeolocation])

  const detect = async () => {
    setIsDetecting(true)
    setError(null)

    try {
      const result = await detectLanguage({ useGeolocation })
      setDetectionResult(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setIsDetecting(false)
    }
  }

  return {
    detectionResult,
    isDetecting,
    error,
    detect,
    detectedLanguage: detectionResult?.detected,
    detectionSource: detectionResult?.source,
    confidence: detectionResult?.confidence
  }
}
