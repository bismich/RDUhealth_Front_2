"use client";

import Link from "next/link";
import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { createSupabaseClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your inbox for reset instructions.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="relative isolate flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
          <div className="absolute left-[20%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.18),_rgba(59,130,246,0))]" />
          <div className="absolute right-[10%] bottom-[5%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.15),_rgba(79,70,229,0))]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-6 py-16">
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900">
                Reset your password
              </h1>
              <p className="text-sm text-slate-500">
                Enter the email address associated with your account.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              {message && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-600">
                  {message}
                </p>
              )}
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
              >
                Send reset link
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-600">
              Remembered your password?{" "}
              <Link
                className="font-semibold text-blue-600 hover:text-blue-500"
                href="/login"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
