import { Link } from 'react-router-dom'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Heart, Calendar, TrendingUp, MessageCircle } from 'lucide-react'

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Quality Control for Couples
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Strengthen your relationship with guided check-ins, meaningful conversations, and
            shared growth
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Regular Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build deeper connection through structured conversations
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Private & Shared Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Express thoughts privately or share with your partner
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Track Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Celebrate milestones and see your relationship flourish
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Turn conversations into meaningful actions</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/onboarding">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}