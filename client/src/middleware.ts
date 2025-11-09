import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/health"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const session = request.cookies.get("inventory_session")

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    if (pathname !== "/") {
      const target = `${pathname}${request.nextUrl.search}`
      loginUrl.searchParams.set("redirectTo", target)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico).*)",
  ],
}