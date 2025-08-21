'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Scissors,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface Booking {
  id: string
  startTime: string
  endTime: string
  bookingDate: string
  status: string
  totalAmount: number
  paymentStatus: string
  notes?: string
  service: {
    name: string
    duration: number
  }
  customer: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

interface Stats {
  todayBookings: number
  todayRevenue: number
  weekBookings: number
  monthRevenue: number
  upcomingBookings: number
}

export default function ProviderDashboard() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    todayRevenue: 0,
    weekBookings: 0,
    monthRevenue: 0,
    upcomingBookings: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchBookings = async (date?: Date) => {
    try {
      const targetDate = date || selectedDate
      const dateStr = targetDate.toISOString().split('T')[0]
      
      const response = await fetch(`/api/bookings?providerId=${session?.user?.providerId}&date=${dateStr}`)
      const data = await response.json()
      
      if (data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/provider-stats?providerId=${session?.user?.providerId}`)
      const data = await response.json()
      
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Booking ${status.toLowerCase()}`)
        fetchBookings()
        fetchStats()
      } else {
        toast.error('Failed to update booking')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking')
    }
  }

  useEffect(() => {
    if (session?.user?.providerId) {
      fetchBookings()
      fetchStats()
      setLoading(false)

      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        fetchBookings()
        fetchStats()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [session, selectedDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate)
    const today = new Date()
    return bookingDate.toDateString() === today.toDateString()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'CHECKED_IN': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'DEPOSIT_PAID': return 'bg-yellow-100 text-yellow-800'
      case 'PENDING': return 'bg-orange-100 text-orange-800'
      case 'REFUNDED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Scissors className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Provider Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {session?.user?.name}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                fetchBookings()
                fetchStats()
                toast.success('Data refreshed')
              }}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayBookings}</div>
              <p className="text-xs text-muted-foreground">
                {todayBookings.length} scheduled today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.todayRevenue}</div>
              <p className="text-xs text-muted-foreground">
                Expected earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weekBookings}</div>
              <p className="text-xs text-muted-foreground">
                Total bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Month Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthRevenue}</div>
              <p className="text-xs text-muted-foreground">
                This month's total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">
                Future bookings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Date Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>View Schedule</CardTitle>
            <CardDescription>Select a date to view your bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value)
                  setSelectedDate(newDate)
                  fetchBookings(newDate)
                }}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const today = new Date()
                  setSelectedDate(today)
                  fetchBookings(today)
                }}
              >
                Today
              </Button>
              <Badge variant="outline">
                {bookings.length} appointment{bookings.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Appointments for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
            <CardDescription>
              Manage your upcoming appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You have no bookings for this date.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <Avatar>
                            <AvatarFallback>
                              {booking.customer.firstName[0]}{booking.customer.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {booking.customer.firstName} {booking.customer.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{booking.service.name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>${booking.totalAmount}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{booking.customer.phone || 'No phone'}</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center space-x-3 mt-4">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                            {booking.paymentStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'CHECKED_IN')}
                              className="flex items-center space-x-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Check In</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                              className="flex items-center space-x-1"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Cancel</span>
                            </Button>
                          </>
                        )}

                        {booking.status === 'CHECKED_IN' && (
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Complete</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center space-x-1"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Contact</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
