import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Property, MeasurementCollection, ContractorProfile, Measurement } from '@/lib/types'
import { 
  Users, Plus, Share2, Trash2, Edit2, Check, X, 
  FolderOpen, FileText, Mail, Copy, ExternalLink,
  Building, Ruler, Tag, Clock, UserPlus
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { soundManager } from '@/lib/sound-manager'
import { toast } from 'sonner'

interface ContractorWorkspaceProps {
  properties: Property[]
  measurements: Measurement[]
}

export function ContractorWorkspace({ properties, measurements }: ContractorWorkspaceProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [collections, setCollections] = useKV<MeasurementCollection[]>('measurement-collections', [])
  const [contractors, setContractors] = useKV<ContractorProfile[]>('contractors', [])
  const [activeTab, setActiveTab] = useState<'collections' | 'contractors'>('collections')
  
  const [isCreating, setIsCreating] = useState(false)
  const [collectionName, setCollectionName] = useState('')
  const [collectionDescription, setCollectionDescription] = useState('')
  const [collectionTags, setCollectionTags] = useState('')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([])
  
  const [isInviting, setIsInviting] = useState(false)
  const [contractorName, setContractorName] = useState('')
  const [contractorEmail, setContractorEmail] = useState('')
  const [contractorCompany, setContractorCompany] = useState('')
  const [contractorPhone, setContractorPhone] = useState('')
  const [contractorSpecialty, setContractorSpecialty] = useState('')
  const [contractorAccessLevel, setContractorAccessLevel] = useState<'view' | 'comment' | 'edit'>('view')
  
  const [editingCollection, setEditingCollection] = useState<string | null>(null)
  const [sharingCollection, setSharingCollection] = useState<MeasurementCollection | null>(null)

  const createCollection = () => {
    if (!collectionName.trim()) {
      toast.error('Please enter a collection name')
      return
    }

    if (selectedMeasurements.length === 0) {
      toast.error('Please select at least one measurement')
      return
    }

    const newCollection: MeasurementCollection = {
      id: `collection-${Date.now()}`,
      name: collectionName.trim(),
      description: collectionDescription.trim() || undefined,
      propertyIds: selectedProperties,
      measurements: measurements.filter(m => selectedMeasurements.includes(m.id)),
      sharedWith: [],
      owner: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: collectionTags.split(',').map(t => t.trim()).filter(Boolean)
    }

    setCollections(prev => [...(prev || []), newCollection])
    
    setCollectionName('')
    setCollectionDescription('')
    setCollectionTags('')
    setSelectedProperties([])
    setSelectedMeasurements([])
    setIsCreating(false)
    
    soundManager.play('success')
    toast.success('Collection created', {
      description: `${newCollection.measurements.length} measurements added`
    })
  }

  const deleteCollection = (collectionId: string) => {
    setCollections(prev => (prev || []).filter(c => c.id !== collectionId))
    soundManager.play('glassTap')
    toast.success('Collection deleted')
  }

  const shareCollection = (collection: MeasurementCollection, contractorIds: string[]) => {
    const updatedCollection = {
      ...collection,
      sharedWith: [...new Set([...collection.sharedWith, ...contractorIds])],
      updatedAt: new Date().toISOString()
    }

    setCollections(prev => 
      (prev || []).map(c => c.id === collection.id ? updatedCollection : c)
    )

    soundManager.play('success')
    toast.success('Collection shared', {
      description: `Shared with ${contractorIds.length} contractor(s)`
    })
    setSharingCollection(null)
  }

  const inviteContractor = () => {
    if (!contractorName.trim() || !contractorEmail.trim()) {
      toast.error('Please enter name and email')
      return
    }

    const newContractor: ContractorProfile = {
      id: `contractor-${Date.now()}`,
      name: contractorName.trim(),
      email: contractorEmail.trim(),
      company: contractorCompany.trim() || undefined,
      phone: contractorPhone.trim() || undefined,
      specialty: contractorSpecialty.trim() || undefined,
      inviteCode: `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      accessLevel: contractorAccessLevel
    }

    setContractors(prev => [...(prev || []), newContractor])
    
    const inviteLink = `${window.location.origin}?contractor-invite=${newContractor.inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    
    setContractorName('')
    setContractorEmail('')
    setContractorCompany('')
    setContractorPhone('')
    setContractorSpecialty('')
    setIsInviting(false)
    
    soundManager.play('success')
    toast.success('Contractor invited', {
      description: 'Invite link copied to clipboard'
    })
  }

  const deleteContractor = (contractorId: string) => {
    setContractors(prev => (prev || []).filter(c => c.id !== contractorId))
    
    setCollections(prev => 
      (prev || []).map(collection => ({
        ...collection,
        sharedWith: collection.sharedWith.filter(id => id !== contractorId)
      }))
    )
    
    soundManager.play('glassTap')
    toast.success('Contractor removed')
  }

  const copyCollectionLink = (collection: MeasurementCollection) => {
    const data = btoa(JSON.stringify({
      id: collection.id,
      name: collection.name,
      measurements: collection.measurements
    }))
    const link = `${window.location.origin}?collection=${data}`
    
    navigator.clipboard.writeText(link)
    soundManager.play('success')
    toast.success('Collection link copied', {
      description: 'Share this link with contractors'
    })
  }

  const exportCollection = (collection: MeasurementCollection) => {
    const data = {
      collection: {
        name: collection.name,
        description: collection.description,
        tags: collection.tags,
        createdAt: collection.createdAt
      },
      properties: properties.filter(p => collection.propertyIds.includes(p.id)),
      measurements: collection.measurements.map(m => ({
        label: m.label,
        distance: m.distance,
        annotations: m.annotations,
        createdAt: m.createdAt
      }))
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${collection.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    soundManager.play('success')
    toast.success('Collection exported')
  }

  const getPropertyById = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)
  }

  const getContractorById = (contractorId: string) => {
    return (contractors || []).find(c => c.id === contractorId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="gap-2 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
          onClick={() => soundManager.play('glassTap')}
        >
          <Users className="w-5 h-5" />
          Contractor Workspace
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            Contractor Workspace
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Create measurement collections and share with contractors
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collections">
              <FolderOpen className="w-4 h-4 mr-2" />
              Collections ({(collections || []).length})
            </TabsTrigger>
            <TabsTrigger value="contractors">
              <Users className="w-4 h-4 mr-2" />
              Contractors ({(contractors || []).length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="collections" className="space-y-4 m-0">
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </div>

              <AnimatePresence>
                {isCreating && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="p-6 bg-muted/30 border-2 border-rose-blush dark:border-moonlit-lavender">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Create New Collection</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsCreating(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Collection Name *
                          </label>
                          <Input
                            placeholder="e.g., Kitchen Renovation Measurements"
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Description
                          </label>
                          <Textarea
                            placeholder="Brief description of this collection..."
                            value={collectionDescription}
                            onChange={(e) => setCollectionDescription(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Tags (comma-separated)
                          </label>
                          <Input
                            placeholder="e.g., kitchen, plumbing, electrical"
                            value={collectionTags}
                            onChange={(e) => setCollectionTags(e.target.value)}
                          />
                        </div>

                        <Separator />

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Select Properties
                          </label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {properties.map(property => (
                              <label
                                key={property.id}
                                className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedProperties.includes(property.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedProperties(prev => [...prev, property.id])
                                    } else {
                                      setSelectedProperties(prev => prev.filter(id => id !== property.id))
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm text-foreground">{property.title}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Select Measurements *
                          </label>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {measurements
                              .filter(m => selectedProperties.length === 0 || selectedProperties.includes(m.propertyId))
                              .map(measurement => (
                                <label
                                  key={measurement.id}
                                  className="flex items-center justify-between gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedMeasurements.includes(measurement.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedMeasurements(prev => [...prev, measurement.id])
                                        } else {
                                          setSelectedMeasurements(prev => prev.filter(id => id !== measurement.id))
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <span className="text-sm text-foreground">
                                      {measurement.label || 'Unlabeled'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {measurement.distance.toFixed(2)} ft
                                  </span>
                                </label>
                              ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={createCollection}
                            disabled={!collectionName.trim() || selectedMeasurements.length === 0}
                            className="flex-1 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Create Collection
                          </Button>
                          <Button
                            onClick={() => setIsCreating(false)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {(collections || []).length === 0 && !isCreating ? (
                <Card className="p-12 bg-muted/30">
                  <div className="text-center">
                    <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No collections yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create measurement collections to organize and share with contractors
                    </p>
                    <Button
                      onClick={() => setIsCreating(true)}
                      className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Collection
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(collections || []).map(collection => (
                    <Card key={collection.id} className="p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-serif text-xl text-foreground mb-1">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {collection.description}
                            </p>
                          )}
                          {collection.tags && collection.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {collection.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {collection.propertyIds.length} {collection.propertyIds.length === 1 ? 'Property' : 'Properties'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Ruler className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {collection.measurements.length} Measurements
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            Shared with {collection.sharedWith.length} {collection.sharedWith.length === 1 ? 'contractor' : 'contractors'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(collection.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSharingCollection(collection)}
                          className="flex-1"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCollectionLink(collection)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportCollection(collection)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCollection(collection.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contractors" className="space-y-4 m-0">
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsInviting(true)}
                  className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Contractor
                </Button>
              </div>

              <AnimatePresence>
                {isInviting && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="p-6 bg-muted/30 border-2 border-rose-blush dark:border-moonlit-lavender">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Invite Contractor</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsInviting(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Name *
                          </label>
                          <Input
                            placeholder="John Smith"
                            value={contractorName}
                            onChange={(e) => setContractorName(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Email *
                          </label>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            value={contractorEmail}
                            onChange={(e) => setContractorEmail(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Company
                          </label>
                          <Input
                            placeholder="ABC Construction"
                            value={contractorCompany}
                            onChange={(e) => setContractorCompany(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Phone
                          </label>
                          <Input
                            placeholder="(555) 123-4567"
                            value={contractorPhone}
                            onChange={(e) => setContractorPhone(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Specialty
                          </label>
                          <Input
                            placeholder="e.g., Plumbing, Electrical"
                            value={contractorSpecialty}
                            onChange={(e) => setContractorSpecialty(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Access Level
                          </label>
                          <Select value={contractorAccessLevel} onValueChange={(v) => setContractorAccessLevel(v as any)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">View Only</SelectItem>
                              <SelectItem value="comment">View & Comment</SelectItem>
                              <SelectItem value="edit">Full Access</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={inviteContractor}
                          disabled={!contractorName.trim() || !contractorEmail.trim()}
                          className="flex-1 bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Send Invite
                        </Button>
                        <Button
                          onClick={() => setIsInviting(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {(contractors || []).length === 0 && !isInviting ? (
                <Card className="p-12 bg-muted/30">
                  <div className="text-center">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No contractors yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Invite contractors to access shared measurement collections
                    </p>
                    <Button
                      onClick={() => setIsInviting(true)}
                      className="bg-gradient-to-r from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite First Contractor
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {(contractors || []).map(contractor => (
                    <Card key={contractor.id} className="p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={contractor.avatarUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender text-white">
                            {contractor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{contractor.name}</h4>
                              {contractor.company && (
                                <p className="text-sm text-muted-foreground">{contractor.company}</p>
                              )}
                              {contractor.specialty && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {contractor.specialty}
                                </Badge>
                              )}
                            </div>
                            <Badge 
                              variant={
                                contractor.accessLevel === 'edit' ? 'default' : 
                                contractor.accessLevel === 'comment' ? 'secondary' : 
                                'outline'
                              }
                            >
                              {contractor.accessLevel}
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              {contractor.email}
                            </div>
                            {contractor.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="w-4 h-4 flex items-center justify-center">📞</span>
                                {contractor.phone}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(contractor.inviteCode)
                                toast.success('Invite code copied')
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Code: {contractor.inviteCode}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteContractor(contractor.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {sharingCollection && (
          <Dialog open={!!sharingCollection} onOpenChange={() => setSharingCollection(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Share Collection</DialogTitle>
                <p className="text-sm text-muted-foreground">{sharingCollection.name}</p>
              </DialogHeader>

              <div className="space-y-3">
                {(contractors || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No contractors available. Invite contractors first.
                  </p>
                ) : (
                  <>
                    {(contractors || []).map(contractor => (
                      <label
                        key={contractor.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={sharingCollection.sharedWith.includes(contractor.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              shareCollection(sharingCollection, [contractor.id])
                            }
                          }}
                          className="rounded"
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-rose-blush to-rose-gold dark:from-moonlit-violet dark:to-moonlit-lavender text-white text-xs">
                            {contractor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{contractor.name}</div>
                          <div className="text-xs text-muted-foreground">{contractor.email}</div>
                        </div>
                      </label>
                    ))}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
