import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value
  const userRole = request.cookies.get("userRole")?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (userRole && userRole !== "admin") {
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
    }
  }

  if (pathname.startsWith("/partner")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (userRole && userRole !== "partner") {
      return NextResponse.redirect(new URL(`/${userRole === "admin" ? "admin" : "visitor/rewards"}`, request.url))
    }
  }

  if (pathname.startsWith("/visitor")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  if (pathname === "/login" && token) {
    const redirectPath =
      userRole === "admin" ? "/admin" : userRole === "partner" ? "/partner/dashboard" : "/visitor/rewards"
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*", "/visitor/:path*", "/login"],
}
