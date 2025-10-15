"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useAppSelector } from "@/store/hooks";

type NavLink = {
  href: string;
  label: string;
};

type AdminLink = {
  href: string;
  label: string;
  icon: string;
};

function DashboardNavLink({
  href,
  label,
  isActive,
}: NavLink & { isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        isActive
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

function AdminDropdown({ pathname }: { pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const adminLinks: AdminLink[] = [
    { href: "/dashboard/admin", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/admin/users", label: "Users", icon: "👥" },
    {
      href: "/dashboard/admin/subscriptions",
      label: "Subscriptions",
      icon: "💳",
    },
    { href: "/dashboard/admin/practices", label: "Practices", icon: "🏥" },
    {
      href: "/dashboard/admin/chat-sessions",
      label: "Chat Sessions",
      icon: "💬",
    },
    { href: "/dashboard/admin/chat-messages", label: "Messages", icon: "📝" },
    { href: "/dashboard/admin/url-clicks", label: "URL Clicks", icon: "🔗" },
    {
      href: "/dashboard/admin/contact-submissions",
      label: "Contact Inbox",
      icon: "📧",
    },
  ];

  const isAdminActive = adminLinks.some((link) => pathname === link.href);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
    setIsOpen(!isOpen);
  };

  const dropdownContent = isOpen && mounted && buttonRect && (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />

      {/* Dropdown */}
      <div
        className="fixed z-[9999] w-64 rounded-lg border border-slate-200 bg-white shadow-xl"
        style={{
          top: buttonRect.bottom + 8,
          left: buttonRect.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin Panel
          </div>
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-purple-50 text-purple-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-purple-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
          isAdminActive
            ? "bg-purple-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <span>⚙️</span>
        <span>Admin</span>
        <svg
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {mounted &&
        dropdownContent &&
        createPortal(dropdownContent, document.body)}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, role } = useAppSelector((state) => state.auth);

  const navLinks = useMemo<NavLink[]>(() => {
    const links: NavLink[] = [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/analytics", label: "Analytics" },
      { href: "/dashboard/billing", label: "Billing" },
      { href: "/dashboard/profile", label: "Profile" },
    ];
    return links;
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    // AuthProvider will automatically handle clearing the session
    router.replace("/login");
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-slate-50/60">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold text-slate-900">
                RDU RAG SaaS
              </Link>
              <nav className="hidden items-center gap-1 md:flex">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <DashboardNavLink
                      key={link.href}
                      {...link}
                      isActive={active}
                    />
                  );
                })}
                {role === "admin" && <AdminDropdown pathname={pathname} />}
              </nav>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              {role === "admin" && (
                <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 sm:inline">
                  Admin
                </span>
              )}
              {email && (
                <span className="hidden sm:inline text-slate-500">{email}</span>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>
        <nav className="md:hidden border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <DashboardNavLink key={link.href} {...link} isActive={active} />
              );
            })}
            {role === "admin" && <AdminDropdown pathname={pathname} />}
          </div>
        </nav>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
