"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type AnalyticsSummary = {
  total_clicks: number;
  top_urls: Array<{
    url: string;
    clicks: number;
  }>;
  clicks_by_practice: Array<{
    practice__name: string;
    practice__id: number;
    clicks: number;
  }>;
  daily_activity: Array<{
    date: string;
    clicks: number;
  }>;
  recent_clicks: Array<{
    url: string;
    practice__name: string;
    clicked_at: string;
  }>;
  date_range: {
    start_date: string | null;
    end_date: string | null;
  };
};

type PracticeAnalytics = {
  practice: {
    id: number;
    name: string;
    specialty: string;
    website: string;
  };
  total_clicks: number;
  top_urls: Array<{
    url: string;
    clicks: number;
  }>;
  daily_activity: Array<{
    date: string;
    clicks: number;
  }>;
  recent_clicks: Array<{
    url: string;
    clicked_at: string;
  }>;
  date_range: {
    start_date: string | null;
    end_date: string | null;
  };
};

export default function AnalyticsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken);

  const [dateRange, setDateRange] = useState({
    start_date: null as string | null,
    end_date: null as string | null,
  });
  const [selectedPracticeId, setSelectedPracticeId] = useState<number | null>(
    null
  );

  const authorizedFetcher = useCallback(
    async (url: string) => {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      return response.json();
    },
    [accessToken]
  );

  // Build query parameters for analytics endpoints
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (dateRange.start_date) params.append("start_date", dateRange.start_date);
    if (dateRange.end_date) params.append("end_date", dateRange.end_date);
    return params.toString();
  }, [dateRange]);

  // Fetch analytics summary
  const {
    data: analyticsData,
    error: analyticsError,
    isLoading: analyticsLoading,
  } = useSWR(
    canQuery
      ? `${baseUrl}/api/v1/analytics/summary?${buildQueryParams()}`
      : null,
    authorizedFetcher
  );

  // Fetch practice-specific analytics
  const {
    data: practiceAnalyticsData,
    error: practiceAnalyticsError,
    isLoading: practiceAnalyticsLoading,
  } = useSWR(
    canQuery && selectedPracticeId
      ? `${baseUrl}/api/v1/analytics/practice/${selectedPracticeId}?${buildQueryParams()}`
      : null,
    authorizedFetcher
  );

  // Fetch practices list
  const { data: practicesData } = useSWR(
    canQuery ? `${baseUrl}/api/v1/data/practices` : null,
    authorizedFetcher
  );

  const analytics: AnalyticsSummary | null = analyticsData || null;
  const practiceAnalytics: PracticeAnalytics | null =
    practiceAnalyticsData || null;
  const practices = practicesData?.results || [];

  const handleDateRangeChange = useCallback(
    (field: "start_date" | "end_date", value: string) => {
      setDateRange((prev) => ({
        ...prev,
        [field]: value || null,
      }));
    },
    []
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="rounded-[32px] border border-white/70 bg-white/80 px-8 py-10 shadow-2xl shadow-blue-500/10 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Analytics
            </span>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-slate-900">
                Engagement Analytics
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Track how clients discover and engage with your practice through
                AI-powered chat interactions.
              </p>
            </div>
          </div>
        </div>
        {!canQuery && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            Set NEXT_PUBLIC_API_BASE_URL and authenticate to load live data.
          </p>
        )}
      </header>

      {/* Date Range Filter */}
      <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-blue-500/10 backdrop-blur">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">
              Date Range
            </span>
            <span className="text-lg font-semibold text-slate-900">
              Filter Period
            </span>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                Start Date
              </span>
              <input
                type="date"
                value={dateRange.start_date || ""}
                onChange={(e) =>
                  handleDateRangeChange("start_date", e.target.value)
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                End Date
              </span>
              <input
                type="date"
                value={dateRange.end_date || ""}
                onChange={(e) =>
                  handleDateRangeChange("end_date", e.target.value)
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600 opacity-0">
                Clear
              </span>
              <button
                onClick={() =>
                  setDateRange({ start_date: null, end_date: null })
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Selector */}
      {practices.length > 1 && (
        <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Practice Filter
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPracticeId(null)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedPracticeId === null
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                All Practices
              </button>
              {practices.map((practice: any) => (
                <button
                  key={practice.id}
                  onClick={() => setSelectedPracticeId(practice.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedPracticeId === practice.id
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {practice.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Analytics Overview */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Clicks</p>
              <p className="text-3xl font-bold text-slate-900">
                {analyticsLoading ? "..." : analytics?.total_clicks || 0}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Top URLs</p>
              <p className="text-3xl font-bold text-slate-900">
                {analyticsLoading ? "..." : analytics?.top_urls?.length || 0}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Active Practices
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {analyticsLoading
                  ? "..."
                  : analytics?.clicks_by_practice?.length || 0}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top URLs */}
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Top URLs
          </h2>
          {analyticsError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Unable to load analytics data.
            </p>
          )}
          {analyticsLoading && (
            <p className="text-sm text-slate-500">Loading analytics...</p>
          )}
          {!analyticsLoading && analytics?.top_urls?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500">
              No URL clicks tracked yet.
            </p>
          )}
          {analytics?.top_urls && analytics.top_urls.length > 0 && (
            <ul className="space-y-3">
              {analytics.top_urls.map((item, index) => (
                <li
                  key={item.url}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 text-sm text-slate-700 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                      {index + 1}
                    </span>
                    <span className="truncate pr-4" title={item.url}>
                      {getHostname(item.url)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.clicks} clicks
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Clicks by Practice */}
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Clicks by Practice
          </h2>
          {analyticsError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Unable to load analytics data.
            </p>
          )}
          {analyticsLoading && (
            <p className="text-sm text-slate-500">Loading analytics...</p>
          )}
          {!analyticsLoading && analytics?.clicks_by_practice?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500">
              No practice clicks tracked yet.
            </p>
          )}
          {analytics?.clicks_by_practice &&
            analytics.clicks_by_practice.length > 0 && (
              <ul className="space-y-3">
                {analytics.clicks_by_practice.map((item, index) => (
                  <li
                    key={item.practice__id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 text-sm text-slate-700 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-600">
                        {index + 1}
                      </span>
                      <span
                        className="truncate pr-4"
                        title={item.practice__name}
                      >
                        {item.practice__name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.clicks} clicks
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Recent Activity
          </h2>
          {analyticsError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Unable to load recent activity.
            </p>
          )}
          {analyticsLoading && (
            <p className="text-sm text-slate-500">Loading recent activity...</p>
          )}
          {!analyticsLoading && analytics?.recent_clicks?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500">
              No recent activity.
            </p>
          )}
          {analytics?.recent_clicks && analytics.recent_clicks.length > 0 && (
            <ul className="space-y-3">
              {analytics.recent_clicks.map((item, index) => (
                <li
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 text-sm text-slate-700 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {item.practice__name}
                      </p>
                      <p
                        className="text-xs text-slate-500 truncate"
                        title={item.url}
                      >
                        {getHostname(item.url)}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDateTime(item.clicked_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Daily Activity Chart */}
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Daily Activity
          </h2>
          {analyticsError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Unable to load daily activity.
            </p>
          )}
          {analyticsLoading && (
            <p className="text-sm text-slate-500">Loading daily activity...</p>
          )}
          {!analyticsLoading && analytics?.daily_activity?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500">
              No daily activity data available.
            </p>
          )}
          {analytics?.daily_activity && analytics.daily_activity.length > 0 && (
            <div className="space-y-4">
              {/* Line Chart */}
              <div className="relative h-64 w-full">
                <svg
                  className="h-full w-full"
                  viewBox="0 0 400 200"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Grid lines */}
                  <defs>
                    <pattern
                      id="grid"
                      width="40"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 20"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Chart area */}
                  <g transform="translate(40, 20)">
                    {/* Data points and line */}
                    {(() => {
                      const data = analytics.daily_activity.slice(-7);
                      const maxValue = Math.max(...data.map((d) => d.clicks));
                      const width = 320;
                      const height = 160;
                      const padding = 20;
                      const chartWidth = width - padding * 2;
                      const chartHeight = height - padding * 2;

                      // Use the same scaling logic as Y-axis labels
                      let chartMaxValue = maxValue;
                      if (maxValue <= 2) {
                        chartMaxValue = 2;
                      } else if (maxValue <= 5) {
                        chartMaxValue = 5;
                      } else if (maxValue <= 10) {
                        chartMaxValue = 10;
                      } else {
                        chartMaxValue = Math.ceil(maxValue / 5) * 5;
                      }

                      const pathData = data
                        .map((item, index) => {
                          const x =
                            (index / (data.length - 1)) * chartWidth + padding;
                          const y =
                            height -
                            padding -
                            (item.clicks / chartMaxValue) * chartHeight;
                          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ");

                      return (
                        <>
                          {/* Line */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Data points */}
                          {data.map((item, index) => {
                            const x =
                              (index / (data.length - 1)) * chartWidth +
                              padding;
                            const y =
                              height -
                              padding -
                              (item.clicks / chartMaxValue) * chartHeight;
                            return (
                              <g key={index}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="4"
                                  fill="#3b82f6"
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="8"
                                  fill="#3b82f6"
                                  fillOpacity="0.2"
                                />
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </g>

                  {/* Y-axis labels */}
                  {(() => {
                    const data = analytics.daily_activity.slice(-7);
                    const maxValue = Math.max(...data.map((d) => d.clicks));

                    // Create meaningful Y-axis labels
                    let labels = [];
                    if (maxValue === 0) {
                      labels = [0];
                    } else if (maxValue <= 2) {
                      labels = [0, 1, 2];
                    } else if (maxValue <= 5) {
                      labels = [0, 1, 2, 3, 4, 5];
                    } else if (maxValue <= 10) {
                      labels = [0, 2, 4, 6, 8, 10];
                    } else {
                      // For larger values, use 5 steps
                      const step = Math.ceil(maxValue / 5);
                      labels = [];
                      for (let i = 0; i <= 5; i++) {
                        labels.push(i * step);
                      }
                    }

                    return labels.map((value, i) => {
                      const y =
                        20 +
                        (160 - 20) -
                        (i / (labels.length - 1)) * (160 - 20);
                      return (
                        <g key={i}>
                          <text
                            x="35"
                            y={y + 4}
                            textAnchor="end"
                            className="text-xs fill-slate-500"
                          >
                            {value}
                          </text>
                          <line
                            x1="40"
                            y1={y}
                            x2="360"
                            y2={y}
                            stroke="#e2e8f0"
                            strokeWidth="0.5"
                          />
                        </g>
                      );
                    });
                  })()}

                  {/* X-axis labels */}
                  {analytics.daily_activity.slice(-7).map((item, index) => {
                    const x =
                      40 +
                      (index /
                        (analytics.daily_activity.slice(-7).length - 1)) *
                        320;
                    return (
                      <text
                        key={index}
                        x={x}
                        y="195"
                        textAnchor="middle"
                        className="text-xs fill-slate-500"
                      >
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Total Clicks</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {analytics.daily_activity.reduce(
                      (sum, item) => sum + item.clicks,
                      0
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Average/Day</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {Math.round(
                      analytics.daily_activity.reduce(
                        (sum, item) => sum + item.clicks,
                        0
                      ) / analytics.daily_activity.length
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Peak Day</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {Math.max(...analytics.daily_activity.map((d) => d.clicks))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
