"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { createSupabaseClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="relative isolate flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
          <div className="absolute left-[15%] top-[5%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.18),_rgba(99,102,241,0))]" />
          <div className="absolute right-[18%] bottom-[10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.16),_rgba(14,165,233,0))]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-col justify-center px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Guided
                setup
              </span>
              <h1 className="mt-6 text-4xl font-semibold text-slate-900">
                Register your practice in minutes.
              </h1>
              <p className="mt-4 max-w-md text-base text-slate-600">
                Once you're in your account, simply answer a few questions about your practice—and you're all set..
              </p>
              <ul className="mt-8 space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                    1
                  </span>
                  Enter your practice details accurately.
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                    2
                  </span>
                  Be sure to highlight what sets you apart from others to ensure the best possible matches and maximum visibility
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Create your account
                </h2>
                <p className="text-sm text-slate-500">
                  If you encounter any issues during the onboarding process, please don’t hesitate to reach out. You can use the contact form located on the main page.
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
                  className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Creating…" : "Sign up"}
                </button>
              </form>
              <p className="mt-6 text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  className="font-semibold text-blue-600 hover:text-blue-500"
                  href="/login"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
