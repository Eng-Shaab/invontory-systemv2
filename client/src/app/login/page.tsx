"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/app/(components)/ui/button";
import { Input } from "@/app/(components)/ui/input";
import { Label } from "@/app/(components)/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

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
      await login(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setIsSubmitting(false);
    }
  };

  const isBusy = useMemo(() => isSubmitting || status === "loading", [isSubmitting, status]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-white to-indigo-100" aria-hidden="true" />
      <div className="absolute inset-y-0 left-1/2 hidden -translate-x-1/2 scale-150 rounded-full bg-blue-200/30 blur-3xl md:block" aria-hidden="true" />

      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white/80 shadow-2xl backdrop-blur">
        <div className="grid md:grid-cols-2">
          <section className="relative hidden flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-500 to-sky-500 p-10 text-white md:flex">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-blue-100">Sanabil Abaya</p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight">Inventory Control Made Elegant</h1>
              </div>
              <p className="max-w-sm text-sm text-blue-100/90">
                Track products, purchases, and sales in seconds. Two-factor security keeps every action safe while your
                team stays in sync.
              </p>
            </div>

            <div className="space-y-3 text-sm text-blue-100/90">
              <p className="font-medium">Why teams trust Sanabil Abaya</p>
              <ul className="space-y-2 text-blue-50/80">
                <li>• Real-time insight across SKUs and locations</li>
                <li>• Secure access with email verification</li>
                <li>• Purpose-built for fast moving retail teams</li>
              </ul>
            </div>
            <div className="absolute right-10 top-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 bg-white/10 text-lg font-semibold">
              SA
            </div>
          </section>

          <section className="relative flex flex-col justify-center bg-white p-8 sm:p-12">
            <div className="absolute right-6 top-6 hidden text-sm font-medium text-blue-600 md:block">Sanabil Abaya</div>
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-8 space-y-2 text-center">
                <h2 className="text-3xl font-semibold text-slate-900">Welcome back</h2>
                <p className="text-sm text-slate-500">Sign in to continue to the Sanabil Abaya control center.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base text-slate-700 focus:border-blue-300 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base text-slate-700 focus:border-blue-300 focus:ring-blue-200"
                  />
                </div>

                {error ? (
                  <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-base font-semibold shadow-lg shadow-blue-200 transition hover:shadow-sky-200 disabled:from-blue-300 disabled:to-sky-200"
                  disabled={isBusy}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-400">
                Having trouble? Email <span className="font-medium text-blue-600">support@sanabilabaya.com</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
