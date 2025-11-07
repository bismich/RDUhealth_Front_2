"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type User = {
  id: number;
  supabase_id: string;
  email: string;
  role: "user" | "admin";
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_status: {
    status: string;
    plan: string;
    is_active: boolean;
    trial_ends_at: string | null;
    current_period_end: string | null;
  } | null;
  practices_count: number;
  total_chat_sessions: number;
  total_url_clicks: number;
};

type UsersResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
};

export default function UsersPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken && role === "admin");

  const [filters, setFilters] = useState({
    role: "",
    is_active: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (filters.role) params.append("role", filters.role);
    if (filters.is_active) params.append("is_active", filters.is_active);
    if (filters.search) params.append("search", filters.search);
    params.append("page", currentPage.toString());

    return `${baseUrl}/api/v1/admin/users/?${params.toString()}`;
  };

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Unable to load users");
    }
    return (await response.json()) as UsersResponse;
  };

  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    canQuery ? buildUrl() : null,
    fetcher
  );

  const users = useMemo(() => data?.results ?? [], [data]);
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

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/admin/users/${userId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        mutate();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userEmail}"? This action cannot be undone and will delete all associated data (practices, subscriptions, chat sessions, etc.).`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/admin/users/${userId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        mutate(); // Refresh the user list
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to delete user";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("An error occurred while deleting the user. Please try again.");
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
            User Management
          </h1>
          <p className="text-sm text-slate-600">
            Manage user accounts, roles, and subscription status.
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
            Unable to load users. Try again shortly.
          </p>
        )}
      </header>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
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
              placeholder="Search by email or name..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No users found matching your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Activity
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {user.full_name || user.email}
                          </div>
                          <div className="text-sm text-slate-500">
                            {user.email}
                          </div>
                          <div className="text-xs text-slate-400">
                            Joined{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription_status ? (
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {user.subscription_status.plan}
                            </div>
                            <div
                              className={`text-xs ${
                                user.subscription_status.is_active
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {user.subscription_status.status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No subscription
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          <div>{user.practices_count} practices</div>
                          <div>{user.total_chat_sessions} sessions</div>
                          <div>{user.total_url_clicks} clicks</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              toggleUserStatus(user.id, user.is_active)
                            }
                            className={`text-sm font-medium ${
                              user.is_active
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
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
                    {data?.count ?? 0} users
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
