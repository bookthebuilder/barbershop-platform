// === FILE: src/app/api/bookings/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmation } from '@/lib/email'
import { z } from 'zod'

const createBookingSchema = z.object({
  serviceId: z.string(),
  providerId: z.string(),
  date: z.string(),
  time: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const data = createBookingSchema.parse(body)

    // Get or create customer
    let customer = await prisma.user.findUnique({
      where: { email: data.customerEmail }
    })

    if (!customer) {
      // Create new customer account
      customer = await prisma.user.create({
        data: {
          email: data.customerEmail,
          firstName: data.customerName.split(' ')[0],
          lastName: data.customerName.split(' ').slice(1).join(' ') || '',
          phone: data.customerPhone,
          role: 'CUSTOMER',
          isActive: true
        }
      })
    }

    // Get service and provider details
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId }
    })

    const provider = await prisma.provider.findUnique({
      where: { id: data.providerId },
      include: {
        user: true,
        location: true
      }
    })

    if (!service || !provider) {
      return NextResponse.json(
        { error: 'Service or provider not found' },
        { status: 404 }
      )
    }

    // Calculate end time
    const [startHour, startMinute] = data.time.split(':').map(Number)
    const startDate = new Date(data.date)
    startDate.setHours(startHour, startMinute, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + service.duration)
    
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

    // Check availability
    const existingBooking = await prisma.booking.findFirst({
      where: {
        providerId: data.providerId,
        bookingDate: new Date(data.date),
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        OR: [
          {
            AND: [
              { startTime: { lte: data.time } },
              { endTime: { gt: data.time } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Time slot not available' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: data.providerId,
        serviceId: data.serviceId,
        locationId: provider.locationId,
        bookingDate: new Date(data.date),
        startTime: data.time,
        endTime: endTime,
        status: 'CONFIRMED',
        totalAmount: service.price,
        depositAmount: service.depositRequired ? service.depositAmount : undefined,
        notes: data.notes,
        bookingSource: 'NATIVE',
        paymentStatus: service.depositRequired ? 'PENDING' : 'PAID'
      },
      include: {
        service: true,
        provider: {
          include: { user: true }
        },
        customer: true,
        location: true
      }
    })

    // Send confirmation email
    await sendBookingConfirmation(customer.email, {
      customerName: `${customer.firstName} ${customer.lastName}`,
      serviceName: service.name,
      providerName: `${provider.user.firstName} ${provider.user.lastName}`,
      date: new Date(data.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: data.time,
      price: service.price,
      location: `${provider.location.name} - ${provider.location.address}`
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        service: booking.service.name,
        provider: `${booking.provider.user.firstName} ${booking.provider.user.lastName}`,
        date: booking.bookingDate,
        time: booking.startTime,
        total: booking.totalAmount
      }
    })

  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const providerId = url.searchParams.get('providerId')
    const customerId = url.searchParams.get('customerId')
    const date = url.searchParams.get('date')

    let whereClause: any = {}

    if (providerId) {
      whereClause.providerId = providerId
    }

    if (customerId) {
      whereClause.customerId = customerId
    }

    if (date) {
      whereClause.bookingDate = new Date(date)
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        customer: true,
        provider: {
          include: { user: true }
        }
      },
      orderBy: [
        { bookingDate: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// === FILE: src/app/api/availability/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const providerId = url.searchParams.get('providerId')
    const date = url.searchParams.get('date')

    if (!providerId || !date) {
      return NextResponse.json(
        { error: 'Provider ID and date are required' },
        { status: 400 }
      )
    }

    const targetDate = new Date(date)
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()

    // Get provider schedule for the day
    const schedule = await prisma.providerSchedule.findFirst({
      where: {
        providerId,
        dayOfWeek: dayOfWeek as any,
        isActive: true
      }
    })

    if (!schedule) {
      return NextResponse.json({ availableSlots: [] })
    }

    // Get existing bookings for the day
    const bookings = await prisma.booking.findMany({
      where: {
        providerId,
        bookingDate: targetDate,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] }
      }
    })

    // Generate available time slots
    const availableSlots = []
    const startTime = schedule.startTime
    const endTime = schedule.endTime
    const breakStart = schedule.breakStart
    const breakEnd = schedule.breakEnd

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    let currentHour = startHour
    let currentMinute = startMinute

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      // Check if slot is during break time
      const isBreakTime = breakStart && breakEnd && timeSlot >= breakStart && timeSlot < breakEnd
      
      // Check if slot is already booked
      const isBooked = bookings.some(booking => {
        return timeSlot >= booking.startTime && timeSlot < booking.endTime
      })

      if (!isBreakTime && !isBooked) {
        availableSlots.push({
          time: timeSlot,
          available: true
        })
      }

      // Increment by 30 minutes
      currentMinute += 30
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour += 1
      }
    }

    return NextResponse.json({ availableSlots })

  } catch (error) {
    console.error('Get availability error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

// === FILE: src/app/api/services/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const providerId = url.searchParams.get('providerId')

    let whereClause: any = { isActive: true }

    if (providerId) {
      whereClause.providers = {
        some: { id: providerId }
      }
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        category: true,
        providers: {
          include: {
            user: true
          }
        }
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { price: 'asc' }
      ]
    })

    return NextResponse.json({ services })

  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// === FILE: src/app/api/providers/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const serviceId = url.searchParams.get('serviceId')

    let whereClause: any = { isActive: true }

    if (serviceId) {
      whereClause.services = {
        some: { id: serviceId }
      }
    }

    const providers = await prisma.provider.findMany({
      where: whereClause,
      include: {
        user: true,
        services: {
          include: {
            category: true
          }
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      }
    })

    // Calculate average ratings
    const providersWithRatings = providers.map(provider => {
      const ratings = provider.reviews.map(r => r.rating)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0

      return {
        id: provider.id,
        name: `${provider.user.firstName} ${provider.user.lastName}`,
        title: provider.title,
        bio: provider.bio,
        specialties: provider.specialties,
        yearsExperience: provider.yearsExperience,
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
        isAvailable: provider.isActive,
        services: provider.services
      }
    })

    return NextResponse.json({ providers: providersWithRatings })

  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}
