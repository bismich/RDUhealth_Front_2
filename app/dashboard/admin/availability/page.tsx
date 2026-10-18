"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type AvailabilityRow = {
  id: number;
  name: string;
  owner_email: string;
  is_accepting_new_patients: boolean;
  not_accepting_since: string | null;
  wait_time: string;
  appears_in_search: boolean;
  hidden_reasons: string[];
  last_check_in_email_at: string | null;
  awaiting_answer_since: string | null;
};

const FILTERS = {
  all: { label: "All practices", match: () => true },
  closed: { label: "Not accepting", match: (row) => !row.is_accepting_new_patients },
  hidden: { label: "Hidden from search", match: (row) => !row.appears_in_search },
  awaiting: { label: "Awaiting check-in answer", match: (row) => Boolean(row.awaiting_answer_since) },
} satisfies Record<string, { label: string; match: (row: AvailabilityRow) => boolean }>;

type FilterKey = keyof typeof FILTERS;

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatDuration(since: string) {
  const hours = Math.floor((Date.now() - new Date(since).getTime()) / 3_600_000);
  if (hours < 1) return "less than an hour";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export default function AvailabilityReportPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken && role === "admin");
  const [filter, setFilter] = useState<FilterKey>("all");

  const fetcher = async (url: string) => {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) {
      throw new Error("Unable to load the availability report");
    }
    return (await response.json()) as AvailabilityRow[];
  };

  const { data, error, isLoading } = useSWR<AvailabilityRow[]>(
    canQuery ? `${baseUrl}/api/v1/admin/reports/availability/` : null,
    fetcher
  );

  const rows = useMemo(() => (data ?? []).filter(FILTERS[filter].match), [data, filter]);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(FILTERS) as FilterKey[]).map((key) => [key, (data ?? []).filter(FILTERS[key].match).length])
      ) as Record<FilterKey, number>,
    [data]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Availability report</h1>
          <p className="text-sm text-slate-600">
            Which practices are accepting new patients, whether AI search shows them, and where each availability
            check-in stands.
          </p>
        </div>
        {role !== "admin" && (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            You need admin access to view this report.
          </p>
        )}
        {!canQuery && role === "admin" && (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Set NEXT_PUBLIC_API_BASE_URL and authenticate with an admin account to load the report.
          </p>
        )}
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            Unable to load the availability report. Try again shortly.
          </p>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(FILTERS) as FilterKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-slate-300 ${
              filter === key ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
            }`}
          >
            <div className="text-2xl font-bold text-slate-900">{data ? counts[key] : "–"}</div>
            <div className="text-sm text-slate-600">{FILTERS[key].label}</div>
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="px-6 py-6 text-sm text-slate-500">Loading report…</p>
        ) : rows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">No practices match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Practice</th>
                  <th className="px-4 py-3">Accepting</th>
                  <th className="px-4 py-3">In AI search</th>
                  <th className="px-4 py-3">Check-in email</th>
                  <th className="px-4 py-3">Not accepting since</th>
                  <th className="px-4 py-3">Wait time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 align-top">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.owner_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.is_accepting_new_patients ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {row.is_accepting_new_patients ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.appears_in_search ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {row.appears_in_search ? "Visible" : "Hidden"}
                      </span>
                      {row.hidden_reasons.length > 0 && (
                        <div className="mt-1 text-xs text-slate-500">{row.hidden_reasons.join(" · ")}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.last_check_in_email_at ? (
                        <div>Sent {formatDate(row.last_check_in_email_at)}</div>
                      ) : (
                        <div className="text-slate-400">Not sent</div>
                      )}
                      {row.awaiting_answer_since && (
                        <div className="mt-1 text-xs text-amber-700">
                          Awaiting answer since {formatDate(row.awaiting_answer_since)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.is_accepting_new_patients ? (
                        <span className="text-slate-400">—</span>
                      ) : row.not_accepting_since ? (
                        <>
                          <div>{formatDate(row.not_accepting_since)}</div>
                          <div className="text-xs text-slate-500">for {formatDuration(row.not_accepting_since)}</div>
                        </>
                      ) : (
                        <span className="text-slate-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.wait_time || <span className="text-slate-400">Not set</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
