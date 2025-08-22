// middleware.ts - Route protection middleware
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin-only routes
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Provider-only routes
    if (pathname.startsWith("/provider")) {
      if (!token || !["PROVIDER", "ADMIN"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Customer dashboard
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup")) {
      if (token) {
        // Redirect based on role
        if (token.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin", req.url))
        } else if (token.role === "PROVIDER") {
          return NextResponse.redirect(new URL("/provider", req.url))
        } else {
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        if (
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/auth") ||
          pathname === "/" ||
          pathname.startsWith("/services") ||
          pathname.startsWith("/about") ||
          pathname.startsWith("/contact") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon")
        ) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
