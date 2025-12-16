import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useAlertRules } from '@/hooks/use-pattern-alerts'
import { patternAlertService, AlertRule, AlertPriority } from '@/lib/pattern-alerts'
import { toast } from 'sonner'

export function PatternAlertSettings() {
  const rules = useAlertRules()
  const [open, setOpen] = useState(false)

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    patternAlertService.updateAlertRule(ruleId, { enabled })
    toast.success(enabled ? 'Alert rule enabled' : 'Alert rule disabled')
  }

  const handleToggleSound = (ruleId: string, soundEnabled: boolean) => {
    patternAlertService.updateAlertRule(ruleId, { soundEnabled })
  }

  const handleUpdateConfidence = (ruleId: string, minConfidence: number) => {
    patternAlertService.updateAlertRule(ruleId, { minConfidence })
  }

  const handleResetToDefault = () => {
    patternAlertService.resetRulesToDefault()
    toast.success('Alert rules reset to default settings')
  }

  const getPriorityBadgeColor = (priority: AlertPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Alert Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-onyx-surface border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-champagne-gold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Pattern Alert Settings
          </DialogTitle>
          <DialogDescription className="text-slate-grey">
            Configure which volatility patterns trigger alerts and customize notification preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Alert Rules</h3>
              <p className="text-xs text-slate-grey">
                {rules.filter(r => r.enabled).length} of {rules.length} rules enabled
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 border transition-all ${
                  rule.enabled 
                    ? 'bg-onyx-deep border-border' 
                    : 'bg-onyx-deep/50 border-border/50 opacity-60'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-bold text-foreground">
                          {rule.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={getPriorityBadgeColor(rule.priority)}
                        >
                          {rule.priority}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rule.patterns.map(pattern => (
                          <Badge
                            key={pattern}
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                    />
                  </div>

                  {rule.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-3 border-t border-border"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-slate-grey">
                            Minimum Confidence
                          </Label>
                          <span className="text-xs font-semibold text-champagne-gold">
                            {rule.minConfidence}%
                          </span>
                        </div>
                        <Slider
                          value={[rule.minConfidence]}
                          onValueChange={([value]) => handleUpdateConfidence(rule.id, value)}
                          min={50}
                          max={95}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-xs text-slate-grey mt-1">
                          Only trigger alerts when pattern confidence exceeds this threshold
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs text-slate-grey">
                            Sound Notification
                          </Label>
                          <p className="text-xs text-slate-grey/70 mt-1">
                            Play audio when alert triggers
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSound(rule.id, !rule.soundEnabled)}
                          className="gap-2"
                        >
                          {rule.soundEnabled ? (
                            <Volume2 className="w-4 h-4 text-champagne-gold" />
                          ) : (
                            <VolumeX className="w-4 h-4 text-slate-grey" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <Separator />

          <div className="bg-onyx-deep p-4 rounded-lg border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              How Pattern Alerts Work
            </h4>
            <ul className="space-y-2 text-xs text-slate-grey">
              <li className="flex gap-2">
                <span className="text-champagne-gold">•</span>
                <span>
                  Alerts are triggered when detected patterns meet confidence thresholds
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-champagne-gold">•</span>
                <span>
                  Each pattern has a 30-second cooldown to prevent notification spam
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-champagne-gold">•</span>
                <span>
                  Critical and high-priority alerts include sound notifications when enabled
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-champagne-gold">•</span>
                <span>
                  Adjust confidence levels to fine-tune alert sensitivity
                </span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
