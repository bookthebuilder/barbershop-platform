import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import * as bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { provider: true }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            isProvider: !!user.provider
          } as any
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.phone = (user as any).phone
        token.isProvider = (user as any).isProvider
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub!
        ;(session.user as any).role = token.role as string
        ;(session.user as any).firstName = token.firstName as string
        ;(session.user as any).lastName = token.lastName as string
        ;(session.user as any).phone = token.phone as string
        ;(session.user as any).isProvider = token.isProvider as boolean
      }
      return session
    },
    
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingUser) {
            const [firstName, ...lastNameParts] = (user.name || "").split(" ")
            const lastName = lastNameParts.join(" ")
            
            await prisma.user.create({
              data: {
                email: user.email!,
                firstName: firstName || "User",
                lastName: lastName || "",
                avatar: user.image,
                role: "CUSTOMER",
                isActive: true,
                emailVerified: new Date(),
              }
            })
          }
        } catch (error) {
          console.error("Error creating user:", error)
          return false
        }
      }
      return true
    }
  },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  debug: process.env.NODE_ENV === "development",
}
