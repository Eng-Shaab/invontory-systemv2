import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// With API hosted on a different domain, Next.js middleware cannot see the API cookie.
// We delegate auth gating to the client (DashboardShell + AuthContext) and let all routes pass through here.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
}