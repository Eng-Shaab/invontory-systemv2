"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/app/(components)/ui/button";
import { Input } from "@/app/(components)/ui/input";
import { Label } from "@/app/(components)/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ClipboardEvent, FormEvent, useEffect, useMemo, useState } from "react";

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

  const isBusy = useMemo(() => isSubmitting || status === "loading", [isSubmitting, status]);

  const normalizeCode = (value: string) => value.replace(/[^0-9]/g, "").slice(0, 6);

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    setCode(normalizeCode(pasted));
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-white to-indigo-100" aria-hidden="true" />
      <div className="absolute inset-y-0 right-1/2 hidden translate-x-1/2 scale-150 rounded-full bg-blue-200/30 blur-3xl md:block" aria-hidden="true" />

      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white/85 shadow-2xl backdrop-blur">
        <div className="grid md:grid-cols-2">
          <section className="relative hidden flex-col justify-center bg-gradient-to-br from-blue-600 via-indigo-500 to-sky-500 p-10 text-white md:flex">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-100">Two-Factor Active</p>
              <h1 className="text-4xl font-semibold leading-tight">One more step to safeguard Sanabil Abaya</h1>
              <p className="max-w-sm text-sm text-blue-50/90">
                We have sent a six-digit code to your inbox. Enter it below to confirm it is really you.
              </p>
            </div>
            <div className="mt-10 grid gap-3 text-sm text-blue-50/80">
              <p>Best practices:</p>
              <ul className="space-y-2">
                <li>• Codes expire after 10 minutes</li>
                <li>• Keep this window open while you retrieve the email</li>
                <li>• Need another code? You can request a resend from the login page</li>
              </ul>
            </div>
            <div className="absolute right-10 top-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 bg-white/10 text-lg font-semibold">
              SA
            </div>
          </section>

          <section className="relative flex flex-col justify-center bg-white p-8 sm:p-12">
            <div className="absolute left-6 top-6 text-sm font-medium text-blue-600 md:hidden">Sanabil Abaya</div>
            <div className="mx-auto w-full max-w-sm text-center">
              <h2 className="text-3xl font-semibold text-slate-900">Enter verification code</h2>
              <p className="mt-2 text-sm text-slate-500">
                We just emailed a 6-digit code. Type it below to continue.
              </p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Six-digit code
                  </Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(normalizeCode(event.target.value))}
                    onPaste={handlePaste}
                    required
                    className="h-14 rounded-xl border-slate-200 bg-slate-50 text-center text-2xl tracking-[0.5em] text-slate-700 focus:border-blue-300 focus:ring-blue-200"
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
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify and continue"}
                </Button>
              </form>

              <p className="mt-6 text-xs text-slate-400">
                Didn’t receive the email? Check spam or contact <span className="font-medium text-blue-600">support@sanabilabaya.com</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
