import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Measurement, MeasurementAnnotation } from '@/lib/types'
import { 
  Camera, Mic, Type, Image as ImageIcon, Play, Pause, 
  Trash2, Plus, X, Download, Clock
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface MeasurementAnnotationsProps {
  measurement: Measurement
  onUpdate: (updatedMeasurement: Measurement) => void
}

export function MeasurementAnnotations({ measurement, onUpdate }: MeasurementAnnotationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [textNote, setTextNote] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const addTextAnnotation = () => {
    if (!textNote.trim()) {
      toast.error('Please enter a text note')
      return
    }

    const newAnnotation: MeasurementAnnotation = {
      id: `annotation-${Date.now()}`,
      measurementId: measurement.id,
      type: 'text',
      content: textNote.trim(),
      createdAt: new Date().toISOString()
    }

    const updatedMeasurement = {
      ...measurement,
      annotations: [...measurement.annotations, newAnnotation],
      updatedAt: new Date().toISOString()
    }

    onUpdate(updatedMeasurement)
    setTextNote('')
    soundManager.play('success')
    toast.success('Text note added')
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string

      const newAnnotation: MeasurementAnnotation = {
        id: `annotation-${Date.now()}`,
        measurementId: measurement.id,
        type: 'photo',
        content: dataUrl,
        thumbnailUrl: dataUrl,
        createdAt: new Date().toISOString()
      }

      const updatedMeasurement = {
        ...measurement,
        annotations: [...measurement.annotations, newAnnotation],
        updatedAt: new Date().toISOString()
      }

      onUpdate(updatedMeasurement)
      soundManager.play('success')
      toast.success('Photo added')
    }

    reader.readAsDataURL(file)
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string

          const newAnnotation: MeasurementAnnotation = {
            id: `annotation-${Date.now()}`,
            measurementId: measurement.id,
            type: 'voice',
            content: dataUrl,
            duration: recordingDuration,
            createdAt: new Date().toISOString()
          }

          const updatedMeasurement = {
            ...measurement,
            annotations: [...measurement.annotations, newAnnotation],
            updatedAt: new Date().toISOString()
          }

          onUpdate(updatedMeasurement)
          soundManager.play('success')
          toast.success('Voice note added')
        }

        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

      soundManager.play('glassTap')
      toast.info('Recording started')
    } catch (error) {
      toast.error('Unable to access microphone')
      console.error('Voice recording error:', error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }

      soundManager.play('glassTap')
    }
  }

  const playVoiceNote = (annotationId: string, audioDataUrl: string) => {
    if (isPlaying === annotationId) {
      setIsPlaying(null)
      return
    }

    const audio = new Audio(audioDataUrl)
    audio.onended = () => setIsPlaying(null)
    audio.play()
    setIsPlaying(annotationId)
    soundManager.play('glassTap')
  }

  const deleteAnnotation = (annotationId: string) => {
    const updatedMeasurement = {
      ...measurement,
      annotations: measurement.annotations.filter(a => a.id !== annotationId),
      updatedAt: new Date().toISOString()
    }

    onUpdate(updatedMeasurement)
    soundManager.play('glassTap')
    toast.success('Annotation deleted')
  }

  const downloadAnnotation = (annotation: MeasurementAnnotation) => {
    if (annotation.type === 'photo') {
      const link = document.createElement('a')
      link.href = annotation.content
      link.download = `photo-${annotation.id}.png`
      link.click()
    } else if (annotation.type === 'voice') {
      const link = document.createElement('a')
      link.href = annotation.content
      link.download = `voice-${annotation.id}.webm`
      link.click()
    }
    soundManager.play('success')
    toast.success('Downloaded')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const photoAnnotations = measurement.annotations.filter(a => a.type === 'photo')
  const voiceAnnotations = measurement.annotations.filter(a => a.type === 'voice')
  const textAnnotations = measurement.annotations.filter(a => a.type === 'text')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 relative"
          onClick={() => soundManager.play('glassTap')}
        >
          <Plus className="w-4 h-4" />
          Annotate
          {measurement.annotations.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {measurement.annotations.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            Measurement Annotations
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {measurement.label || 'Unlabeled measurement'} • {measurement.distance.toFixed(2)} ft
          </p>
        </DialogHeader>

        <Tabs defaultValue="add" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">
              <Plus className="w-4 h-4 mr-2" />
              Add Annotation
            </TabsTrigger>
            <TabsTrigger value="view">
              <ImageIcon className="w-4 h-4 mr-2" />
              View All ({measurement.annotations.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="add" className="space-y-4 m-0">
              <Card className="p-6 bg-muted/30">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                  <h3 className="font-semibold text-foreground">Add Photo</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Capture or upload photos to document this measurement
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo or Upload
                </Button>
              </Card>

              <Card className="p-6 bg-muted/30">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                  <h3 className="font-semibold text-foreground">Add Voice Note</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Record voice notes for detailed observations
                </p>
                
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4 bg-red-50 dark:bg-red-950/30 rounded-lg p-6">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-4 h-4 rounded-full bg-red-500"
                      />
                      <div className="text-2xl font-mono font-semibold text-foreground">
                        {formatDuration(recordingDuration)}
                      </div>
                    </div>
                    <Button
                      onClick={stopVoiceRecording}
                      variant="destructive"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={startVoiceRecording}
                    variant="outline"
                    className="w-full"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                )}
              </Card>

              <Card className="p-6 bg-muted/30">
                <div className="flex items-center gap-2 mb-4">
                  <Type className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                  <h3 className="font-semibold text-foreground">Add Text Note</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Write notes about this measurement
                </p>
                <Textarea
                  placeholder="e.g., Wall requires reinforcement, existing damage noted..."
                  value={textNote}
                  onChange={(e) => setTextNote(e.target.value)}
                  rows={4}
                  className="mb-4"
                />
                <Button
                  onClick={addTextAnnotation}
                  disabled={!textNote.trim()}
                  className="w-full bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Text Note
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="view" className="space-y-4 m-0">
              {measurement.annotations.length === 0 ? (
                <Card className="p-12 bg-muted/30">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No annotations yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Add photos, voice notes, or text to document this measurement
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  {photoAnnotations.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                        <h3 className="font-semibold text-foreground">Photos ({photoAnnotations.length})</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {photoAnnotations.map(annotation => (
                          <Card key={annotation.id} className="p-3 bg-muted/30 group">
                            <div className="relative aspect-video mb-3 rounded-lg overflow-hidden bg-muted">
                              <img 
                                src={annotation.content} 
                                alt="Measurement photo"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => downloadAnnotation(annotation)}
                                  className="text-white hover:text-white hover:bg-white/20"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteAnnotation(annotation.id)}
                                  className="text-white hover:text-white hover:bg-red-500/50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(annotation.createdAt).toLocaleString()}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {voiceAnnotations.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <div className="flex items-center gap-2">
                        <Mic className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                        <h3 className="font-semibold text-foreground">Voice Notes ({voiceAnnotations.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {voiceAnnotations.map(annotation => (
                          <Card key={annotation.id} className="p-4 bg-muted/30 flex items-center gap-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => playVoiceNote(annotation.id, annotation.content)}
                              className="flex-shrink-0"
                            >
                              {isPlaying === annotation.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground">
                                Voice Note
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{formatDuration(annotation.duration || 0)}</span>
                                <span>•</span>
                                <span>{new Date(annotation.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadAnnotation(annotation)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteAnnotation(annotation.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {textAnnotations.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <div className="flex items-center gap-2">
                        <Type className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                        <h3 className="font-semibold text-foreground">Text Notes ({textAnnotations.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {textAnnotations.map(annotation => (
                          <Card key={annotation.id} className="p-4 bg-muted/30">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <p className="text-sm text-foreground flex-1">{annotation.content}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteAnnotation(annotation.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(annotation.createdAt).toLocaleString()}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
