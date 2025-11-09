"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  useEffect(() => {
    // 2FA has been removed; redirect users appropriately
    router.replace(redirectTo);
  }, [redirectTo, router]);

  return null;
}
