"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";

const features = [
  {
    title: " Connect with more clients—faster.",
    description:
      "Our smart referral tool helps more potential patients discover your website and appointment links with ease.",
  },
  {
    title: "AI powered matching algorithm",
    description:
      "You’ll only be matched with individuals actively seeking the specific services you provide.",
  },
  {
    title: "Meaningful analytics",
    description:
      "No need to guess if referrals are coming your way —you can see real-time interactions with your website link directly on your dashboard.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isLoading, session } = useAuth();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/dashboard");
    }
  }, [isLoading, session, router]);

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
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.25),_rgba(59,130,246,0))]" />
          <div className="absolute right-[10%] top-[35%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.18),_rgba(236,72,153,0))]" />
          <div className="absolute left-[12%] bottom-[10%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.18),_rgba(45,212,191,0))]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-32">
          <section className="flex flex-col gap-10 lg:items-center">
            <div className="flex flex-col gap-6 text-balance text-center lg:text-left">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm mx-auto lg:mx-0">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Live
                beta
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                The 1st AI-powered referral tool for mental health professionals
              </h1>
              <p className="max-w-xl text-lg text-slate-600 mx-auto lg:mx-0">
                Be discoverable through a locally focused, intelligent search experience that connects individuals with the right mental health providers.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
                >
                  Sign Up Today
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-blue-400 hover:text-blue-600"
                >
                  Log in
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-transparent bg-white/70 px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-white"
                >
                  Talk to our team
                </Link>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />{" "}
                  We send potential patients to you
                </span>
                <span>
                  Easy to use • AI assisted • Built for the Triangle area
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-blue-500/10 backdrop-blur">
            <div className="grid gap-10 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/30">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {feature.title}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-center gap-6 rounded-[32px] border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-10 py-12 text-center text-white shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              Meaningful Visibility
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold">
              From local outreach to online ads, we’re making sure the community knows about this tool—and knows how to find you
            </h2>
            <p className="max-w-2xl text-base text-white/80">
              Register your practice today and join a growing community of healthcare professionals using this AI-powered referral tool to expand their caseloads
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-lg shadow-black/20 transition hover:bg-blue-50"
              >
                Create your account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white hover:text-white"
              >
                I already have access
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
