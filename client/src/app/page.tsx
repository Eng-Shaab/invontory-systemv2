"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <span className="text-sm text-gray-500">Preparing your dashboard...</span>
    </div>
  );
}
