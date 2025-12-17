export interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  yearBuilt: number
  bedrooms: number
  bathrooms: number
  sqft: number
  imageUrl: string
  videoUrl?: string
  currentRent?: number
  projectedRent?: number
  capRate?: number
  roi?: number
  leaseEndDate?: string
  lastInspectionDate?: string
  isCurated: boolean
  fairMarketRent?: number
  legalRentCap?: number
  hasLeadRisk?: boolean
  complianceFlags: ComplianceFlag[]
}

export interface ComplianceFlag {
  type: 'GOOD_CAUSE_NY' | 'LEAD_WATCHDOG_NJ' | 'LEASE_EXPIRING'
  severity: 'URGENT' | 'WARNING' | 'INFO'
  message: string
  calculatedValue?: number
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
}

export interface Document {
  id: string
  propertyId: string
  title: string
  type: 'deed' | 'inspection' | 'lease' | 'financial' | 'other'
  thumbnailUrl: string
  uploadDate: string
  size: string
}

export type UserRole = 'agent' | 'client'

export interface User {
  role: UserRole
  inviteCode?: string
  authenticated: boolean
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  properties?: Property[]
  metadata?: {
    intent?: string
    confidence?: number
    suggestedActions?: string[]
  }
}

export interface ConciergeContext {
  recentProperties: Property[]
  userPreferences: any
  conversationHistory: ConversationMessage[]
  lastInteraction: Date
}

export interface PriceAlert {
  id: string
  minPrice: number
  maxPrice: number
  bedrooms?: number
  bathrooms?: number
  location?: string
  enabled: boolean
  createdAt: string
  lastNotified?: string
  matchedProperties?: string[]
}

export interface MeasurementPreset {
  id: string
  name: string
  description?: string
  defaultLength?: number
  icon?: string
  createdAt: string
}

export interface ComparisonHistory {
  id: string
  propertyIds: string[]
  snapshotUrl?: string
  createdAt: string
  title: string
  shareableLink?: string
}

export interface MeasurementAnnotation {
  id: string
  measurementId: string
  type: 'photo' | 'voice' | 'text'
  content: string
  thumbnailUrl?: string
  duration?: number
  createdAt: string
  createdBy?: string
}

export interface Measurement {
  id: string
  propertyId: string
  start: { x: number; y: number; z?: number }
  end: { x: number; y: number; z?: number }
  distance: number
  label?: string
  presetId?: string
  annotations: MeasurementAnnotation[]
  createdAt: string
  updatedAt: string
}

export interface MeasurementCollection {
  id: string
  name: string
  description?: string
  propertyIds: string[]
  measurements: Measurement[]
  sharedWith: string[]
  owner: string
  createdAt: string
  updatedAt: string
  tags?: string[]
}

export interface ContractorProfile {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  specialty?: string
  avatarUrl?: string
  inviteCode: string
  accessLevel: 'view' | 'comment' | 'edit'
}

export interface BatchExportJob {
  id: string
  name: string
  properties: string[]
  measurements: string[]
  format: 'csv' | 'json' | 'pdf' | 'zip'
  includeAnnotations: boolean
  includeSnapshots: boolean
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  createdAt: string
  completedAt?: string
}
