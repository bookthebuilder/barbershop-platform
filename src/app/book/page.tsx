'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar as CalendarComponent,
} from '@/components/ui/calendar'
import { 
  Calendar,
  Clock,
  User,
  Star,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Users,
  ArrowLeft,
  Shield,
  DollarSign,
  UserCheck,
  Zap
} from 'lucide-react'
// Utility functions to replace date-fns
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatDateShort = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const startOfDay = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}
import { toast } from 'sonner'

// Types
interface Service {
  id: number
  name: string
  description: string
  category: string
  duration: number
  price: number
  depositRequired: boolean
  depositAmount?: number
  isPopular: boolean
  requiresConsultation: boolean
  skillLevel: string
  providerId?: number[] // Which providers offer this service
}

interface Provider {
  id: number
  name: string
  title: string
  bio: string
  rating: number
  reviewCount: number
  specialties: string[]
  yearsExperience: number
  isAvailable: boolean
  serviceIds: number[] // Which services this provider offers
}

interface TimeSlot {
  time: string
  available: boolean
  providerId: number
}

interface BookingForm {
  serviceId: number | null
  providerId: number | null
  date: Date | null
  time: string
  customerName: string
  customerEmail: string
  customerPhone: string
  notes: string
}

type BookingFlow = 'service-first' | 'provider-first'

// Enhanced mock data with provider-service relationships
const mockServices: Service[] = [
  {
    id: 1,
    name: 'Classic Haircut',
    description: 'Traditional haircut with scissors and clipper work. Includes wash and basic styling.',
    category: 'Hair Services',
    duration: 30,
    price: 40,
    depositRequired: false,
    isPopular: true,
    requiresConsultation: false,
    skillLevel: 'basic',
    providerId: [1, 2] // Both providers offer this
  },
  {
    id: 2,
    name: 'Precision Fade',
    description: 'Professional fade cut with precise blending. Multiple fade styles available.',
    category: 'Hair Services',
    duration: 45,
    price: 55,
    depositRequired: true,
    depositAmount: 20,
    isPopular: true,
    requiresConsultation: false,
    skillLevel: 'intermediate',
    providerId: [1, 2]
  },
  {
    id: 3,
    name: 'Beard Trim',
    description: 'Professional beard trimming and shaping with hot towel treatment.',
    category: 'Beard Services',
    duration: 20,
    price: 25,
    depositRequired: false,
    isPopular: false,
    requiresConsultation: false,
    skillLevel: 'basic',
    providerId: [1, 2]
  },
  {
    id: 4,
    name: 'The Full Service',
    description: 'Complete grooming experience: haircut, beard trim, hot towel, and styling.',
    category: 'Combo Services',
    duration: 75,
    price: 95,
    depositRequired: true,
    depositAmount: 30,
    isPopular: true,
    requiresConsultation: true,
    skillLevel: 'advanced',
    providerId: [1, 2]
  },
  {
    id: 5,
    name: 'Hair Color & Cut',
    description: 'Professional hair coloring service with precision cut. Consultation included.',
    category: 'Hair Services',
    duration: 120,
    price: 150,
    depositRequired: true,
    depositAmount: 50,
    isPopular: false,
    requiresConsultation: true,
    skillLevel: 'advanced',
    providerId: [2] // Only Jordan offers color services
  },
  {
    id: 6,
    name: 'Classic Straight Razor Shave',
    description: 'Traditional straight razor shave with hot towel and aftercare.',
    category: 'Beard Services',
    duration: 45,
    price: 60,
    depositRequired: false,
    isPopular: false,
    requiresConsultation: false,
    skillLevel: 'advanced',
    providerId: [1] // Only Alex offers straight razor
  }
]

const mockProviders: Provider[] = [
  {
    id: 1,
    name: 'Alex Rodriguez',
    title: 'Master Barber',
    bio: 'Specializing in classic cuts, modern fades, and traditional straight razor shaves with 8 years of experience.',
    rating: 4.9,
    reviewCount: 127,
    specialties: ['Fades', 'Classic Cuts', 'Beard Styling', 'Straight Razor'],
    yearsExperience: 8,
    isAvailable: true,
    serviceIds: [1, 2, 3, 4, 6] // All except color
  },
  {
    id: 2,
    name: 'Jordan Smith',
    title: 'Senior Stylist',
    bio: 'Expert in contemporary styles, precision cutting techniques, and professional hair coloring.',
    rating: 4.8,
    reviewCount: 89,
    specialties: ['Modern Styles', 'Precision Cuts', 'Color', 'Creative Styling'],
    yearsExperience: 6,
    isAvailable: true,
    serviceIds: [1, 2, 3, 4, 5] // All except straight razor
  }
]

// Generate mock time slots
const generateTimeSlots = (date: Date, providerId: number): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const startHour = 9
  const endHour = 18
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const available = Math.random() > 0.3
      slots.push({ time, available, providerId })
    }
  }
  
  return slots
}

export default function EnhancedBookingPage() {
  const [bookingFlow, setBookingFlow] = useState<BookingFlow | null>(null)
  const [currentStep, setCurrentStep] = useState(0) // 0 = flow selection
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    serviceId: null,
    providerId: null,
    date: null,
    time: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: ''
  })
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const selectedService = mockServices.find(s => s.id === bookingForm.serviceId)
  const selectedProvider = mockProviders.find(p => p.id === bookingForm.providerId)
  
  // Filter services based on selected provider (for provider-first flow)
  const availableServices = useMemo(() => {
    if (bookingFlow === 'provider-first' && bookingForm.providerId) {
      return mockServices.filter(service => 
        service.providerId?.includes(bookingForm.providerId!)
      )
    }
    return mockServices
  }, [bookingFlow, bookingForm.providerId])

  // Filter providers based on selected service (for service-first flow)
  const availableProviders = useMemo(() => {
    if (bookingFlow === 'service-first' && bookingForm.serviceId) {
      return mockProviders.filter(provider => 
        provider.serviceIds.includes(bookingForm.serviceId!)
      )
    }
    return mockProviders
  }, [bookingFlow, bookingForm.serviceId])
  
  const availableSlots = useMemo(() => {
    if (!bookingForm.date || !bookingForm.providerId) return []
    return generateTimeSlots(bookingForm.date, bookingForm.providerId)
      .filter(slot => slot.available)
  }, [bookingForm.date, bookingForm.providerId])

  const serviceCategories = useMemo(() => {
    const categories = availableServices.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    }, {} as Record<string, Service[]>)
    return categories
  }, [availableServices])

  const getMaxStep = () => {
    return bookingFlow ? 4 : 0
  }

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 1:
        return bookingFlow !== null
      case 2:
        if (bookingFlow === 'service-first') {
          return bookingForm.serviceId !== null
        } else {
          return bookingForm.providerId !== null
        }
      case 3:
        return bookingForm.serviceId !== null && bookingForm.providerId !== null
      case 4:
        return bookingForm.serviceId !== null && bookingForm.providerId !== null && bookingForm.date !== null && bookingForm.time !== ''
      default:
        return true
    }
  }

  const handleFlowSelection = (flow: BookingFlow) => {
    setBookingFlow(flow)
    setCurrentStep(1)
    // Reset form when changing flows
    setBookingForm({
      serviceId: null,
      providerId: null,
      date: null,
      time: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: ''
    })
  }

  const handleServiceSelect = (serviceId: number) => {
    setBookingForm(prev => ({ ...prev, serviceId }))
  }

  const handleProviderSelect = (providerId: number) => {
    setBookingForm(prev => ({ ...prev, providerId }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBookingForm(prev => ({ ...prev, date }))
    }
  }

  const handleTimeSelect = (time: string) => {
    setBookingForm(prev => ({ ...prev, time }))
  }

  const handleBookingSubmit = () => {
    if (!bookingForm.customerName || !bookingForm.customerEmail) {
      toast.error('Please fill in your name and email')
      return
    }

    setIsConfirmationOpen(true)
    toast.success('Booking request submitted successfully!')
  }

  const resetBooking = () => {
    setBookingForm({
      serviceId: null,
      providerId: null,
      date: null,
      time: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: ''
    })
    setCurrentStep(0)
    setBookingFlow(null)
    setIsConfirmationOpen(false)
  }

  const getStepTitle = () => {
    if (currentStep === 0) return 'Choose Your Booking Style'
    
    if (bookingFlow === 'service-first') {
      const steps = ['', 'Choose Your Service', 'Choose Your Provider', 'Pick Date & Time', 'Your Details']
      return steps[currentStep]
    } else {
      const steps = ['', 'Choose Your Provider', 'Choose Your Service', 'Pick Date & Time', 'Your Details']
      return steps[currentStep]
    }
  }

  const getProgressSteps = () => {
    if (bookingFlow === 'service-first') {
      return [
        { step: 1, title: 'Service', icon: Scissors },
        { step: 2, title: 'Provider', icon: User },
        { step: 3, title: 'Date & Time', icon: Calendar },
        { step: 4, title: 'Details', icon: Check }
      ]
    } else {
      return [
        { step: 1, title: 'Provider', icon: User },
        { step: 2, title: 'Service', icon: Scissors },
        { step: 3, title: 'Date & Time', icon: Calendar },
        { step: 4, title: 'Details', icon: Check }
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Scissors className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Book Your Appointment</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Downtown Barbershop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps - Only show after flow selection */}
      {bookingFlow && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {getProgressSteps().map(({ step, title, icon: Icon }, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {title}
                  </span>
                  {index < 3 && (
                    <ChevronRight className="h-5 w-5 text-gray-400 mx-4" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 px-2">
              <Badge variant="outline" className="text-xs">
                {bookingFlow === 'service-first' ? 'Service First' : 'Provider First'} Flow
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Step 0: Flow Selection */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How would you like to book?</h2>
              <p className="text-lg text-gray-600">Choose your preferred booking style</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Service First Option */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-300 group"
                onClick={() => handleFlowSelection('service-first')}
              >
                <CardContent className="pt-8 pb-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                      <Scissors className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">I know what service I want</h3>
                      <p className="text-gray-600 text-sm">
                        Perfect for when you know exactly what you need. Choose your service first, then select from available providers.
                      </p>
                    </div>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <Scissors className="h-3 w-3" />
                        <ChevronRight className="h-3 w-3" />
                        <User className="h-3 w-3" />
                        <ChevronRight className="h-3 w-3" />
                        <Calendar className="h-3 w-3" />
                      </div>
                      <p>Service → Provider → Date & Time</p>
                    </div>
                    <Button className="w-full mt-4 group-hover:bg-blue-700">
                      <Zap className="mr-2 h-4 w-4" />
                      Start with Service
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Provider First Option */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover:border-green-300 group"
                onClick={() => handleFlowSelection('provider-first')}
              >
                <CardContent className="pt-8 pb-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                      <User className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">I have a preferred barber</h3>
                      <p className="text-gray-600 text-sm">
                        Great choice for returning customers. Select your preferred provider first, then choose from their available services.
                      </p>
                    </div>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <User className="h-3 w-3" />
                        <ChevronRight className="h-3 w-3" />
                        <Scissors className="h-3 w-3" />
                        <ChevronRight className="h-3 w-3" />
                        <Calendar className="h-3 w-3" />
                      </div>
                      <p>Provider → Service → Date & Time</p>
                    </div>
                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Start with Provider
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Don't worry - you can always change your choice later
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Service or Provider Selection based on flow */}
        {currentStep === 1 && bookingFlow === 'service-first' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
                <p className="text-gray-600">Select the service you'd like to book</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(0)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Flow
              </Button>
            </div>

            {Object.entries(serviceCategories).map(([category, services]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scissors className="mr-2 h-5 w-5" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${
                          bookingForm.serviceId === service.id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleServiceSelect(service.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {service.name}
                              </h3>
                              {service.isPopular && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Star className="mr-1 h-3 w-3" />
                                  Popular
                                </Badge>
                              )}
                              {service.requiresConsultation && (
                                <Badge variant="outline">
                                  Consultation Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{service.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                {service.duration} min
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="mr-1 h-4 w-4" />
                                ${service.price}
                                {service.depositRequired && (
                                  <span className="ml-1">
                                    (${service.depositAmount} deposit)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Users className="mr-1 h-4 w-4" />
                                {service.providerId?.length} provider{(service.providerId?.length || 0) !== 1 ? 's' : ''} available
                              </div>
                            </div>
                          </div>
                          {bookingForm.serviceId === service.id && (
                            <div className="ml-4">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(0)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep(2)}
                className="min-w-32"
              >
                Next: Choose Provider
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 1 && bookingFlow === 'provider-first' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
                <p className="text-gray-600">Select your preferred barber or stylist</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(0)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Flow
              </Button>
            </div>

            <div className="grid gap-6">
              {mockProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all ${
                    bookingForm.providerId === provider.id
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                      : provider.isAvailable 
                        ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        : 'border-gray-200 opacity-60'
                  } ${!provider.isAvailable ? 'cursor-not-allowed' : ''}`}
                  onClick={() => provider.isAvailable && handleProviderSelect(provider.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                            <p className="text-green-600 font-medium">{provider.title}</p>
                          </div>
                          {bookingForm.providerId === provider.id && (
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{provider.bio}</p>
                        
                        <div className="flex items-center space-x-6 text-sm mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{provider.rating}</span>
                            <span className="text-gray-500">({provider.reviewCount} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{provider.yearsExperience} years experience</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Scissors className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{provider.serviceIds.length} services offered</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {provider.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        {!provider.isAvailable && (
                          <div className="mt-3">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Currently Unavailable
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(0)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep(2)}
                className="min-w-32"
              >
                Next: Choose Service
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: The opposite selection based on flow */}
        {currentStep === 2 && bookingFlow === 'service-first' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Provider</h2>
                <p className="text-gray-600">Select from providers who offer this service</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            {selectedService && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <Scissors className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Selected Service:</p>
                      <p className="text-blue-800">{selectedService.name} - ${selectedService.price} ({selectedService.duration} min)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {availableProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all ${
                    bookingForm.providerId === provider.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : provider.isAvailable 
                        ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        : 'border-gray-200 opacity-60'
                  } ${!provider.isAvailable ? 'cursor-not-allowed' : ''}`}
                  onClick={() => provider.isAvailable && handleProviderSelect(provider.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                            <p className="text-blue-600 font-medium">{provider.title}</p>
                          </div>
                          {bookingForm.providerId === provider.id && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{provider.bio}</p>
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{provider.rating}</span>
                            <span className="text-gray-500">({provider.reviewCount} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{provider.yearsExperience} years experience</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {provider.specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {!provider.isAvailable && (
                          <div className="mt-3">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Currently Unavailable
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToStep(3)}
                className="min-w-32"
              >
                Next: Pick Date & Time
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && bookingFlow === 'provider-first' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Service</h2>
                <p className="text-gray-600">Select from services offered by {selectedProvider?.name}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            {selectedProvider && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Selected Provider:</p>
                      <p className="text-green-800">{selectedProvider.name} - {selectedProvider.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {Object.entries(serviceCategories).map(([category, services]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scissors className="mr-2 h-5 w-5" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${
                          bookingForm.serviceId === service.id
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleServiceSelect(service.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {service.name}
                              </h3>
                              {service.isPopular && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Star className="mr-1 h-3 w-3" />
                                  Popular
                                </Badge>
                              )}
                              {service.requiresConsultation && (
                                <Badge variant="outline">
                                  Consultation Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{service.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                {service.duration} min
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="mr-1 h-4 w-4" />
                                ${service.price}
                                {service.depositRequired && (
                                  <span className="ml-1">
                                    (${service.depositAmount} deposit)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {bookingForm.serviceId === service.id && (
                            <div className="ml-4">
                              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToStep(3)}
                className="min-w-32"
              >
                Next: Pick Date & Time
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Selection - Same for both flows */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pick Date & Time</h2>
                <p className="text-gray-600">Choose when you'd like your appointment</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            {selectedService && selectedProvider && (
              <Card className={bookingFlow === 'service-first' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Scissors className={`h-5 w-5 ${bookingFlow === 'service-first' ? 'text-blue-600' : 'text-green-600'}`} />
                      <div>
                        <p className={`font-medium ${bookingFlow === 'service-first' ? 'text-blue-900' : 'text-green-900'}`}>Service:</p>
                        <p className={`${bookingFlow === 'service-first' ? 'text-blue-800' : 'text-green-800'}`}>{selectedService.name} - ${selectedService.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className={`h-5 w-5 ${bookingFlow === 'service-first' ? 'text-blue-600' : 'text-green-600'}`} />
                      <div>
                        <p className={`font-medium ${bookingFlow === 'service-first' ? 'text-blue-900' : 'text-green-900'}`}>Provider:</p>
                        <p className={`${bookingFlow === 'service-first' ? 'text-blue-800' : 'text-green-800'}`}>{selectedProvider.name}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>Choose an available date</CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={bookingForm.date || undefined}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < startOfDay(new Date())}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Times</CardTitle>
                  <CardDescription>
                    {bookingForm.date 
                      ? `Available slots for ${formatDateShort(bookingForm.date)}`
                      : 'Select a date to see available times'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingForm.date ? (
                    availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={bookingForm.time === slot.time ? "default" : "outline"}
                            className="h-12"
                            onClick={() => handleTimeSelect(slot.time)}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No available times</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Please select a different date
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Select a date first</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose a date to see available appointment times
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(4)}
                disabled={!canProceedToStep(4)}
                className="min-w-32"
              >
                Next: Your Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Customer Details - Same for both flows */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Details</h2>
                <p className="text-gray-600">Complete your booking information</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Booking Summary */}
            <Card className={bookingFlow === 'service-first' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}>
              <CardHeader>
                <CardTitle className={bookingFlow === 'service-first' ? 'text-blue-900' : 'text-green-900'}>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Scissors className={`h-4 w-4 ${bookingFlow === 'service-first' ? 'text-blue-600' : 'text-green-600'}`} />
                      <span className="font-medium">Service:</span>
                      <span>{selectedService?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className={`h-4 w-4 ${bookingFlow === 'service-first' ? 'text-blue-600' : 'text-green-600'}`} />
                      <span className="font-medium">Provider:</span>
                      <span>{selectedProvider?.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className={`h-4 w-4 ${bookingFlow === 'service-first' ? 'text-blue-600' : 'text-green-600'}`} />
                      <span className="font-medium">Date:</span>
                      <span>{bookingForm.date && formatDateShort(bookingForm.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className={`h-4 w-4 ${bookingFlow === 'service-first' ? 'text-blue-600' : 'text-green-600'}`} />
                      <span className="font-medium">Time:</span>
                      <span>{bookingForm.time}</span>
                    </div>
                  </div>
                </div>
                <div className={`mt-4 pt-4 border-t ${bookingFlow === 'service-first' ? 'border-blue-200' : 'border-green-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${bookingFlow === 'service-first' ? 'text-blue-900' : 'text-green-900'}`}>Total Price:</span>
                    <span className={`text-xl font-bold ${bookingFlow === 'service-first' ? 'text-blue-900' : 'text-green-900'}`}>${selectedService?.price}</span>
                  </div>
                  {selectedService?.depositRequired && (
                    <div className={`flex items-center justify-between text-sm ${bookingFlow === 'service-first' ? 'text-blue-700' : 'text-green-700'}`}>
                      <span>Deposit Required:</span>
                      <span>${selectedService.depositAmount}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information Form */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>We'll use this to confirm your appointment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={bookingForm.customerName}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingForm.customerPhone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingForm.customerEmail}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Requests or Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requests, preferences, or notes for your barber..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Booking Policies</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 mt-0.5 text-green-500" />
                      <p>Cancellations must be made at least 24 hours in advance for a full refund</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                      <p>Please arrive 5 minutes early for your appointment</p>
                    </div>
                    {selectedService?.depositRequired && (
                      <div className="flex items-start space-x-2">
                        <CreditCard className="h-4 w-4 mt-0.5 text-purple-500" />
                        <p>A ${selectedService.depositAmount} deposit is required to secure your booking</p>
                      </div>
                    )}
                    {selectedService?.requiresConsultation && (
                      <div className="flex items-start space-x-2">
                        <Users className="h-4 w-4 mt-0.5 text-orange-500" />
                        <p>This service includes a consultation to discuss your preferences</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleBookingSubmit}
                disabled={!bookingForm.customerName || !bookingForm.customerEmail}
                className="min-w-32"
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog - Same as original */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <Check className="mr-2 h-6 w-6" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your appointment has been successfully booked. You'll receive a confirmation email shortly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Scissors className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Service</p>
                        <p className="font-medium">{selectedService?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Provider</p>
                        <p className="font-medium">{selectedProvider?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">
                          {bookingForm.date && formatDate(bookingForm.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium">{bookingForm.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Price:</span>
                    <span className="text-xl font-bold">${selectedService?.price}</span>
                  </div>
                  {selectedService?.depositRequired && (
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                      <span>Deposit Required:</span>
                      <span>${selectedService.depositAmount}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{bookingForm.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{bookingForm.customerEmail}</p>
                    </div>
                  </div>
                  {bookingForm.customerPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{bookingForm.customerPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
                {bookingForm.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium">{bookingForm.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-medium text-blue-900 mb-3">What's Next?</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <Mail className="h-4 w-4 mt-0.5" />
                    <p>You'll receive a confirmation email with all the details</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Phone className="h-4 w-4 mt-0.5" />
                    <p>We'll send you a reminder 24 hours before your appointment</p>
                  </div>
                  {selectedService?.depositRequired && (
                    <div className="flex items-start space-x-2">
                      <CreditCard className="h-4 w-4 mt-0.5" />
                      <p>Please bring payment for the ${selectedService.depositAmount} deposit</p>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <p>Our location: 123 Main Street, Downtown - Please arrive 5 minutes early</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={resetBooking}>
                Book Another Appointment
              </Button>
              <Button variant="outline">
                Add to Calendar
              </Button>
            </div>
            <Button onClick={() => setIsConfirmationOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
