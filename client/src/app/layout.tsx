import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import DashboardWrapper from "./dashboardWrapper"

import { ClerkProvider } from "@clerk/nextjs"
import StoreProvider from "./redux"
import { DashboardShell } from "./dashboardWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sanabil System",
  description: "Inventory management system for small businesses",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={inter.className}>
          <StoreProvider>
            <DashboardShell>
              {children}
            </DashboardShell>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}