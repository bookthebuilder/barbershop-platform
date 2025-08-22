// prisma/seed.js
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.scheduleSlot.deleteMany()
  await prisma.providerSchedule.deleteMany()
  await prisma.service.deleteMany()
  await prisma.serviceCategory.deleteMany()
  await prisma.provider.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()

  // Create locations
  const location = await prisma.location.create({
    data: {
      name: 'Downtown Barbershop',
      address: '123 Main Street',
      city: 'Downtown',
      state: 'CA',
      zipCode: '90210',
      phone: '(555) 123-4567',
      email: 'info@downtownbarbershop.com',
      website: 'https://downtownbarbershop.com',
      isActive: true,
      hours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      },
      settings: {
        timezone: 'America/Los_Angeles',
        bookingLeadTime: 30,
        cancellationWindow: 24,
        defaultBufferTime: 15
      }
    }
  })

  // Create service categories
  const hairCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Hair Services',
      description: 'Professional haircuts and styling',
      isActive: true,
      sortOrder: 1
    }
  })

  const beardCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Beard Services', 
      description: 'Beard trimming and grooming',
      isActive: true,
      sortOrder: 2
    }
  })

  const comboCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Combo Services',
      description: 'Complete grooming packages',
      isActive: true,
      sortOrder: 3
    }
  })

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Classic Haircut',
        description: 'Traditional haircut with scissors and clipper work. Includes wash and basic styling.',
        duration: 30,
        price: 40.00,
        depositRequired: false,
        isActive: true,
        isPopular: true,
        requiresConsultation: false,
        skillLevel: 'BASIC',
        categoryId: hairCategory.id,
        locationId: location.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Precision Fade',
        description: 'Professional fade cut with precise blending. Multiple fade styles available.',
        duration: 45,
        price: 55.00,
        depositRequired: true,
        depositAmount: 20.00,
        isActive: true,
        isPopular: true,
        requiresConsultation: false,
        skillLevel: 'INTERMEDIATE',
        categoryId: hairCategory.id,
        locationId: location.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping with hot towel treatment.',
        duration: 20,
        price: 25.00,
        depositRequired: false,
        isActive: true,
        isPopular: false,
        requiresConsultation: false,
        skillLevel: 'BASIC',
        categoryId: beardCategory.id,
        locationId: location.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'The Full Service',
        description: 'Complete grooming experience: haircut, beard trim, hot towel, and styling.',
        duration: 75,
        price: 95.00,
        depositRequired: true,
        depositAmount: 30.00,
        isActive: true,
        isPopular: true,
        requiresConsultation: true,
        skillLevel: 'ADVANCED',
        categoryId: comboCategory.id,
        locationId: location.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Hair Color & Cut',
        description: 'Professional hair coloring service with precision cut. Consultation included.',
        duration: 120,
        price: 150.00,
        depositRequired: true,
        depositAmount: 50.00,
        isActive: true,
        isPopular: false,
        requiresConsultation: true,
        skillLevel: 'ADVANCED',
        categoryId: hairCategory.id,
        locationId: location.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Classic Straight Razor Shave',
        description: 'Traditional straight razor shave with hot towel and aftercare.',
        duration: 45,
        price: 60.00,
        depositRequired: false,
        isActive: true,
        isPopular: false,
        requiresConsultation: false,
        skillLevel: 'ADVANCED',
        categoryId: beardCategory.id,
        locationId: location.id
      }
    })
  ])

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@downtownbarbershop.com',
      phone: '(555) 123-4567',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
      password: await bcrypt.hash('admin123', 12),
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      }
    }
  })

  // Create provider users
  const alexUser = await prisma.user.create({
    data: {
      email: 'alex@downtownbarbershop.com',
      phone: '(555) 234-5678',
      firstName: 'Alex',
      lastName: 'Rodriguez',
      role: 'PROVIDER',
      isActive: true,
      emailVerified: new Date(),
      password: await bcrypt.hash('provider123', 12),
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      }
    }
  })

  const jordanUser = await prisma.user.create({
    data: {
      email: 'jordan@downtownbarbershop.com',
      phone: '(555) 345-6789',
      firstName: 'Jordan',
      lastName: 'Smith',
      role: 'PROVIDER',
      isActive: true,
      emailVerified: new Date(),
      password: await bcrypt.hash('provider123', 12),
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      }
    }
  })

  // Create providers
  const alexProvider = await prisma.provider.create({
    data: {
      userId: alexUser.id,
      locationId: location.id,
      title: 'Master Barber',
      bio: 'Specializing in classic cuts, modern fades, and traditional straight razor shaves with 8 years of experience.',
      specialties: ['Fades', 'Classic Cuts', 'Beard Styling', 'Straight Razor'],
      yearsExperience: 8,
      isActive: true,
      acceptsCash: true,
      commissionRate: 0.60,
      bookingSettings: {
        bufferTime: 15,
        allowOnlineBooking: true,
        requireDeposit: false,
        cancellationWindow: 24,
        maxAdvanceBooking: 30
      },
      services: {
        connect: [
          { id: services[0].id }, // Classic Haircut
          { id: services[1].id }, // Precision Fade  
          { id: services[2].id }, // Beard Trim
          { id: services[3].id }, // Full Service
          { id: services[5].id }  // Straight Razor
        ]
      }
    }
  })

  const jordanProvider = await prisma.provider.create({
    data: {
      userId: jordanUser.id,
      locationId: location.id,
      title: 'Senior Stylist',
      bio: 'Expert in contemporary styles, precision cutting techniques, and professional hair coloring.',
      specialties: ['Modern Styles', 'Precision Cuts', 'Color', 'Creative Styling'],
      yearsExperience: 6,
      isActive: true,
      acceptsCash: true,
      commissionRate: 0.55,
      bookingSettings: {
        bufferTime: 10,
        allowOnlineBooking: true,
        requireDeposit: true,
        cancellationWindow: 24,
        maxAdvanceBooking: 45
      },
      services: {
        connect: [
          { id: services[0].id }, // Classic Haircut
          { id: services[1].id }, // Precision Fade
          { id: services[2].id }, // Beard Trim
          { id: services[3].id }, // Full Service
          { id: services[4].id }  // Hair Color & Cut
        ]
      }
    }
  })

  // Create provider schedules (Monday-Saturday, 9 AM - 6 PM)
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  
  for (const provider of [alexProvider, jordanProvider]) {
    for (const dayOfWeek of daysOfWeek) {
      await prisma.providerSchedule.create({
        data: {
          providerId: provider.id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true,
          breakStart: '12:00',
          breakEnd: '13:00'
        }
      })
    }
  }

  // Create some sample customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'john.doe@email.com',
      phone: '(555) 456-7890',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: new Date(),
      password: await bcrypt.hash('customer123', 12),
      loyaltyPoints: 150,
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      }
    }
  })

  const customer2 = await prisma.user.create({
    data: {
      email: 'sarah.wilson@email.com',
      phone: '(555) 567-8901',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: new Date(),
      password: await bcrypt.hash('customer123', 12),
      loyaltyPoints: 75,
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: false
        }
      }
    }
  })

  // Create some sample bookings for today and upcoming days
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  await prisma.booking.create({
    data: {
      customerId: customer1.id,
      providerId: alexProvider.id,
      serviceId: services[1].id, // Precision Fade
      locationId: location.id,
      bookingDate: today,
      startTime: '10:00',
      endTime: '10:45',
      status: 'CONFIRMED',
      totalAmount: 55.00,
      depositAmount: 20.00,
      notes: 'Regular customer, prefers medium fade',
      bookingSource: 'NATIVE',
      paymentStatus: 'DEPOSIT_PAID'
    }
  })

  await prisma.booking.create({
    data: {
      customerId: customer2.id,
      providerId: jordanProvider.id,
      serviceId: services[0].id, // Classic Haircut
      locationId: location.id,
      bookingDate: tomorrow,
      startTime: '14:00',
      endTime: '14:30',
      status: 'CONFIRMED',
      totalAmount: 40.00,
      notes: 'First time customer',
      bookingSource: 'NATIVE',
      paymentStatus: 'PENDING'
    }
  })

  // Create some reviews
  await prisma.review.create({
    data: {
      customerId: customer1.id,
      providerId: alexProvider.id,
      serviceId: services[1].id,
      rating: 5,
      comment: 'Outstanding fade! Alex really knows what he\'s doing. Will definitely be back.',
      isPublic: true,
      isApproved: true
    }
  })

  await prisma.review.create({
    data: {
      customerId: customer2.id,
      providerId: jordanProvider.id,
      serviceId: services[0].id,
      rating: 5,
      comment: 'Jordan was fantastic! Great attention to detail and very professional.',
      isPublic: true,
      isApproved: true
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📊 Created:')
  console.log('- 1 Location')
  console.log('- 3 Service Categories')
  console.log('- 6 Services')
  console.log('- 4 Users (1 admin, 2 providers, 2 customers)')
  console.log('- 2 Providers with schedules')
  console.log('- 2 Sample bookings')
  console.log('- 2 Reviews')
  
  console.log('\n🔑 Login Credentials:')
  console.log('Admin: admin@downtownbarbershop.com / admin123')
  console.log('Alex (Provider): alex@downtownbarbershop.com / provider123')
  console.log('Jordan (Provider): jordan@downtownbarbershop.com / provider123')
  console.log('John (Customer): john.doe@email.com / customer123')
  console.log('Sarah (Customer): sarah.wilson@email.com / customer123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
