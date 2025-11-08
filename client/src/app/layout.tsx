import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import StoreProvider from "./redux"
import { DashboardShell } from "./dashboardWrapper"
import { AuthProvider } from "@/context/AuthContext"

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
    <html lang="en">
      <body data-theme="light" className={inter.className}>
        <StoreProvider>
          <AuthProvider>
            <DashboardShell>{children}</DashboardShell>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  )
}