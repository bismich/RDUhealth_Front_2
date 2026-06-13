"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type ChatSession = {
  id: number;
  practice: number;
  practice_name: string;
  owner_email: string;
  session_id: string;
  created_at: string;
  last_interaction_at: string;
  messages_count: number;
};

type ChatSessionsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatSession[];
};

export default function ChatSessionsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken && role === "admin");

  const [filters, setFilters] = useState({
    owner_email: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (filters.owner_email) params.append("owner_email", filters.owner_email);
    if (filters.search) params.append("search", filters.search);
    params.append("page", currentPage.toString());

    return `${baseUrl}/api/v1/admin/chat-sessions/?${params.toString()}`;
  };

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Unable to load chat sessions");
    }
    return (await response.json()) as ChatSessionsResponse;
  };

  const { data, error, isLoading } = useSWR<ChatSessionsResponse>(
    canQuery ? buildUrl() : null,
    fetcher
  );

  const sessions = useMemo(() => data?.results ?? [], [data]);
  const totalPages = useMemo(
    () => Math.ceil((data?.count ?? 0) / 25),
    [data?.count]
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (role !== "admin") {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4">
          <h1 className="text-lg font-semibold text-red-800">Access Denied</h1>
          <p className="text-red-600">
            You need admin access to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Chat Sessions
          </h1>
          <p className="text-sm text-slate-600">
            Monitor chat sessions and user interactions across all practices.
          </p>
        </div>
        {!canQuery && (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Set NEXT_PUBLIC_API_BASE_URL and authenticate with an admin account
            to load data.
          </p>
        )}
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            Unable to load chat sessions. Try again shortly.
          </p>
        )}
      </header>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Owner Email
            </label>
            <input
              type="text"
              value={filters.owner_email}
              onChange={(e) =>
                handleFilterChange("owner_email", e.target.value)
              }
              placeholder="Filter by practice owner email..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by practice name or session ID..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Sessions Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No chat sessions found matching your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Practice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {session.practice_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {session.owner_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-slate-500">
                          {session.session_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {session.messages_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(session.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {new Date(
                            session.last_interaction_at
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(
                            session.last_interaction_at
                          ).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * 25 + 1} to{" "}
                    {Math.min(currentPage * 25, data?.count ?? 0)} of{" "}
                    {data?.count ?? 0} sessions
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-slate-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-slate-100 rounded">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-slate-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
