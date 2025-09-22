import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@hooks/redux'
import { fetchCouple } from '@store/slices/coupleSlice'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import {
  Heart,
  Calendar,
  MessageCircle,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
} from 'lucide-react'

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { couple } = useAppSelector(state => state.couple)

  useEffect(() => {
    if (user?.couple_id) {
      void dispatch(fetchCouple(user.couple_id))
    }
  }, [dispatch, user])

  const stats = couple?.statistics ?? {
    total_check_ins: 0,
    current_streak: 0,
    longest_streak: 0,
    total_notes: 0,
    completed_action_items: 0,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name ?? 'Partner'}!
        </h1>
        <p className="text-gray-600">
          {couple ? `You and ${couple.partner1.id === user?.id ? couple.partner2.name : couple.partner1.name}` : 'Your relationship dashboard'}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.current_streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_check_ins}</div>
            <p className="text-xs text-muted-foreground">Since you joined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Notes</CardTitle>
            <MessageCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_notes}</div>
            <p className="text-xs text-muted-foreground">Thoughts exchanged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed_action_items}</div>
            <p className="text-xs text-muted-foreground">Completed together</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start a new activity with your partner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/checkin" className="block">
              <Button className="w-full justify-start" size="lg">
                <Heart className="mr-2 h-5 w-5" />
                Start Check-in
              </Button>
            </Link>
            <Link to="/notes/new" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Write a Note
              </Button>
            </Link>
            <Link to="/action-items" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Target className="mr-2 h-5 w-5" />
                View Action Items
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest relationship moments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Check-in completed</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Note shared</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Milestone reached</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {couple && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Partner Status</CardTitle>
            <CardDescription>Connection status with your partner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {couple.partner1.id === user?.id ? couple.partner2.name : couple.partner1.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {couple.partner1.id === user?.id
                      ? couple.partner2.presence_status ?? 'offline'
                      : couple.partner1.presence_status ?? 'offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Last seen 2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}