import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, MessageCircle, Send, Check, X, Eye, Circle
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { collaborationService, CollaborationEvent, ContractorCursor, LiveComment } from '@/lib/collaboration-service'
import { ContractorProfile, Measurement } from '@/lib/types'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface CollaborationViewProps {
  sessionId: string
  currentContractor: ContractorProfile
  measurements: Measurement[]
  onMeasurementUpdate?: (measurement: Measurement) => void
}

export function CollaborationView({ 
  sessionId, 
  currentContractor, 
  measurements,
  onMeasurementUpdate 
}: CollaborationViewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cursors, setCursors] = useState<ContractorCursor[]>([])
  const [activeContractors, setActiveContractors] = useState<ContractorProfile[]>([])
  const [comments, setComments] = useState<Map<string, LiveComment[]>>(new Map())
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState('')
  const [events, setEvents] = useState<CollaborationEvent[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    collaborationService.joinSession(sessionId, currentContractor)

    const unsubscribe = collaborationService.subscribe(sessionId, handleCollaborationEvent)
    unsubscribeRef.current = unsubscribe

    const session = collaborationService.getSession(sessionId)
    if (session) {
      setActiveContractors(session.activeContractors)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      collaborationService.leaveSession(sessionId, currentContractor.id)
    }
  }, [sessionId, currentContractor])

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCursors = collaborationService.getCursors(sessionId)
      setCursors(updatedCursors.filter(c => c.contractorId !== currentContractor.id))
    }, 100)

    return () => clearInterval(interval)
  }, [sessionId, currentContractor])

  const handleCollaborationEvent = (event: CollaborationEvent) => {
    setEvents(prev => [...prev, event].slice(-50))

    switch (event.type) {
      case 'contractor_joined':
        const session = collaborationService.getSession(sessionId)
        if (session) {
          setActiveContractors(session.activeContractors)
        }
        soundManager.play('glassTap')
        toast.success(`${event.data.contractor.name} joined`, {
          description: 'Now viewing measurements'
        })
        break

      case 'contractor_left':
        const updatedSession = collaborationService.getSession(sessionId)
        if (updatedSession) {
          setActiveContractors(updatedSession.activeContractors)
        }
        break

      case 'measurement_added':
        if (onMeasurementUpdate) {
          onMeasurementUpdate(event.data.measurement)
        }
        soundManager.play('success')
        break

      case 'measurement_updated':
        if (onMeasurementUpdate) {
          onMeasurementUpdate(event.data.measurement)
        }
        break

      case 'comment_added':
        const comment = event.data.comment as LiveComment
        setComments(prev => {
          const newComments = new Map(prev)
          const measurementComments = newComments.get(comment.measurementId) || []
          newComments.set(comment.measurementId, [...measurementComments, comment])
          return newComments
        })
        
        if (comment.contractorId !== currentContractor.id) {
          soundManager.play('glassTap')
        }
        break

      case 'cursor_moved':
        break
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height

    collaborationService.updateCursor(sessionId, currentContractor.id, x, y)
  }

  const sendComment = () => {
    if (!commentInput.trim() || !selectedMeasurement) return

    const comment = collaborationService.addComment(
      sessionId,
      selectedMeasurement,
      currentContractor.id,
      currentContractor.name,
      commentInput.trim()
    )

    setCommentInput('')
    soundManager.play('success')
    toast.success('Comment added')
  }

  const resolveComment = (commentId: string, measurementId: string) => {
    collaborationService.resolveComment(sessionId, commentId, measurementId)
    
    setComments(prev => {
      const newComments = new Map(prev)
      const measurementComments = newComments.get(measurementId) || []
      const updated = measurementComments.map(c => 
        c.id === commentId ? { ...c, resolved: true } : c
      )
      newComments.set(measurementId, updated)
      return newComments
    })

    soundManager.play('success')
  }

  const getMeasurementComments = (measurementId: string): LiveComment[] => {
    return comments.get(measurementId) || []
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender relative"
          onClick={() => soundManager.play('glassTap')}
        >
          <Users className="w-4 h-4" />
          Live Collaboration
          {activeContractors.length > 1 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {activeContractors.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Live Collaboration
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {activeContractors.length} contractor{activeContractors.length !== 1 ? 's' : ''} viewing
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Active Contractors</h3>
                <Badge variant="secondary" className="text-xs">
                  {activeContractors.length} online
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeContractors.map(contractor => {
                  const cursor = cursors.find(c => c.contractorId === contractor.id)
                  const isCurrentUser = contractor.id === currentContractor.id
                  
                  return (
                    <motion.div
                      key={contractor.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 bg-background/50 rounded-full px-3 py-1.5 border border-border"
                    >
                      <div className="relative">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback 
                            className="text-xs text-white"
                            style={{ 
                              backgroundColor: cursor?.color || 'oklch(0.65 0.15 340)' 
                            }}
                          >
                            {contractor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Circle 
                          className="w-2 h-2 absolute -bottom-0.5 -right-0.5 fill-green-500 text-green-500" 
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {isCurrentUser ? 'You' : contractor.name}
                      </span>
                      {contractor.accessLevel === 'edit' && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Edit
                        </Badge>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-4 bg-muted/30 flex-1">
              <h3 className="font-semibold text-foreground mb-3">Measurements</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {measurements.map(measurement => {
                    const measurementComments = getMeasurementComments(measurement.id)
                    const unresolvedComments = measurementComments.filter(c => !c.resolved)
                    
                    return (
                      <Card
                        key={measurement.id}
                        className={`p-3 cursor-pointer transition-all ${
                          selectedMeasurement === measurement.id
                            ? 'bg-rose-blush/10 dark:bg-moonlit-lavender/10 border-rose-blush dark:border-moonlit-lavender'
                            : 'bg-muted/20 hover:bg-muted/40'
                        }`}
                        onClick={() => setSelectedMeasurement(measurement.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">
                                {measurement.label || 'Unlabeled'}
                              </span>
                              {unresolvedComments.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  {unresolvedComments.length}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {measurement.distance.toFixed(2)} ft
                            </p>
                          </div>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Comments</h3>
                {selectedMeasurement && (
                  <Badge variant="secondary" className="text-xs">
                    {getMeasurementComments(selectedMeasurement).length}
                  </Badge>
                )}
              </div>

              {selectedMeasurement ? (
                <>
                  <ScrollArea className="h-[300px] mb-3">
                    <div className="space-y-3">
                      <AnimatePresence>
                        {getMeasurementComments(selectedMeasurement).map(comment => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-3 rounded-lg ${
                              comment.resolved
                                ? 'bg-muted/30 opacity-60'
                                : 'bg-background/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender text-white">
                                    {comment.contractorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-foreground">
                                  {comment.contractorName}
                                </span>
                              </div>
                              {!comment.resolved && currentContractor.accessLevel !== 'view' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resolveComment(comment.id, selectedMeasurement)}
                                  className="h-6 px-2"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-foreground mb-1">{comment.content}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                              {comment.resolved && ' • Resolved'}
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>

                  {currentContractor.accessLevel !== 'view' && (
                    <div className="flex gap-2">
                      <Input
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Add a comment..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendComment()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendComment}
                        disabled={!commentInput.trim()}
                        size="sm"
                        className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a measurement to view comments
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Recent Activity</h3>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {events.slice().reverse().slice(0, 10).map(event => (
                    <div key={event.id} className="text-xs">
                      <span className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-foreground ml-2">
                        {event.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  )
}
