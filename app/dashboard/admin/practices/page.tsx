"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type Practice = {
  id: number;
  owner: number;
  owner_email: string;
  owner_name: string;
  name: string;
  description: string;
  website: string;
  specialty: string;
  address: string;
  phone_number: string;
  email: string;
  is_active: boolean;
  public_token: string;
  public_token_expires_at: string;
  created_at: string;
  updated_at: string;
  chat_sessions_count: number;
  url_clicks_count: number;
  has_embedding: boolean;
};

type PracticesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Practice[];
};

export default function PracticesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken && role === "admin");

  const [filters, setFilters] = useState({
    is_active: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (filters.is_active) params.append("is_active", filters.is_active);
    if (filters.search) params.append("search", filters.search);
    params.append("page", currentPage.toString());

    return `${baseUrl}/api/v1/admin/practices/?${params.toString()}`;
  };

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Unable to load practices");
    }
    return (await response.json()) as PracticesResponse;
  };

  const { data, error, isLoading, mutate } = useSWR<PracticesResponse>(
    canQuery ? buildUrl() : null,
    fetcher
  );

  const practices = useMemo(() => data?.results ?? [], [data]);
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

  const togglePracticeStatus = async (
    practiceId: number,
    isActive: boolean
  ) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/v1/admin/practices/${practiceId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: !isActive }),
        }
      );

      if (response.ok) {
        mutate();
      }
    } catch (error) {
      console.error("Failed to update practice:", error);
    }
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
            Practice Management
          </h1>
          <p className="text-sm text-slate-600">
            Manage practice profiles and monitor their activity.
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
            Unable to load practices. Try again shortly.
          </p>
        )}
      </header>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by name, owner, or specialty..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Practices Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : practices.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No practices found matching your criteria.
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
                      Specialty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Embedding
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {practices.map((practice) => (
                    <tr key={practice.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {practice.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {practice.email}
                          </div>
                          {practice.website && (
                            <div className="text-xs text-blue-600">
                              <a
                                href={practice.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {practice.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {practice.owner_name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {practice.owner_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {practice.specialty || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          <div>{practice.chat_sessions_count} sessions</div>
                          <div>{practice.url_clicks_count} clicks</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            practice.has_embedding
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {practice.has_embedding ? "Ready" : "Missing"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            practice.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {practice.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            togglePracticeStatus(
                              practice.id,
                              practice.is_active
                            )
                          }
                          className={`text-sm font-medium ${
                            practice.is_active
                              ? "text-red-600 hover:text-red-700"
                              : "text-green-600 hover:text-green-700"
                          }`}
                        >
                          {practice.is_active ? "Deactivate" : "Activate"}
                        </button>
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
                    {data?.count ?? 0} practices
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
