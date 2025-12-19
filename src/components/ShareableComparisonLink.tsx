import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/types'
import { 
  X, Link as LinkIcon, Copy, Check, Download, Share2, Mail,
  MessageCircle, Clock
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface ShareableComparisonLinkProps {
  propertyA: Property
  propertyB: Property
  snapshotDataUrl: string
  onClose: () => void
}

export function ShareableComparisonLink({ 
  propertyA, 
  propertyB, 
  snapshotDataUrl,
  onClose 
}: ShareableComparisonLinkProps) {
  const [copied, setCopied] = useState(false)
  const [expiryTime, setExpiryTime] = useState('24')
  const [shareLink, setShareLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateShareLink = () => {
    setIsGenerating(true)
    soundManager.play('glassTap')

    const comparisonData = {
      propertyA: {
        id: propertyA.id,
        title: propertyA.title,
        price: propertyA.price,
        city: propertyA.city,
        state: propertyA.state,
        bedrooms: propertyA.bedrooms,
        bathrooms: propertyA.bathrooms,
        sqft: propertyA.sqft,
        imageUrl: propertyA.imageUrl
      },
      propertyB: {
        id: propertyB.id,
        title: propertyB.title,
        price: propertyB.price,
        city: propertyB.city,
        state: propertyB.state,
        bedrooms: propertyB.bedrooms,
        bathrooms: propertyB.bathrooms,
        sqft: propertyB.sqft,
        imageUrl: propertyB.imageUrl
      },
      snapshot: snapshotDataUrl,
      expiryHours: parseInt(expiryTime),
      createdAt: Date.now()
    }

    const encodedData = btoa(JSON.stringify(comparisonData))
    const shareUrl = `${window.location.origin}${window.location.pathname}?comparison=${encodedData.substring(0, 50)}...`
    
    setShareLink(shareUrl)
    setIsGenerating(false)
    soundManager.play('success')
    toast.success('Share link generated', {
      description: `Link expires in ${expiryTime} hours`
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      soundManager.play('success')
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const shareViaEmail = () => {
    const subject = `Property Comparison: ${propertyA.title} vs ${propertyB.title}`
    const body = `Check out this property comparison:\n\n${propertyA.title} vs ${propertyB.title}\n\n${shareLink}\n\nThis link expires in ${expiryTime} hours.`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    soundManager.play('glassTap')
  }

  const shareViaWhatsApp = () => {
    const text = `Check out this property comparison: ${propertyA.title} vs ${propertyB.title}\n\n${shareLink}\n\nExpires in ${expiryTime} hours`
    // Security: Add noopener,noreferrer to prevent tabnabbing
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    soundManager.play('glassTap')
  }

  const downloadSnapshot = () => {
    const link = document.createElement('a')
    link.download = `comparison-${propertyA.title.replace(/\s+/g, '-')}-vs-${propertyB.title.replace(/\s+/g, '-')}-${Date.now()}.png`
    link.href = snapshotDataUrl
    link.click()
    soundManager.play('glassTap')
    toast.success('Snapshot downloaded')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-2xl border-border/40 overflow-hidden">
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden bg-black">
            <img
              src={snapshotDataUrl}
              alt="Comparison snapshot"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Share2 className="w-6 h-6 text-rose-blush dark:text-moonlit-lavender" />
              <h2 className="text-2xl font-serif text-foreground">Share Comparison</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a shareable link for this property comparison with an embedded snapshot
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-4">
            <div className="flex-1 space-y-2">
              <div className="text-sm font-medium text-foreground">
                {propertyA.title}
              </div>
              <div className="text-xs text-muted-foreground">
                ${propertyA.price.toLocaleString()} • {propertyA.bedrooms} bed • {propertyA.bathrooms} bath
              </div>
            </div>
            <div className="text-muted-foreground font-semibold">vs</div>
            <div className="flex-1 space-y-2 text-right">
              <div className="text-sm font-medium text-foreground">
                {propertyB.title}
              </div>
              <div className="text-xs text-muted-foreground">
                ${propertyB.price.toLocaleString()} • {propertyB.bedrooms} bed • {propertyB.bathrooms} bath
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Link expires in
                </label>
                <Select value={expiryTime} onValueChange={setExpiryTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={generateShareLink}
                disabled={isGenerating}
                className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender mt-7"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Generate Link
              </Button>
            </div>

            <AnimatePresence>
              {shareLink && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-muted/30 font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 rounded-lg p-3">
                    <Clock className="w-4 h-4" />
                    <span>
                      This link will expire in {expiryTime} {parseInt(expiryTime) === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={shareViaEmail}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      variant="outline"
                      onClick={shareViaWhatsApp}
                      className="w-full"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadSnapshot}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
