"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/app/(components)/ui/button";
import { Input } from "@/app/(components)/ui/input";
import { Label } from "@/app/(components)/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const { login, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { pendingToken } = await login(email, password);
      router.push(`/verify?pendingToken=${encodeURIComponent(pendingToken)}&redirectTo=${encodeURIComponent(redirectTo)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mb-6 text-center text-sm text-gray-600">Sign in to manage your inventory dashboard</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send verification code"}
          </Button>
        </form>
      </div>
    </main>
  );
}
