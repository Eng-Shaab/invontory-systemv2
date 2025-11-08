"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/app/(components)/ui/button";
import { Input } from "@/app/(components)/ui/input";
import { Label } from "@/app/(components)/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function VerifyPage() {
  const { verifyCode, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingToken = searchParams.get("pendingToken");
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!pendingToken) {
      router.replace("/login");
    }
  }, [pendingToken, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingToken) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await verifyCode(pendingToken, code);
      router.replace(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-semibold text-gray-900">Check your inbox</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Enter the 6-digit verification code that we sent to your email address.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting || status === "loading"}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify and continue"}
          </Button>
        </form>
      </div>
    </main>
  );
}
