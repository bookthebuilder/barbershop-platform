// === FILE: src/lib/auth.ts ===
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            provider: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          return null
        }

        if (!user.isActive) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
          providerId: user.provider?.id
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.providerId = user.providerId
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.providerId = token.providerId
        session.user.emailVerified = token.emailVerified
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  secret: process.env.NEXTAUTH_SECRET
}

// === FILE: src/app/api/auth/[...nextauth]/route.ts ===
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// === FILE: src/app/api/auth/signup/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create verification token
    const verificationToken = crypto.randomUUID()

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'CUSTOMER',
        isActive: true,
        verificationToken
      }
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken, firstName)

    return NextResponse.json({
      message: 'User created successfully. Please check your email to verify your account.',
      userId: user.id
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// === FILE: src/app/api/auth/verify-email/route.ts ===
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null
      }
    })

    return NextResponse.json({
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// === FILE: src/lib/email.ts ===
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendVerificationEmail(email: string, token: string, firstName: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
  
  const htmlTemplate = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background-color: #f8fafc; padding: 40px 20px; text-align: center;">
        <h1 style="color: #1e40af; margin: 0;">Welcome to Downtown Barbershop!</h1>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="color: #374151;">Hi ${firstName},</h2>
        
        <p style="color: #6b7280; line-height: 1.6;">
          Thank you for signing up! Please verify your email address to complete your registration 
          and start booking appointments.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #1e40af; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #1e40af;">${verificationUrl}</a>
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 24 hours for security reasons.
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>Downtown Barbershop | 123 Main Street | (555) 123-4567</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"Downtown Barbershop" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Verify your email address',
    html: htmlTemplate
  })
}

export async function sendBookingConfirmation(
  email: string, 
  bookingDetails: {
    customerName: string
    serviceName: string
    providerName: string
    date: string
    time: string
    price: number
    location: string
  }
) {
  const htmlTemplate = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background-color: #10b981; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="color: #374151;">Hi ${bookingDetails.customerName},</h2>
        
        <p style="color: #6b7280; line-height: 1.6;">
          Your appointment has been confirmed. Here are the details:
        </p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Service:</td>
              <td style="padding: 8px 0; color: #374151;">${bookingDetails.serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Provider:</td>
              <td style="padding: 8px 0; color: #374151;">${bookingDetails.providerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0; color: #374151;">${bookingDetails.date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
              <td style="padding: 8px 0; color: #374151;">${bookingDetails.time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0; color: #374151;">${bookingDetails.location}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Total:</td>
              <td style="padding: 8px 0; color: #374151; font-weight: bold;">$${bookingDetails.price}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Please arrive 5 minutes early for your appointment. If you need to reschedule or cancel, 
          please do so at least 24 hours in advance.
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>Downtown Barbershop | 123 Main Street | (555) 123-4567</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"Downtown Barbershop" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Appointment Confirmed - Downtown Barbershop',
    html: htmlTemplate
  })
}

// === FILE: src/types/next-auth.d.ts ===
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      providerId?: string
      emailVerified?: Date
    } & DefaultSession['user']
  }

  interface User {
    role: string
    providerId?: string
    emailVerified?: Date
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    providerId?: string
    emailVerified?: Date
  }
}

// === FILE: src/middleware.ts ===
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes
        if (pathname.startsWith('/auth') || 
            pathname === '/' || 
            pathname.startsWith('/book') ||
            pathname.startsWith('/api/auth') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/favicon')) {
          return true
        }

        // Protected routes
        if (pathname.startsWith('/dashboard')) {
          if (!token) return false
          
          // Provider dashboard
          if (pathname.startsWith('/dashboard/provider')) {
            return token.role === 'PROVIDER' || token.role === 'ADMIN'
          }
          
          // Admin dashboard
          if (pathname.startsWith('/dashboard/admin')) {
            return token.role === 'ADMIN'
          }
          
          // Customer dashboard
          if (pathname.startsWith('/dashboard/customer')) {
            return token.role === 'CUSTOMER' || token.role === 'ADMIN'
          }
        }

        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
  ]
}
