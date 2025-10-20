"use client";

import { FormEvent, useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const initialForm = {
  name: "",
  email: "",
  organization: "",
  message: "",
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch(
        `${baseUrl}/api/v1/admin/contact-submissions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("We couldn't send your message. Please try again.");
      }

      setStatus("success");
      setForm(initialForm);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We couldn't send your message. Please try again."
      );
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-20">
          <div className="space-y-3 text-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Contact Us
            </span>
            <h1 className="text-4xl font-semibold text-slate-900">
              Reach out to your team
            </h1>
            <p className="text-base text-slate-600">
              If you encounter any issues, have suggestions, or are interested in partnering with us, please don’t hesitate to reach out. Our team will respond within 24–48 hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-white/70 bg-white/80 p-10 shadow-2xl shadow-blue-500/10 backdrop-blur"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-left text-sm text-slate-600">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  type="text"
                  placeholder="Jordan Smith"
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-left text-sm text-slate-600">
                Work email
                <input
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  type="email"
                  placeholder="you@practice.com"
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-left text-sm text-slate-600 sm:col-span-2">
                Organization (optional)
                <input
                  value={form.organization}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      organization: event.target.value,
                    }))
                  }
                  type="text"
                  placeholder="Triangle Collaborative Care"
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-left text-sm text-slate-600">
              How can we help?
              <textarea
                required
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
                placeholder="Please describe your query in details."
                rows={6}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {status === "success" && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Thanks! A member of our team will reach out shortly.
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-center">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
