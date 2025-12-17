import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Team, TeamMember } from '@/lib/team-performance-service'
import { Plus, Users, Trash, Envelope, Crown, UserCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function TeamManager() {
  const [teams, setTeams] = useKV<Team[]>('teams', [])
  const [isCreating, setIsCreating] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDescription, setNewTeamDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState('#E088AA')

  const colors = [
    { name: 'Rose', value: '#E088AA' },
    { name: 'Lavender', value: '#BA94DA' },
    { name: 'Sky', value: '#A7C7E7' },
    { name: 'Mint', value: '#98D8C8' },
    { name: 'Peach', value: '#FFB7C5' },
    { name: 'Gold', value: '#F7E7CE' }
  ]

  const createTeam = () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name')
      return
    }

    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newTeamName,
      color: selectedColor,
      members: [],
      createdAt: new Date().toISOString(),
      description: newTeamDescription
    }

    setTeams((currentTeams) => [...(currentTeams || []), newTeam])
    toast.success(`Team "${newTeamName}" created successfully`)
    
    setNewTeamName('')
    setNewTeamDescription('')
    setSelectedColor('#E088AA')
    setIsCreating(false)
  }

  const deleteTeam = (teamId: string) => {
    const team = (teams || []).find(t => t.id === teamId)
    if (!team) return

    if (confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      setTeams((currentTeams) => (currentTeams || []).filter(t => t.id !== teamId))
      toast.success(`Team "${team.name}" deleted`)
    }
  }

  const addMemberToTeam = (teamId: string, memberName: string, memberEmail: string) => {
    if (!memberName.trim() || !memberEmail.trim()) {
      toast.error('Please enter member name and email')
      return
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: memberName,
      email: memberEmail,
      role: 'member',
      joinedAt: new Date().toISOString()
    }

    setTeams((currentTeams) =>
      (currentTeams || []).map(team =>
        team.id === teamId
          ? { ...team, members: [...team.members, newMember] }
          : team
      )
    )

    toast.success(`${memberName} added to team`)
  }

  const removeMember = (teamId: string, memberId: string) => {
    setTeams((currentTeams) =>
      (currentTeams || []).map(team =>
        team.id === teamId
          ? { ...team, members: team.members.filter(m => m.id !== memberId) }
          : team
      )
    )
    toast.success('Member removed from team')
  }

  const toggleMemberRole = (teamId: string, memberId: string) => {
    setTeams((currentTeams) =>
      (currentTeams || []).map(team =>
        team.id === teamId
          ? {
              ...team,
              members: team.members.map(member =>
                member.id === memberId
                  ? { ...member, role: member.role === 'lead' ? 'member' : 'lead' }
                  : member
              )
            }
          : team
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-foreground">Team Management</h2>
          <p className="text-muted-foreground mt-1">Create and manage teams for performance tracking</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-5 h-5" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Create New Team</DialogTitle>
              <DialogDescription>
                Set up a new team to track performance and manage members
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="e.g., Development Team Alpha"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createTeam()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-description">Description (Optional)</Label>
                <Input
                  id="team-description"
                  placeholder="Team purpose or focus area"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Team Color</Label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-12 h-12 rounded-full transition-all duration-300 ${
                        selectedColor === color.value
                          ? 'ring-4 ring-offset-2 ring-offset-background scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: color.value
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={createTeam} className="w-full">
                Create Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {(teams || []).map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <TeamCard
                team={team}
                onDelete={() => deleteTeam(team.id)}
                onAddMember={(name, email) => addMemberToTeam(team.id, name, email)}
                onRemoveMember={(memberId) => removeMember(team.id, memberId)}
                onToggleRole={(memberId) => toggleMemberRole(team.id, memberId)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {(teams || []).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full"
          >
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-serif font-semibold mb-2">No teams yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create your first team to start tracking performance
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Team
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function TeamCard({
  team,
  onDelete,
  onAddMember,
  onRemoveMember,
  onToggleRole
}: {
  team: Team
  onDelete: () => void
  onAddMember: (name: string, email: string) => void
  onRemoveMember: (memberId: string) => void
  onToggleRole: (memberId: string) => void
}) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [memberEmail, setMemberEmail] = useState('')

  const handleAddMember = () => {
    onAddMember(memberName, memberEmail)
    setMemberName('')
    setMemberEmail('')
    setIsAddingMember(false)
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="h-2"
        style={{ backgroundColor: team.color }}
      />
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="font-serif text-xl">{team.name}</CardTitle>
            {team.description && (
              <CardDescription className="mt-1">{team.description}</CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {team.members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: team.color }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{member.name}</p>
                    {member.role === 'lead' && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Crown className="w-3 h-3" weight="fill" />
                        Lead
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Envelope className="w-3 h-3" />
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleRole(member.id)}
                  title={member.role === 'lead' ? 'Remove lead role' : 'Make team lead'}
                >
                  <Crown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveMember(member.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {isAddingMember ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2"
              >
                <Input
                  placeholder="Member name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                />
                <Input
                  placeholder="Member email"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddMember} size="sm" className="flex-1">
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAddingMember(false)
                      setMemberName('')
                      setMemberEmail('')
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingMember(true)}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
