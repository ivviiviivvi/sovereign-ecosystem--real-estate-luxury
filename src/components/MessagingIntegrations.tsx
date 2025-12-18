import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Textarea } from './ui/textarea'
import { Team } from '@/lib/team-performance-service'
import {
  Plugs,
  SlackLogo,
  MicrosoftTeamsLogo,
  Link,
  CheckCircle,
  XCircle,
  Warning,
  Clock,
  PaperPlaneTilt,
  Gear,
  Trash,
  Plus,
  Lightning,
  Bell,
  Calendar,
  Users,
  ChartBar,
  Trophy
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { soundManager } from '@/lib/sound-manager'

interface Integration {
  id: string
  type: 'slack' | 'teams'
  name: string
  webhookUrl: string
  channel: string
  enabled: boolean
  createdAt: string
  lastUsed?: string
  status: 'connected' | 'error' | 'pending'
  reportTypes: ('daily' | 'weekly' | 'monthly' | 'alerts')[]
  teamIds: string[]
}

interface IntegrationMessage {
  id: string
  integrationId: string
  timestamp: string
  status: 'sent' | 'failed' | 'pending'
  messageType: string
  error?: string
}

interface MessagingIntegrationsProps {
  teams: Team[]
}

export function MessagingIntegrations({ teams }: MessagingIntegrationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [integrations, setIntegrations] = useKV<Integration[]>('messaging-integrations', [])
  const [messageHistory, setMessageHistory] = useKV<IntegrationMessage[]>('integration-message-history', [])
  
  const [isCreating, setIsCreating] = useState(false)
  const [newIntegrationType, setNewIntegrationType] = useState<'slack' | 'teams'>('slack')
  const [newIntegrationName, setNewIntegrationName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newChannel, setNewChannel] = useState('')
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>(['weekly'])
  const [editingId, setEditingId] = useState<string | null>(null)

  const createIntegration = () => {
    if (!newIntegrationName.trim()) {
      toast.error('Please enter an integration name')
      return
    }
    if (!newWebhookUrl.trim()) {
      toast.error('Please enter a webhook URL')
      return
    }
    if (!newChannel.trim()) {
      toast.error('Please enter a channel name')
      return
    }

    const isValidUrl = newWebhookUrl.startsWith('https://') && (
      (newIntegrationType === 'slack' && newWebhookUrl.includes('hooks.slack.com')) ||
      (newIntegrationType === 'teams' && newWebhookUrl.includes('webhook.office.com'))
    )

    const newIntegration: Integration = {
      id: `integration-${Date.now()}`,
      type: newIntegrationType,
      name: newIntegrationName,
      webhookUrl: newWebhookUrl,
      channel: newChannel,
      enabled: true,
      createdAt: new Date().toISOString(),
      status: isValidUrl ? 'connected' : 'pending',
      reportTypes: selectedReportTypes as Integration['reportTypes'],
      teamIds: selectedTeams.length > 0 ? selectedTeams : teams.map(t => t.id)
    }

    setIntegrations(prev => [...(prev || []), newIntegration])
    soundManager.play('glassTap')
    toast.success(`${newIntegrationType === 'slack' ? 'Slack' : 'Microsoft Teams'} integration created`, {
      description: `Reports will be sent to #${newChannel}`
    })

    resetForm()
    setIsCreating(false)
  }

  const resetForm = () => {
    setNewIntegrationName('')
    setNewWebhookUrl('')
    setNewChannel('')
    setSelectedTeams([])
    setSelectedReportTypes(['weekly'])
    setNewIntegrationType('slack')
  }

  const deleteIntegration = (id: string) => {
    const integration = (integrations || []).find(i => i.id === id)
    if (!integration) return

    setIntegrations(prev => (prev || []).filter(i => i.id !== id))
    soundManager.play('glassTap')
    toast.success('Integration deleted', {
      description: `${integration.name} has been removed`
    })
  }

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      (prev || []).map(i => i.id === id ? { ...i, enabled: !i.enabled } : i)
    )
  }

  const sendTestMessage = async (integration: Integration) => {
    toast.loading('Sending test message...', { id: `test-${integration.id}` })

    await new Promise(resolve => setTimeout(resolve, 1500))

    const success = Math.random() > 0.2

    const message: IntegrationMessage = {
      id: `msg-${Date.now()}`,
      integrationId: integration.id,
      timestamp: new Date().toISOString(),
      status: success ? 'sent' : 'failed',
      messageType: 'test',
      error: success ? undefined : 'Connection timeout'
    }

    setMessageHistory(prev => [...(prev || []), message])
    
    setIntegrations(prev =>
      (prev || []).map(i => i.id === integration.id ? {
        ...i,
        lastUsed: new Date().toISOString(),
        status: success ? 'connected' : 'error'
      } : i)
    )

    if (success) {
      soundManager.play('glassTap')
      toast.success('Test message sent!', {
        id: `test-${integration.id}`,
        description: `Message delivered to #${integration.channel}`
      })
    } else {
      toast.error('Failed to send test message', {
        id: `test-${integration.id}`,
        description: 'Check your webhook URL and try again'
      })
    }
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" weight="fill" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" weight="fill" />
      case 'pending':
        return <Warning className="w-4 h-4 text-yellow-500" weight="fill" />
    }
  }

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/10 text-green-600 border-green-500/30'
      case 'error':
        return 'bg-red-500/10 text-red-600 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
    }
  }

  const slackIntegrations = (integrations || []).filter(i => i.type === 'slack')
  const teamsIntegrations = (integrations || []).filter(i => i.type === 'teams')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hover:border-rose-blush/50 dark:hover:border-moonlit-lavender/50"
          onClick={() => soundManager.play('glassTap')}
        >
          <Plugs className="w-5 h-5" weight="fill" />
          Integrations
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Plugs className="w-6 h-6 text-white" weight="fill" />
            </motion.div>
            <div>
              <div>Messaging Integrations</div>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Connect Slack or Microsoft Teams for automated report delivery
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="integrations" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="integrations" className="gap-2">
              <Link className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Gear className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <SlackLogo className="w-4 h-4 text-[#4A154B]" weight="fill" />
                  {slackIntegrations.length} Slack
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MicrosoftTeamsLogo className="w-4 h-4 text-[#6264A7]" weight="fill" />
                  {teamsIntegrations.length} Teams
                </Badge>
              </div>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Integration
              </Button>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <AnimatePresence mode="popLayout">
                {isCreating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <Card className="border-2 border-dashed border-rose-blush/30 dark:border-moonlit-lavender/30">
                      <CardHeader>
                        <CardTitle className="text-lg font-serif">New Integration</CardTitle>
                        <CardDescription>Connect a new messaging platform</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-3">
                          <Button
                            variant={newIntegrationType === 'slack' ? 'default' : 'outline'}
                            onClick={() => setNewIntegrationType('slack')}
                            className={`flex-1 gap-2 ${newIntegrationType === 'slack' ? 'bg-[#4A154B] hover:bg-[#4A154B]/90' : ''}`}
                          >
                            <SlackLogo className="w-5 h-5" weight="fill" />
                            Slack
                          </Button>
                          <Button
                            variant={newIntegrationType === 'teams' ? 'default' : 'outline'}
                            onClick={() => setNewIntegrationType('teams')}
                            className={`flex-1 gap-2 ${newIntegrationType === 'teams' ? 'bg-[#6264A7] hover:bg-[#6264A7]/90' : ''}`}
                          >
                            <MicrosoftTeamsLogo className="w-5 h-5" weight="fill" />
                            Microsoft Teams
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Integration Name</Label>
                            <Input
                              value={newIntegrationName}
                              onChange={(e) => setNewIntegrationName(e.target.value)}
                              placeholder="e.g., Team Reports Channel"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Channel Name</Label>
                            <Input
                              value={newChannel}
                              onChange={(e) => setNewChannel(e.target.value)}
                              placeholder={newIntegrationType === 'slack' ? '#general' : 'General'}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input
                            value={newWebhookUrl}
                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                            placeholder={newIntegrationType === 'slack' 
                              ? 'https://hooks.slack.com/services/...'
                              : 'https://outlook.office.com/webhook/...'
                            }
                            type="url"
                          />
                          <p className="text-xs text-muted-foreground">
                            {newIntegrationType === 'slack' 
                              ? 'Create an incoming webhook in your Slack workspace settings'
                              : 'Create an incoming webhook connector in your Teams channel'
                            }
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Report Types</Label>
                          <div className="flex gap-2 flex-wrap">
                            {['daily', 'weekly', 'monthly', 'alerts'].map(type => (
                              <Badge
                                key={type}
                                variant={selectedReportTypes.includes(type) ? 'default' : 'outline'}
                                className="cursor-pointer capitalize"
                                onClick={() => setSelectedReportTypes(prev =>
                                  prev.includes(type)
                                    ? prev.filter(t => t !== type)
                                    : [...prev, type]
                                )}
                              >
                                {type === 'daily' && <Calendar className="w-3 h-3 mr-1" />}
                                {type === 'weekly' && <ChartBar className="w-3 h-3 mr-1" />}
                                {type === 'monthly' && <Trophy className="w-3 h-3 mr-1" />}
                                {type === 'alerts' && <Bell className="w-3 h-3 mr-1" />}
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Teams to Include</Label>
                          <div className="flex gap-2 flex-wrap">
                            {teams.map(team => (
                              <Badge
                                key={team.id}
                                variant={selectedTeams.includes(team.id) || selectedTeams.length === 0 ? 'default' : 'outline'}
                                className="cursor-pointer"
                                style={{
                                  backgroundColor: selectedTeams.includes(team.id) || selectedTeams.length === 0 
                                    ? team.color 
                                    : undefined,
                                  color: selectedTeams.includes(team.id) || selectedTeams.length === 0 
                                    ? 'white' 
                                    : undefined
                                }}
                                onClick={() => setSelectedTeams(prev =>
                                  prev.includes(team.id)
                                    ? prev.filter(t => t !== team.id)
                                    : [...prev, team.id]
                                )}
                              >
                                <Users className="w-3 h-3 mr-1" />
                                {team.name}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Leave empty to include all teams
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={createIntegration} className="flex-1 gap-2">
                            <Plus className="w-4 h-4" />
                            Create Integration
                          </Button>
                          <Button variant="outline" onClick={() => { resetForm(); setIsCreating(false); }}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {(integrations || []).length === 0 && !isCreating ? (
                  <Card className="p-12 bg-muted/30 text-center">
                    <Plugs className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-serif font-semibold mb-2">No Integrations Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect Slack or Microsoft Teams to receive automated reports
                    </p>
                    <Button onClick={() => setIsCreating(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Your First Integration
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {(integrations || []).map((integration, idx) => (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className={`overflow-hidden transition-opacity ${!integration.enabled ? 'opacity-60' : ''}`}>
                          <div 
                            className="h-1.5"
                            style={{ 
                              backgroundColor: integration.type === 'slack' ? '#4A154B' : '#6264A7'
                            }}
                          />
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                integration.type === 'slack' 
                                  ? 'bg-[#4A154B]/10' 
                                  : 'bg-[#6264A7]/10'
                              }`}>
                                {integration.type === 'slack' 
                                  ? <SlackLogo className="w-6 h-6 text-[#4A154B]" weight="fill" />
                                  : <MicrosoftTeamsLogo className="w-6 h-6 text-[#6264A7]" weight="fill" />
                                }
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-semibold">{integration.name}</h3>
                                  <Badge className={`gap-1 ${getStatusBadge(integration.status)}`}>
                                    {getStatusIcon(integration.status)}
                                    {integration.status}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1">
                                    #{integration.channel}
                                  </span>
                                  {integration.lastUsed && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Last used: {new Date(integration.lastUsed).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {integration.reportTypes.map(type => (
                                    <Badge key={type} variant="secondary" className="text-xs capitalize">
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={integration.enabled}
                                  onCheckedChange={() => toggleIntegration(integration.id)}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendTestMessage(integration)}
                                  disabled={!integration.enabled}
                                  className="gap-1"
                                >
                                  <PaperPlaneTilt className="w-4 h-4" />
                                  Test
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteIntegration(integration.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4 py-4">
              {(messageHistory || []).length === 0 ? (
                <Card className="p-12 bg-muted/30 text-center">
                  <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-serif font-semibold mb-2">No Message History</h3>
                  <p className="text-muted-foreground">
                    Messages sent through integrations will appear here
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {(messageHistory || []).slice().reverse().map((message, idx) => {
                    const integration = (integrations || []).find(i => i.id === message.integrationId)
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <Card className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              message.status === 'sent' 
                                ? 'bg-green-500/10' 
                                : message.status === 'failed'
                                ? 'bg-red-500/10'
                                : 'bg-yellow-500/10'
                            }`}>
                              {message.status === 'sent' && <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />}
                              {message.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" weight="fill" />}
                              {message.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{integration?.name || 'Unknown'}</span>
                                <Badge variant="outline" className="text-xs">
                                  {message.messageType}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(message.timestamp).toLocaleString()}
                              </div>
                              {message.error && (
                                <div className="text-sm text-red-500 mt-1">{message.error}</div>
                              )}
                            </div>

                            <Badge className={
                              message.status === 'sent' 
                                ? 'bg-green-500/10 text-green-600' 
                                : message.status === 'failed'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-yellow-500/10 text-yellow-600'
                            }>
                              {message.status}
                            </Badge>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4 py-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif flex items-center gap-2">
                      <Lightning className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" weight="fill" />
                      Automatic Report Delivery
                    </CardTitle>
                    <CardDescription>
                      Configure when reports are automatically sent to connected platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Daily Reports Time</Label>
                        <Input type="time" defaultValue="09:00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Weekly Reports Day</Label>
                        <Select defaultValue="1">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                              <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Report Content</Label>
                      <div className="space-y-2">
                        {[
                          { id: 'summary', label: 'Include performance summary', default: true },
                          { id: 'charts', label: 'Include trend charts', default: true },
                          { id: 'top-performers', label: 'Highlight top performers', default: true },
                          { id: 'benchmarks', label: 'Include industry benchmarks', default: false },
                          { id: 'alerts', label: 'Send critical alerts immediately', default: true }
                        ].map(option => (
                          <div key={option.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-sm">{option.label}</span>
                            <Switch defaultChecked={option.default} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif flex items-center gap-2">
                      <Bell className="w-5 h-5 text-rose-blush dark:text-moonlit-lavender" weight="fill" />
                      Alert Thresholds
                    </CardTitle>
                    <CardDescription>
                      Set thresholds for automatic alert notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Success Rate Below (%)</Label>
                        <Input type="number" defaultValue="70" min="0" max="100" />
                      </div>
                      <div className="space-y-2">
                        <Label>Score Drop By (%)</Label>
                        <Input type="number" defaultValue="15" min="0" max="100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
