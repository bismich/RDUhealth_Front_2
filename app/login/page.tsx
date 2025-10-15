"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { createSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { isLoading, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/dashboard");
    }
  }, [isLoading, session, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session) {
      setError(error?.message ?? "Unable to log in");
      setLoading(false);
      return;
    }
    // AuthProvider will automatically handle the session update
    router.push("/dashboard");
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="relative isolate flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
          <div className="absolute left-[20%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.18),_rgba(59,130,246,0))]" />
          <div className="absolute right-[10%] bottom-[5%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.15),_rgba(79,70,229,0))]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-col justify-center px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6 text-balance">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                ← Back to home
              </Link>
              <h1 className="text-4xl font-semibold text-slate-900">
                Welcome back.
              </h1>
              <p className="max-w-md text-base text-slate-600">
                Pick up where you left off: update your practice profile,
                refresh embeddings, and review analytics without missing a beat.
              </p>
              <div className="rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur">
                <p className="text-sm font-semibold text-slate-700">
                  Need to invite teammates?
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Account owners can contact support to add additional practices
                  and workspace members.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Sign in to your dashboard
                </h2>
                <p className="text-sm text-slate-500">
                  Use the email and password associated with your Supabase
                  account.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Email
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Password
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </label>
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Log in"}
                </button>
              </form>
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <p>
                  Need an account?{" "}
                  <Link
                    className="font-semibold text-blue-600 hover:text-blue-500"
                    href="/signup"
                  >
                    Sign up
                  </Link>
                </p>
                <p>
                  Forgot your password?{" "}
                  <Link
                    className="font-semibold text-blue-600 hover:text-blue-500"
                    href="/reset"
                  >
                    Reset it
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
