"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type Subscription = {
  id: number;
  owner: number;
  owner_email: string;
  owner_name: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: "fixed" | "cta";
  status: "active" | "trialing" | "past_due" | "canceled";
  trial_ends_at: string | null;
  current_period_end: string | null;
  stripe_price_id: string;
  created_at: string;
  updated_at: string;
};

type SubscriptionsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subscription[];
};

export default function SubscriptionsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken && role === "admin");

  const [filters, setFilters] = useState({
    status: "",
    plan: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.plan) params.append("plan", filters.plan);
    if (filters.search) params.append("search", filters.search);
    params.append("page", currentPage.toString());

    return `${baseUrl}/api/v1/admin/subscriptions/?${params.toString()}`;
  };

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Unable to load subscriptions");
    }
    return (await response.json()) as SubscriptionsResponse;
  };

  const { data, error, isLoading } = useSWR<SubscriptionsResponse>(
    canQuery ? buildUrl() : null,
    fetcher
  );

  const subscriptions = useMemo(() => data?.results ?? [], [data]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "fixed":
        return "bg-purple-100 text-purple-800";
      case "cta":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            Subscription Management
          </h1>
          <p className="text-sm text-slate-600">
            Monitor and manage user subscriptions and billing.
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
            Unable to load subscriptions. Try again shortly.
          </p>
        )}
      </header>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Plan
            </label>
            <select
              value={filters.plan}
              onChange={(e) => handleFilterChange("plan", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Plans</option>
              <option value="fixed">Fixed</option>
              <option value="cta">CTA Service</option>
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
              placeholder="Search by email..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Subscriptions Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No subscriptions found matching your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Stripe ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {subscription.owner_name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {subscription.owner_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(
                            subscription.plan
                          )}`}
                        >
                          {subscription.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            subscription.status
                          )}`}
                        >
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {subscription.trial_ends_at && (
                            <div>
                              Trial ends:{" "}
                              {new Date(
                                subscription.trial_ends_at
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {subscription.current_period_end && (
                            <div>
                              Period ends:{" "}
                              {new Date(
                                subscription.current_period_end
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {new Date(
                            subscription.created_at
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-400 font-mono">
                          {subscription.stripe_subscription_id || "N/A"}
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
                    {data?.count ?? 0} subscriptions
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
