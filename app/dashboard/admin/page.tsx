"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";

import { useAppSelector } from "@/store/hooks";

// Simple Line Graph Component
function LineGraph({
  data,
}: {
  data: Array<{ date: string; clicks: number }>;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    date: string;
    clicks: number;
  } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  const maxClicks = Math.max(...data.map((d) => d.clicks));
  const width = 400;
  const height = 200;
  const padding = 40;

  // Create SVG path for the line
  const points = data.map((point, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
    const y =
      height - padding - (point.clicks / maxClicks) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  const handlePointHover = (
    point: { date: string; clicks: number },
    index: number
  ) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
    const y =
      height - padding - (point.clicks / maxClicks) * (height - 2 * padding);
    setHoveredPoint({ x, y, date: point.date, clicks: point.clicks });
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="w-full relative">
      <svg width={width} height={height} className="w-full max-w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padding - ratio * (height - 2 * padding);
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padding - ratio * (height - 2 * padding);
          const value = Math.round(maxClicks * ratio);
          return (
            <text
              key={ratio}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-slate-500"
            >
              {value}
            </text>
          );
        })}

        {/* X-axis labels (every 5th day) */}
        {data.map((point, index) => {
          if (index % 5 === 0) {
            const x =
              padding + (index * (width - 2 * padding)) / (data.length - 1);
            const date = new Date(point.date);
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            return (
              <text
                key={index}
                x={x}
                y={height - padding + 20}
                textAnchor="middle"
                className="text-xs fill-slate-500"
              >
                {label}
              </text>
            );
          }
          return null;
        })}

        {/* Line path */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x =
            padding + (index * (width - 2 * padding)) / (data.length - 1);
          const y =
            height -
            padding -
            (point.clicks / maxClicks) * (height - 2 * padding);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={3}
              fill="#3b82f6"
              className="hover:r-4 transition-all cursor-pointer"
              onMouseEnter={() => handlePointHover(point, index)}
              onMouseLeave={handlePointLeave}
            />
          );
        })}
      </svg>

      {/* Hover Popover */}
      {hoveredPoint && (
        <div
          className="absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
          style={{
            left: `${hoveredPoint.x - 60}px`,
            top: `${hoveredPoint.y - 50}px`,
            pointerEvents: "none",
          }}
        >
          <div className="text-xs font-medium text-slate-900">
            {new Date(hoveredPoint.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-slate-600">
            {hoveredPoint.clicks} clicks
          </div>
        </div>
      )}
    </div>
  );
}

type AdminStats = {
  total_users: number;
  active_users: number;
  total_subscriptions: number;
  active_subscriptions: number;
  total_practices: number;
  active_practices: number;
  total_chat_sessions: number;
  total_messages: number;
  total_url_clicks: number;
  total_contact_submissions: number;
  unhandled_contact_submissions: number;
  revenue_data: {
    monthly_revenue: number;
    annual_revenue: number;
    active_subscriptions: number;
    trial_subscriptions: number;
  };
  user_growth_data: {
    new_users_30_days: number;
    new_users_7_days: number;
    new_users_today: number;
  };
  chat_activity_data: {
    sessions_30_days: number;
    sessions_7_days: number;
    messages_30_days: number;
    messages_7_days: number;
  };
  url_clicks_analytics: Array<{
    date: string;
    clicks: number;
  }>;
};

export default function AdminDashboardPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const canQuery = Boolean(baseUrl && accessToken && role === "admin");

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Unable to load admin stats");
    }
    return (await response.json()) as AdminStats;
  };

  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<AdminStats>(
    canQuery ? `${baseUrl}/api/v1/admin/dashboard/stats/` : null,
    fetcher
  );

  const statCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Total Users",
        value: stats.total_users,
        subtitle: `${stats.active_users} active`,
        icon: "👥",
        color: "blue",
        href: "/dashboard/admin/users",
      },
      {
        title: "Subscriptions",
        value: stats.total_subscriptions,
        subtitle: `${stats.active_subscriptions} active`,
        icon: "💳",
        color: "green",
        href: "/dashboard/admin/subscriptions",
      },
      {
        title: "Practices",
        value: stats.total_practices,
        subtitle: `${stats.active_practices} active`,
        icon: "🏥",
        color: "purple",
        href: "/dashboard/admin/practices",
      },
      {
        title: "Chat Sessions",
        value: stats.total_chat_sessions,
        subtitle: `${stats.chat_activity_data.sessions_7_days} this week`,
        icon: "💬",
        color: "indigo",
        href: "/dashboard/admin/chat-sessions",
      },
      {
        title: "Messages",
        value: stats.total_messages,
        subtitle: `${stats.chat_activity_data.messages_7_days} this week`,
        icon: "📝",
        color: "pink",
        href: "/dashboard/admin/chat-messages",
      },
      {
        title: "URL Clicks",
        value: stats.total_url_clicks,
        subtitle: "Total tracked clicks",
        icon: "🔗",
        color: "orange",
        href: "/dashboard/admin/url-clicks",
      },
      {
        title: "Contact Submissions",
        value: stats.total_contact_submissions,
        subtitle: `${stats.unhandled_contact_submissions} unhandled`,
        icon: "📧",
        color: "red",
        href: "/dashboard/admin/contact-submissions",
      },
    ];
  }, [stats]);

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
    <div className="space-y-8">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Monitor and manage your RDU SaaS platform from this central hub.
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
            Unable to load dashboard data. Try again shortly.
          </p>
        )}
      </header>

      {/* Stats Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="animate-pulse">
                  <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))
          : statCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{card.icon}</span>
                      <h3 className="text-sm font-medium text-slate-600">
                        {card.title}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      {card.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">{card.subtitle}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
      </section>

      {/* Growth Metrics */}
      {stats && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              User Growth
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  New users (30 days)
                </span>
                <span className="text-lg font-semibold text-slate-900">
                  {stats.user_growth_data.new_users_30_days}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  New users (7 days)
                </span>
                <span className="text-lg font-semibold text-slate-900">
                  {stats.user_growth_data.new_users_7_days}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  New users (today)
                </span>
                <span className="text-lg font-semibold text-slate-900">
                  {stats.user_growth_data.new_users_today}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Chat Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Sessions (30 days)
                </span>
                <span className="text-lg font-semibold text-slate-900">
                  {stats.chat_activity_data.sessions_30_days}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Sessions (7 days)
                </span>
                <span className="text-lg font-semibold text-slate-900">
                  {stats.chat_activity_data.sessions_7_days}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Messages (7 days)
                </span>
                <span className="text-lg font-semibold text-slate-900">
                  {stats.chat_activity_data.messages_7_days}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* URL Clicks Analytics */}
      {stats && stats.url_clicks_analytics && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              URL Clicks Analytics (Last 30 Days)
            </h3>
            <Link
              href="/dashboard/admin/url-clicks"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Details →
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Total clicks (30 days)
              </span>
              <span className="text-lg font-semibold text-slate-900">
                {stats.url_clicks_analytics.reduce(
                  (sum, day) => sum + day.clicks,
                  0
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Average per day</span>
              <span className="text-lg font-semibold text-slate-900">
                {Math.round(
                  stats.url_clicks_analytics.reduce(
                    (sum, day) => sum + day.clicks,
                    0
                  ) / 30
                )}
              </span>
            </div>
            <div className="mt-6">
              <LineGraph data={stats.url_clicks_analytics} />
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/admin/users"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Manage Users</h4>
              <p className="text-sm text-slate-500">
                View and edit user accounts
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/subscriptions"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Subscriptions</h4>
              <p className="text-sm text-slate-500">Manage billing and plans</p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/practices"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <svg
                className="h-5 w-5 text-purple-600"
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
            <div>
              <h4 className="font-medium text-slate-900">Practices</h4>
              <p className="text-sm text-slate-500">Manage practice profiles</p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/contact-submissions"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Contact Inbox</h4>
              <p className="text-sm text-slate-500">Handle inquiries</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
