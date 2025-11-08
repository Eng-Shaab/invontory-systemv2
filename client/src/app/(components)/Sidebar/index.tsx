"use client"

import { useAppDispatch, useAppSelector } from "@/app/redux"
import { setIsSidebarCollapsed } from "@/state"
import { Archive, Clipboard, Layout, type LucideIcon, Menu, ShoppingCart, Truck, UserCog, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

interface SidebarLinkProps {
  href: string
  icon: LucideIcon
  label: string
  isCollapsed: boolean
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed }: SidebarLinkProps) => {
  const pathname = usePathname()
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard")

  return (
    <Link href={href}>
      <div
        className={`group mx-4 mb-2 flex cursor-pointer items-center gap-3 rounded-xl border border-transparent
        ${isCollapsed ? "justify-center py-3" : "px-5 py-3"}
        transition-all duration-200 ease-out ${
          isActive
            ? "bg-white text-blue-800 shadow-lg shadow-blue-900/25"
            : "bg-white/5 text-white/75 hover:bg-white/10 hover:text-white hover:border-white/20"
        }`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 ${
            isActive ? "bg-blue-100 text-blue-700" : "bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } text-sm font-semibold tracking-wide transition-colors duration-200 ${
            isActive ? "text-blue-800" : "text-white"
          }`}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}

const Sidebar = () => {
  const dispatch = useAppDispatch()
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed)
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))
  }

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-20" : "w-72 md:w-64"
  } h-full overflow-hidden border-r border-white/10 bg-gradient-to-b from-slate-950 via-blue-950 to-blue-800 shadow-2xl shadow-blue-900/40 transition-all duration-300 z-40`

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex items-center justify-between gap-3 pt-9 ${
          isSidebarCollapsed ? "px-4" : "px-6"
        }`}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 shadow-lg shadow-blue-900/30 ${isSidebarCollapsed ? "" : "mr-2"}`}>
          <Image src="/logo.png" alt="SANABIL Logo" width={32} height={32} className="h-7 w-7 object-contain" />
        </div>
        <div className={`${isSidebarCollapsed ? "hidden" : "block"}`}>
          <h1 className="text-[26px] font-extrabold tracking-tight text-white">SANABIL</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-white/40">Inventory</p>
        </div>

        <button
          className="rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* LINKS */}
      <div className="mt-10 flex-grow space-y-1">
        <SidebarLink href="/dashboard" icon={Layout} label="Dashboard" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/products" icon={Clipboard} label="Products" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/purchases" icon={Truck} label="Purchases" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/customers" icon={Users} label="Customers" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/sales" icon={ShoppingCart} label="Sales" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/inventory" icon={Archive} label="Inventory" isCollapsed={isSidebarCollapsed} />
        {isAdmin && <SidebarLink href="/users" icon={UserCog} label="Users" isCollapsed={isSidebarCollapsed} />}
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10 px-6`}>
        <div className="h-px w-full bg-white/10" />
        <p className="pt-4 text-center text-xs text-white/60">&copy; 2025 SANABIL</p>
      </div>
    </div>
  )
}

export default Sidebar
