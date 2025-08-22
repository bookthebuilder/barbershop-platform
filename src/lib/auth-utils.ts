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
