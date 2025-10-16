"use client";

import { useCallback, useState } from "react";

type CTAPaymentRequest = {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  currency: string;
  cta_spots: number;
  service_description: string;
};

export default function CTAPaymentPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const [formData, setFormData] = useState<CTAPaymentRequest>({
    customer_email: "",
    customer_name: "",
    customer_phone: "",
    amount: 0,
    currency: "USD",
    cta_spots: 1,
    service_description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof CTAPaymentRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!baseUrl) {
        setMessage("API base URL not configured");
        return;
      }

      setIsLoading(true);
      setMessage(null);

      try {
        const response = await fetch(`${baseUrl}/api/v1/billing/cta-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setMessage(payload.detail ?? "Unable to create payment session");
          return;
        }

        const payload = await response.json();
        if (payload.checkoutUrl) {
          window.location.href = payload.checkoutUrl as string;
        }
      } catch (error) {
        setMessage("Network error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl, formData]
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              CTA Service Payment
            </h1>
            <p className="mt-2 text-slate-600">
              Complete your payment for our external CTA service.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="customer_email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="customer_email"
                  required
                  value={formData.customer_email}
                  onChange={(e) =>
                    handleInputChange("customer_email", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring"
                />
              </div>

              <div>
                <label
                  htmlFor="customer_name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    handleInputChange("customer_name", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring"
                />
              </div>

              <div>
                <label
                  htmlFor="customer_phone"
                  className="block text-sm font-medium text-slate-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) =>
                    handleInputChange("customer_phone", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring"
                />
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-slate-700"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    handleInputChange("currency", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-slate-700"
                >
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    handleInputChange("amount", parseFloat(e.target.value) || 0)
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring"
                />
              </div>

              <div>
                <label
                  htmlFor="cta_spots"
                  className="block text-sm font-medium text-slate-700"
                >
                  CTA Spots *
                </label>
                <input
                  type="number"
                  id="cta_spots"
                  required
                  min="1"
                  value={formData.cta_spots}
                  onChange={(e) =>
                    handleInputChange(
                      "cta_spots",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="service_description"
                className="block text-sm font-medium text-slate-700"
              >
                Service Description
              </label>
              <textarea
                id="service_description"
                rows={3}
                value={formData.service_description}
                onChange={(e) =>
                  handleInputChange("service_description", e.target.value)
                }
                placeholder="Describe the CTA service you're purchasing..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-sm text-slate-600">
                <p className="font-medium">Payment Summary</p>
                <p>
                  {formData.cta_spots} CTA spots × {formData.currency}{" "}
                  {formData.amount}
                </p>
              </div>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.customer_email ||
                  !formData.amount ||
                  !formData.cta_spots
                }
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isLoading ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
