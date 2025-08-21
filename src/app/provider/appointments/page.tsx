// === FILE: src/app/provider/appointments/page.tsx ===
'use client'

import { useState, useMemo } from 'react'
import { ProviderLayout } from '@/components/provider/provider-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Clock, 
  Calendar, 
  User,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MessageSquare,
  MapPin,
  Star,
  MoreHorizontal,
  Save
} from 'lucide-react'
import { toast } from 'sonner'

// Types
interface Appointment {
  id: number
  clientId: number
  clientName: string
  clientPhone: string
  clientEmail: string
  service: string
  serviceId: number
  date: string
  time: string
  duration: number
  price: number
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  depositAmount?: number
  notes?: string
  isFirstTime: boolean
  source: 'online' | 'phone' | 'walk-in' | 'booksy'
  createdAt: string
  lastModified: string
}

// Mock data - replace with database calls
const mockAppointments: Appointment[] = [
  {
    id: 1,
    clientId: 101,
    clientName: 'John Smith',
    clientPhone: '(555) 123-4567',
    clientEmail: 'john@example.com',
    service: 'Haircut & Beard Trim',
    serviceId: 1,
    date: '2024-08-21',
    time: '09:00',
    duration: 45,
    price: 65,
    status: 'confirmed',
    paymentStatus: 'paid',
    depositAmount: 20,
    notes: 'Prefers shorter on the sides, regular client',
    isFirstTime: false,
    source: 'online',
    createdAt: '2024-08-19T10:30:00Z',
    lastModified: '2024-08-20T14:15:00Z'
  },
  {
    id: 2,
    clientId: 102,
    clientName: 'Mike Johnson',
    clientPhone: '(555) 987-6543',
    clientEmail: 'mike.j@example.com',
    service: 'Haircut',
    serviceId: 2,
    date: '2024-08-21',
    time: '10:30',
    duration: 30,
    price: 40,
    status: 'pending',
    paymentStatus: 'pending',
    notes: '',
    isFirstTime: true,
    source: 'phone',
    createdAt: '2024-08-20T16:45:00Z',
    lastModified: '2024-08-20T16:45:00Z'
  },
  {
    id: 3,
    clientId: 103,
    clientName: 'David Wilson',
    clientPhone: '(555) 456-7890',
    clientEmail: 'david.w@example.com',
    service: 'Full Service',
    serviceId: 3,
    date: '2024-08-21',
    time: '14:00',
    duration: 60,
    price: 85,
    status: 'confirmed',
    paymentStatus: 'paid',
    depositAmount: 25,
    notes: 'Likes to chat about sports',
    isFirstTime: false,
    source: 'booksy',
    createdAt: '2024-08-18T09:20:00Z',
    lastModified: '2024-08-19T11:30:00Z'
  },
  {
    id: 4,
    clientId: 104,
    clientName: 'Robert Brown',
    clientPhone: '(555) 321-9876',
    clientEmail: 'rob.brown@example.com',
    service: 'Beard Trim',
    serviceId: 4,
    date: '2024-08-22',
    time: '11:00',
    duration: 20,
    price: 25,
    status: 'completed',
    paymentStatus: 'paid',
    notes: 'Quick trim, very satisfied',
    isFirstTime: false,
    source: 'walk-in',
    createdAt: '2024-08-22T10:45:00Z',
    lastModified: '2024-08-22T11:25:00Z'
  },
  {
    id: 5,
    clientId: 105,
    clientName: 'Alex Turner',
    clientPhone: '(555) 654-3210',
    clientEmail: 'alex.turner@example.com',
    service: 'Haircut & Styling',
    serviceId: 5,
    date: '2024-08-20',
    time: '15:30',
    duration: 50,
    price: 70,
    status: 'no-show',
    paymentStatus: 'refunded',
    depositAmount: 20,
    notes: 'Did not show up, attempted to call',
    isFirstTime: true,
    source: 'online',
    createdAt: '2024-08-18T12:00:00Z',
    lastModified: '2024-08-20T16:00:00Z'
  }
]

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  'in-progress': { color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
  'no-show': { color: 'bg-gray-100 text-gray-800', icon: XCircle }
}

const paymentStatusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800' },
  paid: { color: 'bg-green-100 text-green-800' },
  refunded: { color: 'bg-red-100 text-red-800' }
}

export default function AppointmentManagementPage() {
  const [appointments, setAppointments] = useState(mockAppointments)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('today')

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Appointment>>({})

  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  })

  // Filter appointments based on tab, search, and filters
  const filteredAppointments = useMemo(() => {
    let filtered = appointments

    // Tab filtering
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    
    switch (activeTab) {
      case 'today':
        filtered = filtered.filter(apt => apt.date === today)
        break
      case 'tomorrow':
        filtered = filtered.filter(apt => apt.date === tomorrow)
        break
      case 'week':
        const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
        filtered = filtered.filter(apt => apt.date >= today && apt.date <= weekFromNow)
        break
      case 'pending':
        filtered = filtered.filter(apt => apt.status === 'pending')
        break
      // 'all' shows everything
    }

    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clientPhone.includes(searchTerm) ||
        apt.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filtering
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Date filtering
    if (dateFilter !== 'all') {
      filtered = filtered.filter(apt => apt.date === dateFilter)
    }

    return filtered.sort((a, b) => {
      // Sort by date then time
      if (a.date === b.date) {
        return a.time.localeCompare(b.time)
      }
      return a.date.localeCompare(b.date)
    })
  }, [appointments, activeTab, searchTerm, statusFilter, dateFilter])

  const updateAppointmentStatus = (id: number, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id 
        ? { ...apt, status: newStatus, lastModified: new Date().toISOString() }
        : apt
    ))
    toast.success(`Appointment ${newStatus}`)
  }

  const handleEditAppointment = () => {
    if (!selectedAppointment || !editForm) return

    setAppointments(prev => prev.map(apt => 
      apt.id === selectedAppointment.id 
        ? { ...apt, ...editForm, lastModified: new Date().toISOString() }
        : apt
    ))
    setIsEditDialogOpen(false)
    setSelectedAppointment(null)
    setEditForm({})
    toast.success('Appointment updated successfully')
  }

  const deleteAppointment = (id: number) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id))
    toast.success('Appointment deleted')
  }

  const handleAddAppointment = () => {
    if (!newAppointment.clientName || !newAppointment.date || !newAppointment.time) {
      toast.error('Please fill in all required fields')
      return
    }

    const appointment: Appointment = {
      id: Date.now(),
      clientId: Date.now(),
      ...newAppointment,
      serviceId: 1,
      duration: 30,
      price: 40,
      status: 'pending',
      paymentStatus: 'pending',
      isFirstTime: true,
      source: 'phone',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    setAppointments(prev => [...prev, appointment])
    setNewAppointment({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      service: '',
      date: '',
      time: '',
      notes: ''
    })
    setIsAddDialogOpen(false)
    toast.success('Appointment added successfully')
  }

  const getTabCounts = () => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    return {
      today: appointments.filter(apt => apt.date === today).length,
      tomorrow: appointments.filter(apt => apt.date === tomorrow).length,
      week: appointments.filter(apt => apt.date >= today && apt.date <= weekFromNow).length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      all: appointments.length
    }
  }

  const tabCounts = getTabCounts()

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Appointment Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all your appointments
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Appointment</DialogTitle>
                <DialogDescription>
                  Create a new appointment for a client
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client-name" className="text-right">Name *</Label>
                  <Input
                    id="client-name"
                    value={newAppointment.clientName}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                    className="col-span-3"
                    placeholder="Client name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client-phone" className="text-right">Phone</Label>
                  <Input
                    id="client-phone"
                    value={newAppointment.clientPhone}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="col-span-3"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client-email" className="text-right">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={newAppointment.clientEmail}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="col-span-3"
                    placeholder="client@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service" className="text-right">Service</Label>
                  <Select onValueChange={(value) => setNewAppointment(prev => ({ ...prev, service: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Haircut">Haircut - $40</SelectItem>
                      <SelectItem value="Haircut & Beard Trim">Haircut & Beard Trim - $65</SelectItem>
                      <SelectItem value="Beard Trim">Beard Trim - $25</SelectItem>
                      <SelectItem value="Full Service">Full Service - $85</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    className="col-span-3"
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAppointment}>Add Appointment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-40"
                />
                {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setDateFilter('all')
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="today" className="relative">
              Today
              {tabCounts.today > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {tabCounts.today}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tomorrow" className="relative">
              Tomorrow
              {tabCounts.tomorrow > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {tabCounts.tomorrow}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="week" className="relative">
              This Week
              {tabCounts.week > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {tabCounts.week}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {tabCounts.pending > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {tabCounts.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {activeTab === 'today' ? "You don't have any appointments today." :
                       activeTab === 'tomorrow' ? "You don't have any appointments tomorrow." :
                       activeTab === 'pending' ? "No pending appointments to review." :
                       "No appointments match your current filters."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => {
                  const StatusIcon = statusConfig[appointment.status].icon
                  return (
                    <Card key={appointment.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {appointment.clientName}
                              </h3>
                              {appointment.isFirstTime && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="mr-1 h-3 w-3" />
                                  First Time
                                </Badge>
                              )}
                              <Badge 
                                className={`${statusConfig[appointment.status].color} text-xs`}
                                variant="secondary"
                              >
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('-', ' ')}
                              </Badge>
                              <Badge 
                                className={`${paymentStatusConfig[appointment.paymentStatus].color} text-xs`}
                                variant="secondary"
                              >
                                <DollarSign className="mr-1 h-3 w-3" />
                                {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                {new Date(appointment.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                {appointment.time} ({appointment.duration} min)
                              </div>
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                {appointment.service}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4" />
                                ${appointment.price}
                                {appointment.depositAmount && (
                                  <span className="ml-1 text-xs">
                                    (${appointment.depositAmount} deposit)
                                  </span>
                                )}
                              </div>
                            </div>

                            {appointment.notes && (
                              <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                                <MessageSquare className="inline mr-1 h-3 w-3" />
                                {appointment.notes}
                              </div>
                            )}

                            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Source: {appointment.source}</span>
                              <span>•</span>
                              <span>Created: {new Date(appointment.createdAt).toLocaleDateString()}</span>
                              {appointment.lastModified !== appointment.createdAt && (
                                <>
                                  <span>•</span>
                                  <span>Modified: {new Date(appointment.lastModified).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {/* Quick Action Buttons */}
                            {appointment.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            
                            {appointment.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'in-progress')}
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                Start
                              </Button>
                            )}
                            
                            {appointment.status === 'in-progress' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                            )}

                            {/* View/Edit/Delete */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              View
                            </Button>
                            
                            <Select onValueChange={(action) => {
                              if (action === 'edit') {
                                setSelectedAppointment(appointment)
                                setEditForm(appointment)
                                setIsEditDialogOpen(true)
                              } else if (action === 'no-show') {
                                updateAppointmentStatus(appointment.id, 'no-show')
                              }
                            }}>
                              <SelectTrigger className="w-10 h-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="edit">Edit</SelectItem>
                                <SelectItem value="no-show">Mark No-Show</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* View Appointment Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Client Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="font-medium">{selectedAppointment.clientName}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{selectedAppointment.clientPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{selectedAppointment.clientEmail}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Appointment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{new Date(selectedAppointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{selectedAppointment.time} ({selectedAppointment.duration} minutes)</span>
                      </div>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{selectedAppointment.service}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                        <span>${selectedAppointment.price}</span>
                        {selectedAppointment.depositAmount && (
                          <span className="ml-2 text-xs text-gray-500">
                            (${selectedAppointment.depositAmount} deposit paid)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                    <div className="space-y-2">
                      <Badge className={statusConfig[selectedAppointment.status].color}>
                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1).replace('-', ' ')}
                      </Badge>
                      <Badge className={paymentStatusConfig[selectedAppointment.paymentStatus].color}>
                        Payment: {selectedAppointment.paymentStatus}
                      </Badge>
                      {selectedAppointment.isFirstTime && (
                        <Badge variant="outline">First Time Client</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Source & Timing</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Booked via: {selectedAppointment.source}</p>
                      <p>Created: {new Date(selectedAppointment.createdAt).toLocaleString()}</p>
                      <p>Last modified: {new Date(selectedAppointment.lastModified).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {selectedAppointment.notes}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false)
                setEditForm(selectedAppointment || {})
                setIsEditDialogOpen(true)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Appointment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>
                Update appointment details and status
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-client-name" className="text-right">Client Name</Label>
                <Input
                  id="edit-client-name"
                  value={editForm.clientName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, clientName: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.clientPhone || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.clientEmail || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-service" className="text-right">Service</Label>
                <Select 
                  value={editForm.service || ''} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, service: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Haircut">Haircut - $40</SelectItem>
                    <SelectItem value="Haircut & Beard Trim">Haircut & Beard Trim - $65</SelectItem>
                    <SelectItem value="Beard Trim">Beard Trim - $25</SelectItem>
                    <SelectItem value="Full Service">Full Service - $85</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.date || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-time" className="text-right">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editForm.time || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <Select 
                  value={editForm.status || ''} 
                  onValueChange={(value: Appointment['status']) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-payment-status" className="text-right">Payment</Label>
                <Select 
                  value={editForm.paymentStatus || ''} 
                  onValueChange={(value: Appointment['paymentStatus']) => setEditForm(prev => ({ ...prev, paymentStatus: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="col-span-3"
                  placeholder="Any special requests or notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      if (selectedAppointment) {
                        deleteAppointment(selectedAppointment.id)
                        setIsEditDialogOpen(false)
                        setSelectedAppointment(null)
                      }
                    }}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleEditAppointment}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProviderLayout>
  )
}
