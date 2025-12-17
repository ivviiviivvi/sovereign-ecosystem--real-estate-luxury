import { Measurement, MeasurementAnnotation } from './types'

export interface OfflineChange {
  id: string
  type: 'measurement_added' | 'measurement_updated' | 'measurement_deleted' | 'annotation_added'
  data: any
  timestamp: string
  synced: boolean
  retryCount: number
}

export interface SyncStatus {
  isOnline: boolean
  pendingChanges: number
  lastSyncTime: string | null
  syncInProgress: boolean
  failedSyncs: number
}

class OfflineSyncService {
  private isOnline: boolean = navigator.onLine
  private pendingChanges: OfflineChange[] = []
  private syncInProgress: boolean = false
  private listeners: Set<(status: SyncStatus) => void> = new Set()
  private lastSyncTime: string | null = null
  private failedSyncs: number = 0
  private readonly MAX_RETRIES = 3
  private readonly STORAGE_KEY = 'offline-pending-changes'

  constructor() {
    this.loadPendingChanges()
    this.setupEventListeners()
    
    if (this.isOnline) {
      this.sync()
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners()
      this.sync()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners()
    })
  }

  private loadPendingChanges(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.pendingChanges = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load pending changes:', error)
    }
  }

  private savePendingChanges(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pendingChanges))
    } catch (error) {
      console.error('Failed to save pending changes:', error)
    }
  }

  queueChange(type: OfflineChange['type'], data: any): string {
    const change: OfflineChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
      retryCount: 0
    }

    this.pendingChanges.push(change)
    this.savePendingChanges()
    this.notifyListeners()

    if (this.isOnline) {
      this.sync()
    }

    return change.id
  }

  async sync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.pendingChanges.length === 0) {
      return
    }

    this.syncInProgress = true
    this.notifyListeners()

    try {
      const unsyncedChanges = this.pendingChanges.filter(c => !c.synced)
      
      for (const change of unsyncedChanges) {
        try {
          await this.syncChange(change)
          change.synced = true
          this.failedSyncs = 0
        } catch (error) {
          console.error('Failed to sync change:', error)
          change.retryCount++
          
          if (change.retryCount >= this.MAX_RETRIES) {
            console.error(`Change ${change.id} failed after ${this.MAX_RETRIES} retries`)
            this.failedSyncs++
          }
        }
      }

      this.pendingChanges = this.pendingChanges.filter(
        c => !c.synced && c.retryCount < this.MAX_RETRIES
      )
      
      this.savePendingChanges()
      this.lastSyncTime = new Date().toISOString()
    } finally {
      this.syncInProgress = false
      this.notifyListeners()
    }
  }

  private async syncChange(change: OfflineChange): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }

  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      pendingChanges: this.pendingChanges.filter(c => !c.synced).length,
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
      failedSyncs: this.failedSyncs
    }
  }

  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback)
    callback(this.getStatus())

    return () => {
      this.listeners.delete(callback)
    }
  }

  private notifyListeners(): void {
    const status = this.getStatus()
    this.listeners.forEach(callback => callback(status))
  }

  clearSyncedChanges(): void {
    this.pendingChanges = this.pendingChanges.filter(c => !c.synced)
    this.savePendingChanges()
    this.notifyListeners()
  }

  getPendingChanges(): OfflineChange[] {
    return this.pendingChanges.filter(c => !c.synced)
  }

  retryFailedSyncs(): void {
    this.pendingChanges.forEach(change => {
      if (change.retryCount >= this.MAX_RETRIES) {
        change.retryCount = 0
      }
    })
    
    this.failedSyncs = 0
    this.savePendingChanges()
    
    if (this.isOnline) {
      this.sync()
    }
  }
}

export const offlineSyncService = new OfflineSyncService()
