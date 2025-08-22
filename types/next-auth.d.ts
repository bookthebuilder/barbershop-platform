import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "PROVIDER" | "CUSTOMER"
      firstName: string
      lastName: string
      phone?: string
      isProvider: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    role: "ADMIN" | "PROVIDER" | "CUSTOMER"
    phone?: string
    avatar?: string
    isProvider: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "PROVIDER" | "CUSTOMER"
    firstName: string
    lastName: string
    phone?: string
    isProvider: boolean
  }
}
