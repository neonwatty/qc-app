import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Progress } from '@components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group'
import { ArrowRight, Users, Calendar, MessageCircle } from 'lucide-react'

interface OnboardingStep {
  title: string
  description: string
  Icon: typeof Users
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Quality Control',
    description: "Let's set up your relationship check-in space",
    Icon: Users,
  },
  {
    title: 'Invite Your Partner',
    description: 'Send an invitation to join your couple space',
    Icon: MessageCircle,
  },
  {
    title: 'Set Your Schedule',
    description: "Choose when you'd like to have check-ins",
    Icon: Calendar,
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [checkInFrequency, setCheckInFrequency] = useState('weekly')

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      navigate('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: {
        const StepIcon = steps[0].Icon
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center mb-6">
              <StepIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{steps[0].title}</h2>
            <p className="text-gray-600">{steps[0].description}</p>
            <div className="pt-4">
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      }
      case 1: {
        const StepIcon = steps[1].Icon
        return (
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <StepIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">{steps[1].title}</h2>
            <p className="text-gray-600 text-center">{steps[1].description}</p>
            <div className="space-y-2">
              <Label htmlFor="partner-email">Partner's Email</Label>
              <Input
                id="partner-email"
                type="email"
                placeholder="partner@example.com"
                value={partnerEmail}
                onChange={e => setPartnerEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Send Invitation
              </Button>
            </div>
          </div>
        )

      }
      case 2: {
        const StepIcon = steps[2].Icon
        return (
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <StepIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">{steps[2].title}</h2>
            <p className="text-gray-600 text-center">{steps[2].description}</p>
            <RadioGroup value={checkInFrequency} onValueChange={setCheckInFrequency}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="flex-1 cursor-pointer">
                    Daily check-ins
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                    Weekly check-ins (Recommended)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="biweekly" id="biweekly" />
                  <Label htmlFor="biweekly" className="flex-1 cursor-pointer">
                    Every two weeks
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                    Monthly check-ins
                  </Label>
                </div>
              </div>
            </RadioGroup>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Complete Setup
              </Button>
            </div>
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="mb-4" />
          <CardTitle>Step {currentStep + 1} of {steps.length}</CardTitle>
          <CardDescription>Setting up your couple space</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>
    </div>
  )
}