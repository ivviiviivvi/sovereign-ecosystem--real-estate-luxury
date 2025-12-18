import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Team, TeamMember } from '@/lib/team-performance-service'
import { 
  PencilSimple, 
  Palette, 
  Users, 
  Crown, 
  UserCircle, 
  FloppyDisk, 
  X, 
  Trash,
  Plus,
  Check
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { soundManager } from '@/lib/sound-manager'

const TEAM_COLORS = [
  { name: 'Rose Blush', value: '#E088AA', light: 'rgba(224, 136, 170, 0.15)' },
  { name: 'Lavender Mist', value: '#BA94DA', light: 'rgba(186, 148, 218, 0.15)' },
  { name: 'Champagne', value: '#F7E7CE', light: 'rgba(247, 231, 206, 0.15)' },
  { name: 'Rose Gold', value: '#DBAC98', light: 'rgba(219, 172, 152, 0.15)' },
  { name: 'Sky Blue', value: '#A7C7E7', light: 'rgba(167, 199, 231, 0.15)' },
  { name: 'Mint Green', value: '#98D8C8', light: 'rgba(152, 216, 200, 0.15)' },
  { name: 'Coral', value: '#FF8B8B', light: 'rgba(255, 139, 139, 0.15)' },
  { name: 'Violet', value: '#9B7EDE', light: 'rgba(155, 126, 222, 0.15)' }
]

interface TeamEditorProps {
  team: Team
  onClose?: () => void
  trigger?: React.ReactNode
}

export function TeamEditor({ team, onClose, trigger }: TeamEditorProps) {
  const [teams, setTeams] = useKV<Team[]>('teams', [])
  const [isOpen, setIsOpen] = useState(false)
  const [editedName, setEditedName] = useState(team.name)
  const [editedDescription, setEditedDescription] = useState(team.description || '')
  const [editedColor, setEditedColor] = useState(team.color)
  const [editedMembers, setEditedMembers] = useState<TeamMember[]>([...team.members])
  const [hasChanges, setHasChanges] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'lead' | 'member'>('member')

  const handleOpen = (open: boolean) => {
    if (open) {
      setEditedName(team.name)
      setEditedDescription(team.description || '')
      setEditedColor(team.color)
      setEditedMembers([...team.members])
      setHasChanges(false)
    }
    setIsOpen(open)
  }

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true)
  }

  const updateMemberRole = (memberId: string, newRole: 'lead' | 'member') => {
    setEditedMembers(prev => 
      prev.map(m => m.id === memberId ? { ...m, role: newRole } : m)
    )
    markChanged()
  }

  const updateMemberName = (memberId: string, name: string) => {
    setEditedMembers(prev => 
      prev.map(m => m.id === memberId ? { ...m, name } : m)
    )
    markChanged()
  }

  const updateMemberEmail = (memberId: string, email: string) => {
    setEditedMembers(prev => 
      prev.map(m => m.id === memberId ? { ...m, email } : m)
    )
    markChanged()
  }

  const removeMember = (memberId: string) => {
    setEditedMembers(prev => prev.filter(m => m.id !== memberId))
    markChanged()
  }

  const addNewMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      toast.error('Please enter member name and email')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMemberEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      joinedAt: new Date().toISOString()
    }

    setEditedMembers(prev => [...prev, newMember])
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberRole('member')
    setIsAddingMember(false)
    markChanged()
    soundManager.play('glassTap')
  }

  const saveChanges = () => {
    if (!editedName.trim()) {
      toast.error('Team name cannot be empty')
      return
    }

    const updatedTeam: Team = {
      ...team,
      name: editedName,
      description: editedDescription,
      color: editedColor,
      members: editedMembers
    }

    setTeams(prev => 
      (prev || []).map(t => t.id === team.id ? updatedTeam : t)
    )

    soundManager.play('glassTap')
    toast.success('Team updated successfully', {
      description: `${editedName} has been saved with your changes`
    })
    
    setHasChanges(false)
    setIsOpen(false)
    onClose?.()
  }

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50"
    >
      <PencilSimple className="w-4 h-4" />
      Edit Team
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: editedColor }}
            >
              <PencilSimple className="w-5 h-5 text-white" />
            </div>
            Edit Team
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name-edit" className="text-base font-semibold">Team Name</Label>
                <Input
                  id="team-name-edit"
                  value={editedName}
                  onChange={(e) => { setEditedName(e.target.value); markChanged() }}
                  placeholder="Enter team name"
                  className="text-lg h-12 border-2 focus:border-rose-blush dark:focus:border-moonlit-lavender"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-desc-edit" className="text-base font-semibold">Description</Label>
                <Input
                  id="team-desc-edit"
                  value={editedDescription}
                  onChange={(e) => { setEditedDescription(e.target.value); markChanged() }}
                  placeholder="Team description (optional)"
                  className="h-12"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                <Label className="text-base font-semibold">Team Color</Label>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => { setEditedColor(color.value); markChanged() }}
                    className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                      editedColor === color.value
                        ? 'border-foreground shadow-lg scale-105'
                        : 'border-border/50 hover:border-foreground/30'
                    }`}
                    style={{ backgroundColor: color.light }}
                  >
                    <div
                      className="w-full h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: color.value }}
                    />
                    <p className="text-xs font-medium mt-2 text-center truncate">{color.name}</p>
                    {editedColor === color.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-background" weight="bold" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" />
                  <Label className="text-base font-semibold">Team Members ({editedMembers.length})</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingMember(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </Button>
              </div>

              <AnimatePresence mode="popLayout">
                {isAddingMember && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="border-2 border-dashed border-rose-blush/30 dark:border-moonlit-lavender/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={newMemberName}
                              onChange={(e) => setNewMemberName(e.target.value)}
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Email</Label>
                            <Input
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              placeholder="john@example.com"
                              type="email"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Role:</Label>
                            <Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as 'lead' | 'member')}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="lead">Team Lead</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsAddingMember(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={addNewMember}>
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {editedMembers.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="hover:border-rose-blush/30 dark:hover:border-moonlit-lavender/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                            style={{ backgroundColor: editedColor }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Name</Label>
                                <Input
                                  value={member.name}
                                  onChange={(e) => updateMemberName(member.id, e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <Input
                                  value={member.email}
                                  onChange={(e) => updateMemberEmail(member.id, e.target.value)}
                                  className="h-9"
                                  type="email"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground">Role:</Label>
                                <Select 
                                  value={member.role} 
                                  onValueChange={(v) => updateMemberRole(member.id, v as 'lead' | 'member')}
                                >
                                  <SelectTrigger className="w-36 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">
                                      <span className="flex items-center gap-2">
                                        <UserCircle className="w-4 h-4" />
                                        Member
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="lead">
                                      <span className="flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-amber-500" weight="fill" />
                                        Team Lead
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {member.role === 'lead' && (
                                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                                    <Crown className="w-3 h-3 mr-1" weight="fill" />
                                    Lead
                                  </Badge>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMember(member.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {editedMembers.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-xl">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                  <p className="text-muted-foreground">No members in this team</p>
                  <Button
                    variant="link"
                    onClick={() => setIsAddingMember(true)}
                    className="mt-2"
                  >
                    Add the first member
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400">All changes saved</span>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={saveChanges}
              disabled={!hasChanges}
              className="bg-gradient-to-r from-rose-blush to-lavender-mist hover:shadow-lg dark:from-moonlit-violet dark:to-moonlit-lavender text-white"
            >
              <FloppyDisk className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
