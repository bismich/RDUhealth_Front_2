import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/" className="text-base font-semibold text-slate-900">
            Urizon Health - RDU Area
          </Link>
          <p className="max-w-md text-xs text-slate-500">
            The 1st AI-powered referral tool for mental health professionals
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/contact" className="transition hover:text-blue-600">
            Contact
          </Link>
          <Link href="/terms" className="transition hover:text-blue-600">
            Terms
          </Link>
          <Link href="/privacy" className="transition hover:text-blue-600">
            Privacy
          </Link>
          <Link href="/login" className="transition hover:text-blue-600">
            Log in
          </Link>
          <Link href="/signup" className="transition hover:text-blue-600">
            Start free trial
          </Link>
        </div>
        <p className="text-xs text-slate-400">
          © {year} Urizon Solutions, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
