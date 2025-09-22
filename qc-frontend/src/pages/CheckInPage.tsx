import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@hooks/redux'
import { createCheckIn, updateCheckIn } from '@store/slices/checkInSlice'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Progress } from '@components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import { ArrowRight, ArrowLeft, Heart, MessageCircle, Target } from 'lucide-react'

const categories = [
  { id: 'emotional', label: 'Emotional Connection', icon: Heart },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
  { id: 'goals', label: 'Goals & Dreams', icon: Target },
]

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'categories', title: 'Choose Topics' },
  { id: 'discussion', title: 'Discussion' },
  { id: 'reflection', title: 'Reflection' },
  { id: 'action', title: 'Action Items' },
  { id: 'complete', title: 'Complete' },
]

export function CheckInPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { currentCheckIn } = useAppSelector(state => state.checkIn)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [actionItems, setActionItems] = useState('')

  useEffect(() => {
    if (!currentCheckIn && user?.couple_id) {
      void dispatch(createCheckIn({ coupleId: user.couple_id }))
    }
  }, [dispatch, currentCheckIn, user])

  const handleNext = async () => {
    if (currentStep === 1 && selectedCategories.length > 0 && currentCheckIn) {
      await dispatch(
        updateCheckIn({
          id: currentCheckIn.id,
          updates: { categories: selectedCategories },
        })
      ).unwrap()
    }

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
      case 0: // Welcome
        return (
          <div className="space-y-4 text-center">
            <Heart className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Ready for your check-in?</h2>
            <p className="text-gray-600">
              Take a few minutes to connect with your partner and strengthen your relationship.
            </p>
            <Button onClick={handleNext} size="lg" className="mt-6">
              Let's Begin <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )

      case 1: // Categories
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What would you like to discuss?</h2>
            <p className="text-gray-600">Choose one or more topics for today's check-in</p>
            <div className="space-y-3">
              {categories.map(category => {
                const Icon = category.icon
                return (
                  <label
                    key={category.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedCategories.includes(category.id)
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id])
                        } else {
                          setSelectedCategories(
                            selectedCategories.filter(id => id !== category.id)
                          )
                        }
                      }}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{category.label}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedCategories.length === 0}
                className="flex-1"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 2: // Discussion
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Discussion Time</h2>
            <p className="text-gray-600">
              Take turns sharing your thoughts on the selected topics. Listen actively and be
              present.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Use "I feel" statements and focus on understanding each
                other's perspectives.
              </p>
            </div>
            <div className="py-8 text-center">
              <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-gray-500">Have your discussion now...</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 3: // Reflection
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Reflection</h2>
            <p className="text-gray-600">
              How did the discussion go? Write down any thoughts or insights.
            </p>
            <Textarea
              placeholder="Share your reflections..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={6}
            />
            <RadioGroup defaultValue="shared">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Keep this note private</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shared" id="shared" />
                <Label htmlFor="shared">Share with partner</Label>
              </div>
            </RadioGroup>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 4: // Action Items
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Action Items</h2>
            <p className="text-gray-600">
              What concrete steps will you take based on today's discussion?
            </p>
            <Textarea
              placeholder="List your action items..."
              value={actionItems}
              onChange={e => setActionItems(e.target.value)}
              rows={6}
            />
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Complete Check-in
              </Button>
            </div>
          </div>
        )

      case 5: // Complete
        return (
          <div className="space-y-4 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Check-in Complete!</h2>
            <p className="text-gray-600">
              Great job taking time to connect with your partner today.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">Your streak continues!</p>
              <p className="text-2xl font-bold text-primary mt-2">🔥 3 days</p>
            </div>
            <Button onClick={() => navigate('/dashboard')} size="lg" className="mt-6">
              Return to Dashboard
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="mb-4" />
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  )
}