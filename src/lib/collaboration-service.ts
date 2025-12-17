import { Measurement, MeasurementAnnotation, ContractorProfile } from './types'

export interface CollaborationSession {
  id: string
  collectionId: string
  activeContractors: ContractorProfile[]
  createdAt: string
  lastActivity: string
}

export interface CollaborationEvent {
  id: string
  sessionId: string
  type: 'contractor_joined' | 'contractor_left' | 'measurement_added' | 'measurement_updated' | 'comment_added' | 'cursor_moved'
  contractorId: string
  data: any
  timestamp: string
}

export interface ContractorCursor {
  contractorId: string
  x: number
  y: number
  color: string
  name: string
}

export interface LiveComment {
  id: string
  measurementId: string
  contractorId: string
  contractorName: string
  content: string
  timestamp: string
  resolved: boolean
}

class CollaborationService {
  private sessions: Map<string, CollaborationSession> = new Map()
  private events: CollaborationEvent[] = []
  private cursors: Map<string, ContractorCursor> = new Map()
  private comments: Map<string, LiveComment[]> = new Map()
  private listeners: Map<string, Set<(event: CollaborationEvent) => void>> = new Map()

  private getContractorColor(contractorId: string): string {
    const colors = [
      'oklch(0.65 0.15 340)',
      'oklch(0.70 0.15 200)', 
      'oklch(0.68 0.15 120)',
      'oklch(0.72 0.15 280)',
      'oklch(0.66 0.15 40)',
      'oklch(0.69 0.15 160)'
    ]
    const hash = contractorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  createSession(collectionId: string): CollaborationSession {
    const session: CollaborationSession = {
      id: `session-${Date.now()}`,
      collectionId,
      activeContractors: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }
    this.sessions.set(session.id, session)
    return session
  }

  joinSession(sessionId: string, contractor: ContractorProfile): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    if (!session.activeContractors.find(c => c.id === contractor.id)) {
      session.activeContractors.push(contractor)
      session.lastActivity = new Date().toISOString()

      const cursor: ContractorCursor = {
        contractorId: contractor.id,
        x: 0,
        y: 0,
        color: this.getContractorColor(contractor.id),
        name: contractor.name
      }
      this.cursors.set(contractor.id, cursor)

      this.emitEvent(sessionId, {
        id: `event-${Date.now()}`,
        sessionId,
        type: 'contractor_joined',
        contractorId: contractor.id,
        data: { contractor, cursor },
        timestamp: new Date().toISOString()
      })
    }
  }

  leaveSession(sessionId: string, contractorId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.activeContractors = session.activeContractors.filter(c => c.id !== contractorId)
    session.lastActivity = new Date().toISOString()
    this.cursors.delete(contractorId)

    this.emitEvent(sessionId, {
      id: `event-${Date.now()}`,
      sessionId,
      type: 'contractor_left',
      contractorId,
      data: {},
      timestamp: new Date().toISOString()
    })

    if (session.activeContractors.length === 0) {
      this.sessions.delete(sessionId)
      this.listeners.delete(sessionId)
    }
  }

  updateCursor(sessionId: string, contractorId: string, x: number, y: number): void {
    const cursor = this.cursors.get(contractorId)
    if (!cursor) return

    cursor.x = x
    cursor.y = y

    this.emitEvent(sessionId, {
      id: `event-${Date.now()}`,
      sessionId,
      type: 'cursor_moved',
      contractorId,
      data: { x, y },
      timestamp: new Date().toISOString()
    })
  }

  addMeasurement(sessionId: string, contractorId: string, measurement: Measurement): void {
    this.emitEvent(sessionId, {
      id: `event-${Date.now()}`,
      sessionId,
      type: 'measurement_added',
      contractorId,
      data: { measurement },
      timestamp: new Date().toISOString()
    })
  }

  updateMeasurement(sessionId: string, contractorId: string, measurement: Measurement): void {
    this.emitEvent(sessionId, {
      id: `event-${Date.now()}`,
      sessionId,
      type: 'measurement_updated',
      contractorId,
      data: { measurement },
      timestamp: new Date().toISOString()
    })
  }

  addComment(sessionId: string, measurementId: string, contractorId: string, contractorName: string, content: string): LiveComment {
    const comment: LiveComment = {
      id: `comment-${Date.now()}`,
      measurementId,
      contractorId,
      contractorName,
      content,
      timestamp: new Date().toISOString(),
      resolved: false
    }

    const measurementComments = this.comments.get(measurementId) || []
    measurementComments.push(comment)
    this.comments.set(measurementId, measurementComments)

    this.emitEvent(sessionId, {
      id: `event-${Date.now()}`,
      sessionId,
      type: 'comment_added',
      contractorId,
      data: { comment },
      timestamp: new Date().toISOString()
    })

    return comment
  }

  getComments(measurementId: string): LiveComment[] {
    return this.comments.get(measurementId) || []
  }

  resolveComment(sessionId: string, commentId: string, measurementId: string): void {
    const comments = this.comments.get(measurementId)
    if (!comments) return

    const comment = comments.find(c => c.id === commentId)
    if (comment) {
      comment.resolved = true
    }
  }

  getCursors(sessionId: string): ContractorCursor[] {
    const session = this.sessions.get(sessionId)
    if (!session) return []

    return Array.from(this.cursors.values()).filter(cursor =>
      session.activeContractors.some(c => c.id === cursor.contractorId)
    )
  }

  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId)
  }

  subscribe(sessionId: string, callback: (event: CollaborationEvent) => void): () => void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set())
    }
    
    const listeners = this.listeners.get(sessionId)!
    listeners.add(callback)

    return () => {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.listeners.delete(sessionId)
      }
    }
  }

  private emitEvent(sessionId: string, event: CollaborationEvent): void {
    this.events.push(event)
    
    const listeners = this.listeners.get(sessionId)
    if (listeners) {
      listeners.forEach(callback => callback(event))
    }
  }
}

export const collaborationService = new CollaborationService()
