'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  Settings, 
  Users, 
  Clock, 
  Pause,
  CheckCircle,
  AlertCircle,
  Play,
  X,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DemoStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  demo: React.ReactNode
}

export function SessionSettingsDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showDemo, setShowDemo] = useState(false)
  const [simulatedSettings, setSimulatedSettings] = useState({
    sessionDuration: 10,
    timeoutsPerPartner: 1,
    turnBasedMode: true,
    turnDuration: 90
  })

  const demoSteps: DemoStep[] = [
    {
      id: 'intro',
      title: 'Welcome to Session Rules',
      description: 'Create fair, structured check-ins that work for both partners',
      icon: <Settings className="w-5 h-5" />,
      demo: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-100">
            <h3 className="text-lg font-semibold mb-2">Why Session Rules?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-500 mt-0.5" />
                <span>Ensure both partners get equal speaking time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-500 mt-0.5" />
                <span>Prevent conversations from running too long</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-500 mt-0.5" />
                <span>Build healthy communication habits</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'templates',
      title: 'Choose Your Style',
      description: 'Start with a template or customize your own',
      icon: <Sparkles className="w-5 h-5" />,
      demo: (
        <div className="space-y-3">
          <div 
            className="border-2 border-pink-300 bg-pink-50 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setSimulatedSettings({ sessionDuration: 5, timeoutsPerPartner: 0, turnBasedMode: false, turnDuration: 0 })}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Quick Check-in</h4>
              <Badge variant="secondary">5 min</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Fast, focused conversation without timeouts</p>
          </div>
          
          <div 
            className="border-2 border-purple-300 bg-purple-50 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setSimulatedSettings({ sessionDuration: 10, timeoutsPerPartner: 1, turnBasedMode: true, turnDuration: 90 })}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Standard Session</h4>
              <Badge variant="secondary">10 min</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Balanced with turn-taking and timeouts</p>
          </div>
          
          <div 
            className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-pink-400 transition-all hover:shadow-md"
            onClick={() => setSimulatedSettings({ sessionDuration: 20, timeoutsPerPartner: 2, turnBasedMode: true, turnDuration: 120 })}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Deep Dive</h4>
              <Badge variant="secondary">20 min</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Extended discussion with warm-up questions</p>
          </div>
        </div>
      )
    },
    {
      id: 'timer',
      title: 'Session Timer in Action',
      description: 'Keep track of time with visual indicators',
      icon: <Clock className="w-5 h-5" />,
      demo: (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-mono font-bold">
                      {String(Math.floor(simulatedSettings.sessionDuration * 0.6)).padStart(2, '0')}:42
                    </div>
                    <p className="text-xs text-muted-foreground">Session time</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Pause className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all" style={{ width: '40%' }} />
              </div>
              
              {simulatedSettings.timeoutsPerPartner > 0 && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Pause className="w-3 h-3 mr-1" />
                    You ({simulatedSettings.timeoutsPerPartner})
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Pause className="w-3 h-3 mr-1" />
                    Partner ({simulatedSettings.timeoutsPerPartner})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Timer shows remaining time, progress bar, and available timeouts
          </div>
        </div>
      )
    },
    {
      id: 'turns',
      title: 'Fair Turn-Taking',
      description: 'Everyone gets equal time to share',
      icon: <Users className="w-5 h-5" />,
      demo: (
        <div className="space-y-4">
          {simulatedSettings.turnBasedMode ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Turn-based Discussion</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Round 2</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border-2 border-pink-400">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow">
                        A
                      </div>
                      <div>
                        <p className="text-sm font-medium">Alex's Turn</p>
                        <p className="text-lg font-mono font-bold">1:15</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7">
                      Pass
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg opacity-60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center text-xs">
                        J
                      </div>
                      <span className="text-xs text-muted-foreground">Jordan (next)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Turn-based mode is disabled for quick sessions
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {simulatedSettings.turnBasedMode 
              ? `Each person gets ${simulatedSettings.turnDuration} seconds per turn`
              : 'Enable turn-based mode for structured discussions'
            }
          </div>
        </div>
      )
    },
    {
      id: 'agreement',
      title: 'Partner Agreement',
      description: 'Both partners must approve rule changes',
      icon: <CheckCircle className="w-5 h-5" />,
      demo: (
        <div className="space-y-4">
          <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-base">Pending Approval</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Your partner proposed these changes:
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Session Duration</span>
                  <span className="font-medium">10 min → 15 min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Turn-based Mode</span>
                  <span className="font-medium">Off → On</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Settings only change when both partners agree
          </div>
        </div>
      )
    }
  ]

  return (
    <>
      {/* Demo Trigger Button */}
      <Card className="border-2 border-pink-200 hover:border-pink-400 bg-gradient-to-r from-pink-50 to-purple-50 transition-all cursor-pointer hover:shadow-md"
            onClick={() => setShowDemo(true)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">See Session Rules in Action</h3>
                <p className="text-sm text-gray-600">
                  Interactive walkthrough of the new feature
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-pink-500" />
          </div>
        </CardContent>
      </Card>

      {/* Demo Modal */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="border-b border-pink-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  {demoSteps[currentStep].icon}
                </div>
                <DialogTitle className="text-gray-900">{demoSteps[currentStep].title}</DialogTitle>
              </div>
              <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                Step {currentStep + 1} / {demoSteps.length}
              </Badge>
            </div>
            <DialogDescription className="text-gray-600 mt-2">
              {demoSteps[currentStep].description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {demoSteps[currentStep].demo}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-pink-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="border-pink-200 hover:bg-pink-50"
            >
              Previous
            </Button>
            
            <div className="flex gap-1">
              {demoSteps.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 w-6' 
                      : 'bg-pink-200 hover:bg-pink-300'
                  }`}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>

            {currentStep < demoSteps.length - 1 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setShowDemo(false)
                  setCurrentStep(0)
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                Get Started
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}