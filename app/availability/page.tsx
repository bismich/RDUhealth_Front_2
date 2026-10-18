"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

type Availability = {
  name: string;
  is_accepting_new_patients: boolean;
  wait_time: string;
};

const inputClass =
  "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100";
const buttonClass =
  "inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 disabled:opacity-60";

export default function AvailabilityPage({
  searchParams,
}: {
  searchParams: { token?: string; answer?: string };
}) {
  const token = searchParams.token ?? "";
  const answer = searchParams.answer;
  const [practice, setPractice] = useState<Availability | null>(null);
  const [waitTime, setWaitTime] = useState("");
  const [waitTimeSaved, setWaitTimeSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (body: { accepting: boolean; wait_time?: string }) => {
    setError(null);
    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/v1/data/availability/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, ...body }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.detail ?? "We couldn't save your answer. Please try again.");
        return false;
      }
      setPractice(data);
      setWaitTime(data.wait_time ?? "");
      return true;
    } catch {
      setError("We couldn't reach the server. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // The answer is saved here rather than on link open: email scanners prefetch links but don't run this.
  useEffect(() => {
    if (!token || (answer !== "yes" && answer !== "no")) {
      setError("This link is incomplete. Use the buttons in your email, or update your availability from your dashboard.");
      return;
    }
    submit({ accepting: answer === "yes" });
  }, [token, answer]);

  const saveWaitTime = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWaitTimeSaved(await submit({ accepting: true, wait_time: waitTime }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="relative isolate flex-1 overflow-hidden">
        <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-6 py-16">
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
            {!practice && !error && (
              <p className="text-sm text-slate-500">Saving your answer…</p>
            )}

            {practice?.is_accepting_new_patients && (
              <>
                <div className="mb-6 space-y-2">
                  <h1 className="text-3xl font-semibold text-slate-900">
                    Thanks, you&apos;re listed
                  </h1>
                  <p className="text-sm text-slate-500">
                    <strong>{practice.name}</strong> is visible in search as
                    accepting new patients.
                  </p>
                </div>
                <form onSubmit={saveWaitTime} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    How long is your current wait time for new patients?
                    <input
                      value={waitTime}
                      onChange={(event) => {
                        setWaitTime(event.target.value);
                        setWaitTimeSaved(false);
                      }}
                      className={inputClass}
                      placeholder="e.g., 2-3 weeks"
                    />
                  </label>
                  {waitTimeSaved && (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-600">
                      Wait time saved.
                    </p>
                  )}
                  <button type="submit" disabled={saving} className={buttonClass}>
                    Save wait time
                  </button>
                </form>
              </>
            )}

            {practice && !practice.is_accepting_new_patients && (
              <>
                <div className="mb-6 space-y-2">
                  <h1 className="text-3xl font-semibold text-slate-900">
                    Got it
                  </h1>
                  <p className="text-sm text-slate-500">
                    <strong>{practice.name}</strong> is hidden from search while
                    you&apos;re not accepting new patients. We&apos;ll check in
                    again in about two weeks.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => submit({ accepting: true })}
                  className={buttonClass}
                >
                  We&apos;re accepting new patients
                </button>
              </>
            )}

            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <p className="mt-6 text-sm text-slate-600">
              Need to change something else?{" "}
              <Link
                className="font-semibold text-blue-600 hover:text-blue-500"
                href="/dashboard"
              >
                Go to your dashboard
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
