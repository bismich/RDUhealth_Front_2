"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type CTAPayment = {
  id: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  amount: string;
  currency: string;
  cta_spots: number;
  status: "pending" | "completed" | "failed" | "refunded";
  service_description: string;
  notes: string;
  stripe_payment_intent_id: string;
  stripe_customer_id: string;
  stripe_session_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

type CTAPaymentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CTAPayment[];
};

export default function CTAPaymentsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken && role === "admin");

  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    params.append("page", currentPage.toString());

    return `${baseUrl}/api/v1/admin/cta-payments/?${params.toString()}`;
  };

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Unable to load CTA payments");
    }
    return (await response.json()) as CTAPaymentsResponse;
  };

  const { data, error, isLoading } = useSWR<CTAPaymentsResponse>(
    canQuery ? buildUrl() : null,
    fetcher
  );

  const payments = useMemo(() => data?.results ?? [], [data]);
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
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CTA Payments</h1>
          <p className="mt-2 text-slate-600">
            Manage external CTA service payments
          </p>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
        <div className="grid gap-4 md:grid-cols-2">
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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
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

      {/* Payments Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No CTA payments found matching your criteria.
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
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      CTA Spots
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Service
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
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {payment.customer_name || "N/A"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {payment.customer_email}
                          </div>
                          {payment.customer_phone && (
                            <div className="text-sm text-slate-500">
                              {payment.customer_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {payment.currency}{" "}
                          {payment.amount
                            ? parseFloat(`${payment.amount}`).toFixed(2)
                            : "0.00"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {payment.cta_spots}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 max-w-xs truncate">
                          {payment.service_description || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                        {payment.completed_at && (
                          <div className="text-xs text-slate-500">
                            Completed:{" "}
                            {new Date(
                              payment.completed_at
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 font-mono">
                          {payment.stripe_payment_intent_id || "N/A"}
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
                  <div className="text-sm text-slate-600">
                    Showing {(currentPage - 1) * 25 + 1} to{" "}
                    {Math.min(currentPage * 25, data?.count ?? 0)} of{" "}
                    {data?.count ?? 0} payments
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
          <p className="text-red-600">
            Unable to load CTA payments. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
}
