"use client";

import React from "react";
import { usePathname } from "next/navigation";
import DashboardWrapper from "./dashboardWrapper";

// Central place to decide when to show the dashboard chrome (sidebar + navbar)
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If pathname isn't available yet, render children without wrapping to avoid incorrect sidebar render
  if (!pathname) return <>{children}</>;

  // Never show dashboard chrome on auth routes
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/verify");
  if (isAuthRoute) return <>{children}</>;

  // Routes that should render inside the dashboard layout
  const dashboardBases = [
    "/", // home renders dashboard
    "/dashboard",
    "/customers",
    "/products",
    "/inventory",
    "/sales",
    "/purchases",
    "/settings",
    "/users",
    "/test",
  ];

  const shouldWrap = dashboardBases.some((base) => {
    if (base === "/") return pathname === "/"; // home only
    return pathname === base || pathname.startsWith(base + "/");
  });

  if (shouldWrap) {
    return <DashboardWrapper>{children}</DashboardWrapper>;
  }

  return <>{children}</>;
}
