"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type SubscriptionResponse = {
  plan: "fixed" | "cta";
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  billingEnforcementDate: string;
  trialDays: number;
  stripePublishableKey?: string;
};

const planDescriptions: Record<SubscriptionResponse["plan"], string> = {
  fixed: "Flat monthly rate with unlimited CTA tracking for the main platform.",
  cta: "One-time payment for external CTA services based on the number of spots.",
};

export default function BillingPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken } = useAppSelector((state) => state.auth);
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionResponse["plan"]>("fixed");
  const [ctaSpots, setCtaSpots] = useState<number>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);
  const [isPortalLoading, setIsPortalLoading] = useState<boolean>(false);
  const canQuery = Boolean(baseUrl && accessToken);

  const fetcher = useCallback(
    async (url: string) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new Error("Unable to load subscription");
      }
      return response.json() as Promise<SubscriptionResponse>;
    },
    [accessToken]
  );

  const {
    data: subscription,
    error,
    isLoading,
  } = useSWR(
    canQuery ? `${baseUrl}/api/v1/billing/subscription` : null,
    fetcher,
    {
      onSuccess(data) {
        setSelectedPlan(data.plan);
      },
    }
  );

  const statusBadge = useMemo(() => {
    if (!subscription) {
      return null;
    }
    const status = subscription.status ?? "unknown";
    const baseClass =
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
    if (status === "active") {
      return (
        <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>
          Active
        </span>
      );
    }
    if (status === "trialing") {
      return (
        <span className={`${baseClass} bg-blue-100 text-blue-700`}>
          Trialing
        </span>
      );
    }
    if (status === "past_due") {
      return (
        <span className={`${baseClass} bg-amber-100 text-amber-700`}>
          Past due
        </span>
      );
    }
    return (
      <span className={`${baseClass} bg-slate-200 text-slate-700`}>
        {status}
      </span>
    );
  }, [subscription]);

  const handleCheckout = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canQuery || isCheckoutLoading) {
        return;
      }

      setIsCheckoutLoading(true);
      setMessage(null);

      const requestData =
        selectedPlan === "cta"
          ? { plan: selectedPlan, ctaSpots: ctaSpots }
          : { plan: selectedPlan };

      try {
        const response = await fetch(`${baseUrl}/api/v1/billing/checkout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setMessage(payload.detail ?? "Unable to start checkout session");
          return;
        }

        const payload = await response.json();
        if (payload.checkoutUrl) {
          window.location.href = payload.checkoutUrl as string;
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setMessage("Network error occurred");
      } finally {
        setIsCheckoutLoading(false);
      }
    },
    [accessToken, baseUrl, canQuery, selectedPlan, ctaSpots, isCheckoutLoading]
  );

  const handlePortal = useCallback(async () => {
    if (!canQuery || isPortalLoading) {
      return;
    }

    setIsPortalLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/v1/billing/portal`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.detail ?? "Unable to open billing portal");
        return;
      }
      const payload = await response.json();
      if (payload.portalUrl) {
        window.location.href = payload.portalUrl as string;
      }
    } catch (error) {
      console.error("Portal error:", error);
      setMessage("Network error occurred");
    } finally {
      setIsPortalLoading(false);
    }
  }, [accessToken, baseUrl, canQuery, isPortalLoading]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 md:flex-row flex-col">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">
              Billing &amp; subscription
            </h1>
            <p className="text-slate-600">
              Choose the right plan for your practice. Billing enforcement
              starts on {subscription?.billingEnforcementDate}.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to dashboard
          </Link>
        </div>
        {!canQuery && (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Set NEXT_PUBLIC_API_BASE_URL and ensure you are authenticated to
            manage billing.
          </p>
        )}
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            Unable to load current subscription. Retry in a moment.
          </p>
        )}
        {message && (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {message}
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Subscription status
            </h2>
            <p className="text-sm text-slate-600">
              {subscription?.trialEndsAt
                ? `Trial ends on ${new Date(
                    subscription.trialEndsAt
                  ).toLocaleDateString()}`
                : subscription?.currentPeriodEnd
                ? `Current period renews on ${new Date(
                    subscription.currentPeriodEnd
                  ).toLocaleDateString()}`
                : "Activate a plan to unlock premium features."}
            </p>
          </div>
          {statusBadge}
        </div>
      </section>

      <form
        className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleCheckout}
      >
        <h2 className="text-2xl font-semibold text-slate-900">Select a plan</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {["fixed", "cta"].map((plan) => (
            <label
              key={plan}
              className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition ${
                selectedPlan === plan
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-slate-900">
                    {plan === "fixed" ? "Fixed Plan" : "CTA Service"}
                  </span>
                  <p className="text-sm text-slate-600">
                    {planDescriptions[plan as SubscriptionResponse["plan"]]}
                  </p>
                </div>
                <input
                  type="radio"
                  name="plan"
                  value={plan}
                  checked={selectedPlan === plan}
                  onChange={() =>
                    setSelectedPlan(plan as SubscriptionResponse["plan"])
                  }
                  className="h-4 w-4"
                />
              </div>
              {plan === "cta" && selectedPlan === "cta" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    CTA Spots
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={ctaSpots}
                    onChange={(event) =>
                      setCtaSpots(Number(event.target.value) || 1)
                    }
                    className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring"
                  />
                </div>
              )}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>
            Free usage is available until {subscription?.billingEnforcementDate}
            . We automatically honour a {subscription?.trialDays}-day trial once
            billing begins.
          </span>
          <button
            type="submit"
            disabled={isCheckoutLoading || !canQuery}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isCheckoutLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Start checkout"
            )}
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">
          Manage billing
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Update payment details, download invoices, or cancel your subscription
          anytime from the Stripe billing portal.
        </p>
        <button
          type="button"
          onClick={handlePortal}
          disabled={isPortalLoading || !canQuery}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-900 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPortalLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></div>
              <span>Opening...</span>
            </div>
          ) : (
            "Open billing portal"
          )}
        </button>
      </section>
    </div>
  );
}
