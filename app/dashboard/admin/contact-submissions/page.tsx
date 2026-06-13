"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  organization: string;
  message: string;
  created_at: string;
};

type ContactSubmissionsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContactSubmission[];
};

export default function ContactSubmissionsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken && role === "admin");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const buildUrl = () => {
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    return `${baseUrl}/api/v1/admin/contact-submissions/inbox/?${params.toString()}`;
  };

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Unable to load submissions");
    }
    return (await response.json()) as ContactSubmissionsResponse;
  };

  const { data, error, isLoading, mutate } = useSWR<ContactSubmissionsResponse>(
    canQuery ? buildUrl() : null,
    fetcher
  );

  const submissions = useMemo(() => data?.results ?? [], [data]);
  const totalPages = useMemo(
    () => Math.ceil((data?.count ?? 0) / 25),
    [data?.count]
  );

  const deleteSubmission = async (submissionId: number) => {
    if (!canQuery) return;

    setDeletingId(submissionId);
    try {
      const response = await fetch(
        `${baseUrl}/api/v1/admin/contact-submissions/${submissionId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        // Refresh the data after successful deletion
        await mutate();
      } else {
        console.error("Failed to delete submission");
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Contact inbox
          </h1>
          <p className="text-sm text-slate-600">
            Track inbound messages from the marketing site and follow up quickly
            with interested practices.
          </p>
        </div>
        {role !== "admin" && (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            You need admin access to view submissions.
          </p>
        )}
        {!canQuery && role === "admin" && (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Set NEXT_PUBLIC_API_BASE_URL and authenticate with an admin account
            to load submissions.
          </p>
        )}
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            Unable to load submissions. Try again shortly.
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="px-6 py-6 text-sm text-slate-500">
            Loading submissions…
          </p>
        ) : submissions.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No contact submissions yet. Your landing page form will appear here
            once prospects reach out.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {submissions.map((submission) => {
              const submittedAt = new Date(
                submission.created_at
              ).toLocaleString();
              return (
                <li key={submission.id} className="px-6 py-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-slate-900">
                        {submission.name}
                        {submission.organization && (
                          <span className="ml-2 text-sm font-medium text-slate-500">
                            • {submission.organization}
                          </span>
                        )}
                      </p>
                      <a
                        href={`mailto:${submission.email}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {submission.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {submittedAt}
                      </span>
                      <button
                        onClick={() => deleteSubmission(submission.id)}
                        disabled={deletingId === submission.id}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === submission.id ? (
                          <span className="flex items-center gap-1">
                            <svg
                              className="h-3 w-3 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Deleting...
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {submission.message}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Pagination */}
      {data && data.count > 25 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing {(currentPage - 1) * 25 + 1} to{" "}
            {Math.min(currentPage * 25, data.count)} of {data.count} submissions
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="flex items-center px-3 py-2 text-sm text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
