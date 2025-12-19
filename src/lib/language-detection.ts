import { SupportedLanguage } from './translations'

interface GeoLocation {
  country?: string
  timezone?: string
}

const countryToLanguageMap: Record<string, SupportedLanguage> = {
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  FR: 'fr',
  BE: 'fr',
  CH: 'fr',
  DE: 'de',
  AT: 'de',
  IT: 'it',
  PT: 'pt',
  BR: 'pt',
  CN: 'zh',
  TW: 'zh',
  HK: 'zh',
  SG: 'zh',
  JP: 'ja',
  SA: 'ar',
  AE: 'ar',
  EG: 'ar',
  MA: 'ar',
  RU: 'ru',
  BY: 'ru',
  KZ: 'ru'
}

const timezoneToLanguageMap: Record<string, SupportedLanguage> = {
  'America/New_York': 'en',
  'America/Los_Angeles': 'en',
  'America/Chicago': 'en',
  'America/Denver': 'en',
  'America/Mexico_City': 'es',
  'America/Buenos_Aires': 'es',
  'America/Bogota': 'es',
  'America/Lima': 'es',
  'America/Santiago': 'es',
  'Europe/London': 'en',
  'Europe/Madrid': 'es',
  'Europe/Paris': 'fr',
  'Europe/Berlin': 'de',
  'Europe/Rome': 'it',
  'Europe/Lisbon': 'pt',
  'Europe/Moscow': 'ru',
  'Asia/Tokyo': 'ja',
  'Asia/Shanghai': 'zh',
  'Asia/Hong_Kong': 'zh',
  'Asia/Dubai': 'ar',
  'Asia/Riyadh': 'ar'
}

function normalizeBrowserLanguage(lang: string): SupportedLanguage | null {
  const normalized = lang.toLowerCase().split('-')[0]
  
  const languageMap: Record<string, SupportedLanguage> = {
    en: 'en',
    es: 'es',
    fr: 'fr',
    de: 'de',
    it: 'it',
    pt: 'pt',
    zh: 'zh',
    ja: 'ja',
    ar: 'ar',
    ru: 'ru'
  }
  
  return languageMap[normalized] || null
}

function detectLanguageFromBrowser(): SupportedLanguage | null {
  if (typeof navigator === 'undefined') return null
  
  const languages = navigator.languages || [navigator.language]
  
  for (const lang of languages) {
    const detected = normalizeBrowserLanguage(lang)
    if (detected) return detected
  }
  
  return null
}

function detectLanguageFromTimezone(): SupportedLanguage | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return timezoneToLanguageMap[timezone] || null
  } catch {
    return null
  }
}

async function detectLanguageFromGeolocation(): Promise<SupportedLanguage | null> {
  try {
    const response = await fetch('https://ipapi.co/json/')
    if (!response.ok) return null
    
    const data = await response.json()
    const countryCode = data.country_code as string
    
    return countryToLanguageMap[countryCode] || null
  } catch {
    return null
  }
}

export interface LanguageDetectionResult {
  detected: SupportedLanguage
  source: 'browser' | 'timezone' | 'geolocation' | 'default'
  confidence: number
}

export async function detectLanguage(options: {
  useGeolocation?: boolean
  fallback?: SupportedLanguage
} = {}): Promise<LanguageDetectionResult> {
  const { useGeolocation = false, fallback = 'en' } = options
  
  const browserLang = detectLanguageFromBrowser()
  if (browserLang) {
    return {
      detected: browserLang,
      source: 'browser',
      confidence: 0.95
    }
  }
  
  const timezoneLang = detectLanguageFromTimezone()
  if (timezoneLang) {
    return {
      detected: timezoneLang,
      source: 'timezone',
      confidence: 0.7
    }
  }
  
  if (useGeolocation) {
    const geoLang = await detectLanguageFromGeolocation()
    if (geoLang) {
      return {
        detected: geoLang,
        source: 'geolocation',
        confidence: 0.8
      }
    }
  }
  
  return {
    detected: fallback,
    source: 'default',
    confidence: 0.5
  }
}

export function getLanguageDisplayInfo(result: LanguageDetectionResult): string {
  const sources = {
    browser: 'Browser Settings',
    timezone: 'System Timezone',
    geolocation: 'Location',
    default: 'Default'
  }
  
  return sources[result.source]
}

export function shouldPromptLanguageChange(
  currentLanguage: SupportedLanguage,
  detectedLanguage: SupportedLanguage,
  confidence: number
): boolean {
  return currentLanguage !== detectedLanguage && confidence >= 0.7
}
