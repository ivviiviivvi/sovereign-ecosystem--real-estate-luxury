import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from 'sonner'
import { Property, UserRole, Document } from './lib/types'
import { analyzeProperty, getWatchlistProperties, getRiskMapProperties } from './lib/compliance'
import { marketDataService } from './lib/market-data'
import { RoleSelector } from './components/RoleSelector'
import { ClientAuth } from './components/ClientAuth'
import { AgentDashboard } from './components/AgentDashboard'
import { ClientFeed } from './components/ClientFeed'
import { AIConcierge } from './components/AIConcierge'
import { PrivateVault } from './components/PrivateVault'
import { MarketOverview } from './components/MarketOverview'
import { PatternAlertNotifications } from './components/PatternAlertNotifications'
import { LiveAlertToast } from './components/LiveAlertToast'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { Volume2, VolumeX } from 'lucide-react'
import { soundManager } from './lib/sound-manager'

function App() {
  const [properties] = useKV<Property[]>('properties', [])
  const [documents] = useKV<Document[]>('documents', [])
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    if (properties && properties.length > 0) {
      marketDataService.initialize(properties)
    }

    return () => {
      marketDataService.cleanup()
    }
  }, [properties])

  const analyzedProperties = (properties || []).map(analyzeProperty)
  const watchlistProperties = getWatchlistProperties(analyzedProperties)
  const riskProperties = getRiskMapProperties(analyzedProperties)

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role)
    if (role === 'agent') {
      setIsAuthenticated(true)
    }
  }

  const handleClientAuth = (inviteCode: string) => {
    setIsAuthenticated(true)
  }

  const handleBack = () => {
    setUserRole(null)
    setIsAuthenticated(false)
  }

  const toggleSound = () => {
    const enabled = soundManager.toggle()
    setSoundEnabled(enabled)
    soundManager.play('glassTap')
  }

  if (!userRole) {
    return (
      <>
        <RoleSelector onSelectRole={handleRoleSelect} />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        <Toaster theme="dark" position="top-center" />
      </>
    )
  }

  if (userRole === 'client' && !isAuthenticated) {
    return (
      <>
        <ClientAuth onAuthenticate={handleClientAuth} />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        <Toaster theme="dark" position="top-center" />
      </>
    )
  }

  if (userRole === 'agent') {
    return (
      <>
        <AgentDashboard
          properties={analyzedProperties}
          watchlistProperties={watchlistProperties}
          riskProperties={riskProperties}
          onBack={handleBack}
        />
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        <LiveAlertToast />
        <Toaster theme="dark" position="top-center" />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-onyx-deep">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="w-full justify-center bg-onyx-surface border-b border-border rounded-none sticky top-0 z-40">
            <TabsTrigger value="feed" className="data-[state=active]:text-champagne-gold">
              Feed
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:text-champagne-gold">
              Market
            </TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:text-champagne-gold">
              Vault
            </TabsTrigger>
            <div className="ml-auto flex items-center gap-2 pr-2">
              <PatternAlertNotifications />
            </div>
          </TabsList>

          <TabsContent value="feed" className="m-0">
            <ClientFeed properties={analyzedProperties} onBack={handleBack} />
          </TabsContent>

          <TabsContent value="market" className="m-0">
            <div className="container mx-auto p-6">
              <MarketOverview properties={analyzedProperties} />
            </div>
          </TabsContent>

          <TabsContent value="vault" className="m-0">
            <div className="container mx-auto">
              <PrivateVault documents={documents || []} />
            </div>
          </TabsContent>
        </Tabs>

        <AIConcierge properties={analyzedProperties} userPortfolio={analyzedProperties} />
      </div>
      <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
      <LiveAlertToast />
      <Toaster theme="dark" position="top-center" />
    </>
  )
}

function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-onyx-surface border border-border hover:border-champagne-gold flex items-center justify-center transition-colors"
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5 text-champagne-gold" />
      ) : (
        <VolumeX className="w-5 h-5 text-slate-grey" />
      )}
    </button>
  )
}

export default App