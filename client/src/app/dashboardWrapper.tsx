"use client";

import React, { useEffect } from 'react'
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import { useAppSelector } from './redux';
import { usePathname } from 'next/navigation';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  )
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.add("light")
    }
  })

  return (
    <div 
    className={`${
      isDarkMode ? "dark" : "light"} 
     flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
      <Sidebar />
      <main 
      className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${
        isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
      }`}
      >
        <Navbar />
      {children} 
      </main>    
      </div>
    
  )
}

const DashboardWrapper = ({ children }: { children: React.ReactNode}) => {
  return <DashboardLayout>{children}</DashboardLayout>
}

export default DashboardWrapper

// Single place wrapper that decides when to show the dashboard chrome
export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  if (!pathname) return <>{children}</>;

  // Never show dashboard chrome on auth routes
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return <>{children}</>;
  }

  // Routes that should show the dashboard layout
  const dashboardBases = [
    '/',
    '/dashboard',
    '/customers',
    '/products',
    '/inventory',
    '/sales',
    '/purchases',
    '/settings',
    '/test',
  ];

  const shouldWrap = dashboardBases.some((base) => {
    if (base === '/') return pathname === '/';
    return pathname === base || pathname.startsWith(base + '/');
  });

  if (shouldWrap) {
    return <DashboardWrapper>{children}</DashboardWrapper>;
  }

  return <>{children}</>;
}
