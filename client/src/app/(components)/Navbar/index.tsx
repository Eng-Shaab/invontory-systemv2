"use client"

import { useAppDispatch, useAppSelector } from "@/app/redux"
import { Bell, LogOut, Menu, Moon, Search, Settings, Sun } from "lucide-react"
import { setIsSidebarCollapsed, setIsDarkMode } from "@/state"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { useRouter } from "next/navigation"

const Navbar = () => {
  const dispatch = useAppDispatch()
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed)
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))
  }

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode))
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : user?.email?.[0]?.toUpperCase()

  const displayName = user?.name ?? user?.email ?? "User"

  const handleLogout = async () => {
    try {
      setIsSigningOut(true)
      await logout()
      router.replace("/login")
    } catch (error) {
      console.error("Failed to sign out", error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100" onClick={toggleSidebar}>
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative">
          <input
            type="search"
            placeholder="Start type to search groups & products"
            className="pl-10 pr-4 py-2 w-50 md:w-80 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <div>
            <button onClick={toggleDarkMode}>
              {isDarkMode ? (
                <Sun className="cursor-pointer text-gray-500" size={24} />
              ) : (
                <Moon className="cursor-pointer text-gray-500" size={24} />
              )}
            </button>
          </div>
          <div className="relative">
            <Bell className="cursor-pointer text-gray-500" size={24} />
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
              3
            </span>
          </div>
          <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {initials ?? "U"}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{displayName}</span>
              <span className="text-xs font-medium uppercase text-gray-500">{user?.role ?? ""}</span>
            </div>
            <button
              className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              onClick={handleLogout}
              disabled={isSigningOut}
            >
              <LogOut size={14} />
              <span>{isSigningOut ? "Signing out" : "Sign out"}</span>
            </button>
          </div>
        </div>
        <Link href="/settings">
          <Settings className="cursor-pointer text-gray-500 hover:text-blue-500 transition-colors" size={24} />
        </Link>
      </div>
    </div>
  )
}

export default Navbar
