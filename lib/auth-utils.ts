// lib/auth-utils.ts - Authentication utility functions
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

// Server-side session helper
export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

// Server-side authentication requirement
export async function requireAuth() {
  const session = await getServerAuthSession()
  if (!session) {
    redirect("/auth/signin")
  }
  return session
}

// Role-based authentication
export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/auth/signin")
  }
  return session
}

// Check if user is admin
export async function requireAdmin() {
  return await requireRole(["ADMIN"])
}

// Check if user is provider or admin
export async function requireProvider() {
  return await requireRole(["PROVIDER", "ADMIN"])
}

// Client-side auth hook
"use client"
import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    session,
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "ADMIN",
    isProvider: session?.user?.role === "PROVIDER" || session?.user?.role === "ADMIN",
    isCustomer: session?.user?.role === "CUSTOMER",
  }
}
