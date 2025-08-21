import { ProviderLayout } from '@/components/provider/provider-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react'

// Mock data - will be replaced with real database queries
const mockStats = {
  todayAppointments: 8,
  weeklyRevenue: 1250,
  monthlyRevenue: 4800,
  averageRating: 4.8,
  totalClients: 156,
  thisWeekGrowth: 12
}

const mockUpcomingAppointments = [
  {
    id: 1,
    clientName: 'John Smith',
    service: 'Haircut & Beard Trim',
    time: '9:00 AM',
    duration: 45,
    price: 65,
    status: 'confirmed'
  },
  {
    id: 2,
    clientName: 'Mike Johnson',
    service: 'Haircut',
    time: '10:30 AM',
    duration: 30,
    price: 40,
    status: 'confirmed'
  },
  {
    id: 3,
    clientName: 'David Wilson',
    service: 'Full Service',
    time: '2:00 PM',
    duration: 60,
    price: 85,
    status: 'pending'
  }
]

const mockRecentReviews = [
  {
    id: 1,
    clientName: 'Sarah M.',
    rating: 5,
    comment: 'Amazing haircut! Exactly what I wanted.',
    date: '2 hours ago'
  },
  {
    id: 2,
    clientName: 'Tom R.',
    rating: 5,
    comment: 'Best barber in town. Always professional.',
    date: '1 day ago'
  }
]

export default function ProviderOverviewPage() {
  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Good morning, Alex! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your business today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-600">+2</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockStats.weeklyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-600">+{mockStats.thisWeekGrowth}%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Based on 47 reviews this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-600">+8</span> new this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule and Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>
                    {mockUpcomingAppointments.length} appointments scheduled
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUpcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{appointment.clientName}</p>
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status === 'confirmed' ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        )}
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.time} • {appointment.duration} min • ${appointment.price}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Recent Reviews
                  </CardTitle>
                  <CardDescription>
                    Latest feedback from your clients
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentReviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.clientName}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">"{review.comment}"</p>
                  <p className="mt-1 text-xs text-gray-500">{review.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Update Schedule</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span className="text-sm">Add Client</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">View Analytics</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Earnings Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  )
}
