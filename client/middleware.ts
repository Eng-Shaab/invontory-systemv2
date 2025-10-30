import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next|static|favicon.ico).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
