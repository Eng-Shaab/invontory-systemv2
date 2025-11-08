"use client";

import React, { useEffect } from "react"
import Navbar from "@/app/(components)/Navbar"
import Sidebar from "@/app/(components)/Sidebar"
import { useAppSelector } from "./redux"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useMemo } from "react"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  )
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    document.documentElement.classList.toggle("light", !isDarkMode)
  }, [isDarkMode])

  return (
    <div
      className={`${
        isDarkMode ? "dark" : "light"
      } flex min-h-screen w-full bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-100`}
    >
      <Sidebar />
      <main
        className={`flex min-h-screen w-full flex-col bg-white py-7 px-9 dark:bg-slate-950 ${
          isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
        <Navbar />
      {children} 
      </main>    
      </div>
    
  )
}

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>
}

export default DashboardWrapper

// Single place wrapper that decides when to show the dashboard chrome
export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useAuth()

  const authRoutes = useMemo(() => ["/login", "/verify"], [])

  const dashboardBases = useMemo(
    () => [
      "/",
      "/dashboard",
      "/customers",
      "/products",
      "/inventory",
      "/sales",
      "/purchases",
      "/settings",
      "/users",
      "/test",
    ],
    [],
  )

  const isAuthRoute = pathname ? authRoutes.some((route) => pathname.startsWith(route)) : false
  const shouldWrap =
    pathname &&
    dashboardBases.some((base) => {
      if (base === "/") return pathname === "/"
      return pathname === base || pathname.startsWith(`${base}/`)
    })

  useEffect(() => {
    if (!pathname) return

    if (isAuthRoute && status === "authenticated") {
      router.replace("/dashboard")
      return
    }

    if (shouldWrap && status === "unauthenticated") {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthRoute, pathname, router, shouldWrap, status])

  if (!pathname) return <>{children}</>

  if (isAuthRoute) {
    return <>{children}</>
  }

  if (shouldWrap) {
    if (status === "loading") {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <span className="text-sm text-gray-500">Loading dashboard...</span>
        </div>
      )
    }

    if (status !== "authenticated") {
      return null
    }

    return <DashboardWrapper>{children}</DashboardWrapper>
  }

  return <>{children}</>
}
