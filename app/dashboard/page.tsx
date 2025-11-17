"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";

type Practice = {
  id: number;
  name: string;
  description: string;
  website: string;
  specialty: string;
  address: string;
  phone_number: string;
  email: string;
  credentials_and_npi: string;
  practice_type: string[];
  primary_location: string;
  other_location: string;
  offer_medication_management: boolean | null;
  types_of_therapy: string[];
  services: string;
  practice_details: string;
  patient_types: string[];
  ethnicity: string[];
  gender_identity: string[];
  additional_demographic_details: string;
  accepted_insurance_plans: string;
  self_pay_rate_of_services: string;
  is_accepting_new_patients: boolean;
  is_ada_accessible: boolean;
  see_patient_type: string;
  willing_to_travel: string;
  wait_time: string;
  city: string;
  state: string;
  zip: string;
  fax: string;
  business_hours: string;
  npi: string;
  visibility_packages: string[];
  mental_health_condition: string[];
  cta_message: string;
  public_token: string;
  embedding?: {
    updated_at?: string;
    metadata?: Record<string, unknown>;
  } | null;
};

type PracticeFormState = {
  id: number | null;
  name: string;
  description: string;
  website: string;
  specialty: string;
  address: string;
  phone_number: string;
  email: string;
  credentials_and_npi: string;
  practice_type: string[];
  primary_location: string;
  other_location: string;
  offer_medication_management: boolean | null;
  types_of_therapy: string[];
  services: string;
  practice_details: string;
  patient_types: string[];
  ethnicity: string[];
  gender_identity: string[];
  additional_demographic_details: string;
  accepted_insurance_plans: string;
  self_pay_rate_of_services: string;
  is_accepting_new_patients: boolean;
  is_ada_accessible: boolean;
  see_patient_type: string;
  willing_to_travel: string;
  wait_time: string;
  city: string;
  state: string;
  zip: string;
  fax: string;
  business_hours: string;
  npi: string;
  visibility_packages: string[];
  mental_health_condition: string[];
  cta_message: string;
  public_token: string | null;
  embeddingUpdatedAt: string | null;
  dirty: boolean;
};

type AnalyticsRow = {
  url: string;
  total: number;
};

type AnalyticsData = {
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

const initialFormState = (): PracticeFormState => ({
  id: null,
  name: "",
  description: "",
  website: "",
  specialty: "",
  address: "",
  phone_number: "",
  email: "",
  credentials_and_npi: "",
  practice_type: [],
  primary_location: "",
  other_location: "",
  offer_medication_management: null,
  types_of_therapy: [],
  services: "",
  practice_details: "",
  patient_types: [],
  ethnicity: [],
  gender_identity: [],
  additional_demographic_details: "",
  accepted_insurance_plans: "",
  self_pay_rate_of_services: "",
  is_accepting_new_patients: false,
  is_ada_accessible: false,
  see_patient_type: "",
  willing_to_travel: "",
  wait_time: "",
  city: "",
  state: "",
  zip: "",
  fax: "",
  business_hours: "",
  npi: "",
  visibility_packages: [],
  mental_health_condition: [],
  cta_message: "",
  public_token: null,
  embeddingUpdatedAt: null,
  dirty: false,
});

// Helper functions for multi-select handling
const parseArrayField = (value: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }
  return [];
};

const formatArrayField = (value: string[]): string => {
  return value.join(", ");
};

// Helper functions for select field display values
const getPrimaryLocationDisplay = (value: string): string => {
  const locationMap: Record<string, string> = {
    chapel_hill: "Chapel Hill",
    durham: "Durham",
    raleigh: "Raleigh",
    cary: "Cary",
    morrisville: "Morrisville",
    apex: "Apex",
  };
  return locationMap[value] || value || "Not set";
};

const getGenderIdentityDisplay = (value: string[]): string => {
  if (!value || value.length === 0) return "Not set";
  const genderMap: Record<string, string> = {
    male_only: "Male staff only",
    female_only: "Female staff only",
    both: "Both Male and Female staff",
    non_binary: "Non Binary staff",
  };
  return value.map((v) => genderMap[v] || v).join(", ");
};

const getSeePatientTypeDisplay = (value: string): string => {
  const patientTypeMap: Record<string, string> = {
    in_person_only: "In-Person Only",
    virtual_only: "Virtual Only",
    in_person_virtual: "In-Person and Virtual",
  };
  return patientTypeMap[value] || value || "Not set";
};

const getWillingToTravelDisplay = (value: string): string => {
  const travelMap: Record<string, string> = {
    yes: "Yes",
    no: "No",
    depends: "Yes - Depends on the situation",
  };
  return travelMap[value] || value || "Not set";
};

const getVisibilityPackageDisplay = (value: string): string => {
  const packageMap: Record<string, string> = {
    ai_search_only: "AI Search Tool only ($25/month)",
    cta_spot_1: "Call To Action (CTA) Spot #1 ($28/month)",
    cta_spot_2: "Call To Action (CTA) Spot #2 ($28/month)",
  };
  return packageMap[value] || value || "Not set";
};

const getMentalHealthConditionDisplay = (value: string[]): string => {
  if (!value || value.length === 0) return "Not set";
  const conditionMap: Record<string, string> = {
    depression: "Depression (Major Depressive Disorder)",
    generalized_anxiety: "Generalized Anxiety Disorder (GAD)",
    social_anxiety: "Social Anxiety Disorder",
    ptsd: "Post-Traumatic Stress Disorder (PTSD)",
    ocd: "Obsessive-Compulsive Disorder (OCD)",
    bipolar: "Bipolar Disorder",
    bpd: "Borderline Personality Disorder (BPD)",
    schizophrenia: "Schizophrenia",
    eating_disorders:
      "Eating Disorders (Anorexia, Bulimia, Binge Eating Disorder)",
    dysthymia: "Dysthymia (Persistent Depressive Disorder)",
    specific_phobias: "Specific Phobias",
    agoraphobia: "Agoraphobia",
    substance_use: "Substance Use Disorder",
    autism_spectrum: "Autism Spectrum Disorder (ASD)",
    adjustment_disorder: "Adjustment Disorder",
    insomnia: "Insomnia Disorder",
    somatic_symptom: "Somatic Symptom Disorder",
    histrionic_personality: "Histrionic Personality Disorder",
    panic_disorder: "Panic Disorder",
  };
  return value.map((v) => conditionMap[v] || v).join(", ");
};

const getPracticeTypeDisplay = (value: string[]): string => {
  if (!value || value.length === 0) return "Not set";
  const practiceTypeMap: Record<string, string> = {
    psychiatry_only: "Psychiatry",
    therapy_only: "Therapy",
    psychiatry_therapy: "Mental Health Counseling",
    other: "Other",
  };
  return value.map((v) => practiceTypeMap[v] || v).join(", ");
};

export default function DashboardPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken, role } = useAppSelector((state) => state.auth);
  const isAdmin = role === "admin";
  const canQuery = Boolean(baseUrl && accessToken);

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

  const {
    data: practiceData,
    error: practiceError,
    isLoading: practiceLoading,
    mutate: mutatePractices,
  } = useSWR(
    canQuery ? `${baseUrl}/api/v1/data/practices` : null,
    authorizedFetcher
  );

  const { data: analyticsData, error: analyticsError } = useSWR(
    canQuery ? `${baseUrl}/api/v1/analytics/summary` : null,
    authorizedFetcher
  );

  const { data: subscriptionData, error: subscriptionError } = useSWR(
    canQuery ? `${baseUrl}/api/v1/billing/subscription/` : null,
    authorizedFetcher
  );

  const practices: Practice[] = useMemo(
    () => (practiceData?.results as Practice[] | undefined) ?? [],
    [practiceData]
  );

  const analytics: AnalyticsRow[] = useMemo(() => {
    if (!analyticsData) return [];
    const data = analyticsData as AnalyticsData;
    return data.top_urls.map((item) => ({
      url: item.url,
      total: item.clicks,
    }));
  }, [analyticsData]);

  const [selectedPracticeId, setSelectedPracticeId] = useState<
    number | "new" | null
  >(null);
  const [formState, setFormState] =
    useState<PracticeFormState>(initialFormState);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [isEditingPractice, setIsEditingPractice] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const canCreateAnother = isAdmin || practices.length === 0;

  useEffect(() => {
    if (selectedPracticeId === "new") {
      if (!canCreateAnother) {
        setSelectedPracticeId(practices[0]?.id ?? null);
        if (!isAdmin && practices.length > 0) {
          setLimitNotice(
            "Your account currently supports one practice. Update your existing listing or contact support to expand access."
          );
        }
        return;
      }
      setFormState(initialFormState());
      setIsEditingPractice(true);
      return;
    }
    const existing = practices.find(
      (practice) => practice.id === selectedPracticeId
    );
    if (existing) {
      setFormState({
        id: existing.id,
        name: existing.name ?? "",
        description: existing.description ?? "",
        website: existing.website ?? "",
        specialty: existing.specialty ?? "",
        address: existing.address ?? "",
        phone_number: existing.phone_number ?? "",
        email: existing.email ?? "",
        credentials_and_npi: existing.credentials_and_npi ?? "",
        practice_type: parseArrayField(existing.practice_type ?? ""),
        primary_location: existing.primary_location ?? "",
        other_location: existing.other_location ?? "",
        offer_medication_management: existing.offer_medication_management,
        types_of_therapy: parseArrayField(existing.types_of_therapy ?? ""),
        services: existing.services ?? "",
        practice_details: existing.practice_details ?? "",
        patient_types: parseArrayField(existing.patient_types ?? ""),
        ethnicity: parseArrayField(existing.ethnicity ?? ""),
        gender_identity: parseArrayField(existing.gender_identity ?? ""),
        additional_demographic_details:
          existing.additional_demographic_details ?? "",
        accepted_insurance_plans: existing.accepted_insurance_plans ?? "",
        self_pay_rate_of_services: existing.self_pay_rate_of_services ?? "",
        is_accepting_new_patients: existing.is_accepting_new_patients ?? false,
        is_ada_accessible: existing.is_ada_accessible ?? false,
        see_patient_type: existing.see_patient_type ?? "",
        willing_to_travel: existing.willing_to_travel ?? "",
        wait_time: existing.wait_time ?? "",
        city: existing.city ?? "",
        state: existing.state ?? "",
        zip: existing.zip ?? "",
        fax: existing.fax ?? "",
        business_hours: existing.business_hours ?? "",
        npi: existing.npi ?? "",
        visibility_packages: existing.visibility_packages ?? [],
        mental_health_condition: parseArrayField(
          existing.mental_health_condition ?? ""
        ),
        cta_message: existing.cta_message ?? "",
        public_token: existing.public_token ?? null,
        embeddingUpdatedAt: existing.embedding?.updated_at ?? null,
        dirty: false,
      });
      setIsEditingPractice(false);
    } else if (practices.length && selectedPracticeId === null) {
      setSelectedPracticeId(practices[0].id);
    }
  }, [canCreateAnother, isAdmin, practices, selectedPracticeId]);

  const handleSavePractice = useCallback(async () => {
    if (!canQuery) {
      return;
    }
    setSaveState("saving");
    try {
      const payload = {
        name: formState.name,
        description: formState.description,
        website: formState.website,
        specialty: formState.specialty,
        address: formState.address,
        phone_number: formState.phone_number,
        email: formState.email,
        credentials_and_npi: formState.credentials_and_npi,
        practice_type: formatArrayField(formState.practice_type),
        primary_location: formState.primary_location,
        other_location: formState.other_location,
        offer_medication_management: formState.offer_medication_management,
        types_of_therapy: formatArrayField(formState.types_of_therapy),
        services: formState.services,
        practice_details: formState.practice_details,
        patient_types: formatArrayField(formState.patient_types),
        ethnicity: formatArrayField(formState.ethnicity),
        gender_identity: formState.gender_identity,
        additional_demographic_details:
          formState.additional_demographic_details,
        accepted_insurance_plans: formState.accepted_insurance_plans,
        self_pay_rate_of_services: formState.self_pay_rate_of_services,
        is_accepting_new_patients: formState.is_accepting_new_patients,
        is_ada_accessible: formState.is_ada_accessible,
        see_patient_type: formState.see_patient_type,
        willing_to_travel: formState.willing_to_travel,
        wait_time: formState.wait_time,
        city: formState.city,
        state: formState.state,
        zip: formState.zip,
        fax: formState.fax,
        business_hours: formState.business_hours,
        npi: formState.npi,
        visibility_packages: formState.visibility_packages,
        mental_health_condition: formState.mental_health_condition,
        cta_message: formState.cta_message,
      };
      const url = formState.id
        ? `${baseUrl}/api/v1/data/practices/${formState.id}/`
        : `${baseUrl}/api/v1/data/practices/`;
      const method = formState.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to save practice");
      }
      const saved: Practice = await response.json();
      setFormState((state) => ({
        ...state,
        id: saved.id,
        public_token: saved.public_token ?? state.public_token,
        embeddingUpdatedAt:
          saved.embedding?.updated_at ?? state.embeddingUpdatedAt,
        dirty: false,
      }));
      setSelectedPracticeId(saved.id);
      setSaveState("saved");
      setIsEditingPractice(false); // Exit editing mode after successful save
      void mutatePractices();
    } catch (error) {
      console.error(error);
      setSaveState("error");
    }
  }, [accessToken, baseUrl, canQuery, formState, mutatePractices]);

  useEffect(() => {
    if (!limitNotice) {
      return;
    }
    const timeout = setTimeout(() => setLimitNotice(null), 5000);
    return () => clearTimeout(timeout);
  }, [limitNotice]);

  useEffect(() => {
    if (!showCopyToast) {
      return;
    }
    const timeout = setTimeout(() => setShowCopyToast(false), 3000);
    return () => clearTimeout(timeout);
  }, [showCopyToast]);

  const updateField = useCallback(
    (field: keyof PracticeFormState, value: string) => {
      setFormState((state) => ({ ...state, [field]: value, dirty: true }));
    },
    []
  );

  const updateArrayField = useCallback(
    (
      field:
        | "practice_type"
        | "patient_types"
        | "ethnicity"
        | "types_of_therapy"
        | "visibility_packages"
        | "gender_identity"
        | "mental_health_condition",
      value: string,
      checked: boolean
    ) => {
      setFormState((state) => {
        const currentArray = state[field];
        const newArray = checked
          ? [...currentArray, value]
          : currentArray.filter((item) => item !== value);
        return { ...state, [field]: newArray, dirty: true };
      });
    },
    []
  );

  const handleNewPractice = useCallback(() => {
    if (canCreateAnother) {
      setLimitNotice(null);
      setSelectedPracticeId("new");
      return;
    }
    setLimitNotice(
      "Your account currently supports one practice. Update your existing listing or contact support to expand access."
    );
  }, [canCreateAnother]);

  const handleEditPractice = useCallback(() => {
    setIsEditingPractice(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditingPractice(false);
    // Reset form to original values
    const existing = practices.find(
      (practice) => practice.id === selectedPracticeId
    );
    if (existing) {
      setFormState({
        id: existing.id,
        name: existing.name ?? "",
        description: existing.description ?? "",
        website: existing.website ?? "",
        specialty: existing.specialty ?? "",
        address: existing.address ?? "",
        phone_number: existing.phone_number ?? "",
        email: existing.email ?? "",
        credentials_and_npi: existing.credentials_and_npi ?? "",
        practice_type: parseArrayField(existing.practice_type ?? ""),
        primary_location: existing.primary_location ?? "",
        other_location: existing.other_location ?? "",
        offer_medication_management: existing.offer_medication_management,
        types_of_therapy: parseArrayField(existing.types_of_therapy ?? ""),
        services: existing.services ?? "",
        practice_details: existing.practice_details ?? "",
        patient_types: parseArrayField(existing.patient_types ?? ""),
        ethnicity: parseArrayField(existing.ethnicity ?? ""),
        gender_identity: parseArrayField(existing.gender_identity ?? ""),
        additional_demographic_details:
          existing.additional_demographic_details ?? "",
        accepted_insurance_plans: existing.accepted_insurance_plans ?? "",
        self_pay_rate_of_services: existing.self_pay_rate_of_services ?? "",
        is_accepting_new_patients: existing.is_accepting_new_patients ?? false,
        is_ada_accessible: existing.is_ada_accessible ?? false,
        see_patient_type: existing.see_patient_type ?? "",
        willing_to_travel: existing.willing_to_travel ?? "",
        wait_time: existing.wait_time ?? "",
        city: existing.city ?? "",
        state: existing.state ?? "",
        zip: existing.zip ?? "",
        fax: existing.fax ?? "",
        business_hours: existing.business_hours ?? "",
        npi: existing.npi ?? "",
        visibility_packages: existing.visibility_packages ?? [],
        mental_health_condition: parseArrayField(
          existing.mental_health_condition ?? ""
        ),
        cta_message: existing.cta_message ?? "",
        public_token: existing.public_token ?? null,
        embeddingUpdatedAt: existing.embedding?.updated_at ?? null,
        dirty: false,
      });
    }
  }, [practices, selectedPracticeId]);

  const regenerateEmbedding = useCallback(async () => {
    if (!formState.id || !canQuery) {
      return;
    }
    setSaveState("saving");
    const response = await fetch(
      `${baseUrl}/api/v1/data/practices/${formState.id}/regenerate/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      setSaveState("saved");
      void mutatePractices();
    } else {
      setSaveState("error");
    }
  }, [accessToken, baseUrl, canQuery, formState.id, mutatePractices]);

  const renderSaveState = () => {
    if (saveState === "saving") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />{" "}
          Saving…
        </span>
      );
    }
    if (saveState === "saved") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Up to date
        </span>
      );
    }
    if (saveState === "error") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Save failed
        </span>
      );
    }
    return null;
  };

  // Subscription expiration notice
  const renderSubscriptionNotice = () => {
    if (!subscriptionData) return null;

    const subscription = subscriptionData as any;
    const isExpired = !subscription.subscriptionActive;

    if (!isExpired) return null;

    return (
      <div className="rounded-[16px] border border-red-200 bg-red-50 px-6 py-4 shadow-lg">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 text-red-500 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">
              Subscription Expired
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Your subscription has expired. Your practices will not appear in
              AI recommendations until you renew your subscription.
            </p>
            <div className="mt-3">
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Renew Subscription
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-12">
      {renderSubscriptionNotice()}
      <header className="rounded-[32px] border border-white/70 bg-white/80 px-8 py-10 shadow-2xl shadow-blue-500/10 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Operations
            </span>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-slate-900">
                Practice dashboard
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Update your practice details - change your subscription - review
                analytics.
              </p>
            </div>
          </div>
          <div className="flex gap-3 md:flex-row flex-col">
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:shadow-blue-600/50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Analytics
            </Link>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:shadow-slate-900/50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h10"
                />
              </svg>
              Manage subscription
            </Link>
          </div>
        </div>
        {!canQuery && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            Set NEXT_PUBLIC_API_BASE_URL and authenticate to load live data.
          </p>
        )}
        {limitNotice && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {limitNotice}
          </p>
        )}
      </header>

      {practices.length > 0 && (
        <section className="grid md:gap-6 gap-2 md:grid-cols-2">
          <div className="rounded-[28px] border border-white/70 bg-white/90 md:p-8 p-4 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="flex items-start justify-between gap-4 md:flex-row flex-col">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Engagement overview
                </h2>
                <p className="text-sm text-slate-500">
                  Your immediate visibility & lead generation
                </p>
              </div>
              {analyticsData && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {(analyticsData as AnalyticsData).total_clicks}
                  </div>
                  <div className="text-xs text-slate-500">Total clicks</div>
                </div>
              )}
            </div>
            {analyticsError && (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                Unable to load analytics right now.
              </p>
            )}
            {!analyticsError && analytics.length === 0 && (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500">
                Your chat assistant hasn&apos;t received any tracked clicks yet.
              </p>
            )}
            {analytics.length > 0 && (
              <ul className="mt-6 space-y-3">
                {analytics.map((row) => (
                  <li
                    key={row.url}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 text-sm text-slate-700 shadow-sm"
                  >
                    <span className="truncate pr-4" title={row.url}>
                      {row.url}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {row.total} clicks
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
            <h2 className="text-2xl font-semibold text-slate-900">
              Peer-to-Peer Referral Network
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                Share this link with patients, family, friends, colleagues, and
                especially on social media. The more providers share the tool,
                the greater the visibility for everyone on the platform.
              </p>
              <div className="flex items-center gap-2 md:flex-row flex-col">
                <code className="flex-1 truncate rounded-2xl border border-slate-200 bg-slate-900/90 px-4 py-3 font-mono text-xs text-slate-100 shadow-inner">
                  https://www.rdumentalhealth.app
                </code>
                <button
                  type="button"
                  onClick={() => {
                    const chatUrl = `https://www.rdumentalhealth.app/`;
                    navigator.clipboard.writeText(chatUrl);
                    setShowCopyToast(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  title="Copy chat link to clipboard"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Tip: Combined with our other marketing efforts, this remains our
                most effective strategy for filling caseloads quickly and
                collaboratively.
              </p>
            </div>
          </div>
        </section>
      )}

      {practices.length === 0 ? (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4 md:flex-row flex-col">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Add your practice to our AI powered referral tool.
                </h2>
                <p className="text-sm text-slate-500">
                  Enter your practice details accurately to ensure the best
                  possible matches and visibility.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {renderSaveState()}
                <button
                  type="button"
                  onClick={handleSavePractice}
                  disabled={saveState === "saving"}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:shadow-blue-600/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {saveState === "saving" ? "Saving..." : "Save Practice"}
                </button>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Practice Name? *
                </span>
                <input
                  value={formState.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Raleigh Therapy Group,PLLC or Jane Smith,LCSW "
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Website (It is ok to add a direct link to appointment
                  scheduling - recommended for medium or large practices) *
                </span>
                <input
                  value={formState.website}
                  onChange={(event) =>
                    updateField("website", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="https://example.com"
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Description ({formState.description.length}/850)
                </span>
                <textarea
                  value={formState.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  maxLength={850}
                  className="min-h-[140px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Summarize your services and approach - Be sure to highlight what sets you apart from others to ensure the best possible matches and maximum visibility."
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Specialty ({formState.specialty.length}/1000)
                </span>
                <textarea
                  value={formState.specialty}
                  onChange={(event) =>
                    updateField("specialty", event.target.value)
                  }
                  maxLength={1000}
                  className="min-h-[80px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Addictions, medication evaluation,Testing and Evaluation..."
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please list all services your practice offers *
                </span>
                <textarea
                  value={formState.services}
                  onChange={(event) =>
                    updateField("services", event.target.value)
                  }
                  className="min-h-[100px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Describe your services"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Practice address: *
                </span>
                <input
                  value={formState.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="123 Main Street, Raleigh, NC"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Phone number *
                </span>
                <input
                  value={formState.phone_number}
                  onChange={(event) =>
                    updateField("phone_number", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="(919) 555-1234"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Email *
                </span>
                <input
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="hello@example.com"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Confirm Email *
                </span>
                <input
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="hello@example.com"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Fax Number
                </span>
                <input
                  value={formState.fax}
                  onChange={(event) => updateField("fax", event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Fax Number"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please enter the health care professional in charge National
                  Provider Identifier (NPI) or the practice National Provider
                  Identifier (NPI)*
                </span>
                <p className="text-xs text-orange-600">
                  The NPI number will not be displayed—this is for standard
                  vetting purposes only.
                </p>
                <textarea
                  value={formState.credentials_and_npi}
                  onChange={(event) =>
                    updateField("credentials_and_npi", event.target.value)
                  }
                  className="min-h-[80px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Dr. John Smith,Psychiatrist, MD, PhD NPI: 1234567890&#10; Raleigh Therapy group NPI: 1987654321"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Select Your Practice Type *
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.practice_type.includes(
                        "psychiatry_only"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "practice_type",
                          "psychiatry_only",
                          event.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Psychiatry</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.practice_type.includes("therapy_only")}
                      onChange={(event) =>
                        updateArrayField(
                          "practice_type",
                          "therapy_only",
                          event.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Therapy</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.practice_type.includes(
                        "psychiatry_therapy"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "practice_type",
                          "psychiatry_therapy",
                          event.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      Mental Health Counseling
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.practice_type.includes("other")}
                      onChange={(event) =>
                        updateArrayField(
                          "practice_type",
                          "other",
                          event.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Other</span>
                  </label>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please indicate the primary location of your practice
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="chapel_hill"
                      checked={formState.primary_location === "chapel_hill"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Chapel Hill</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="durham"
                      checked={formState.primary_location === "durham"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Durham</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="raleigh"
                      checked={formState.primary_location === "raleigh"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Raleigh</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="cary"
                      checked={formState.primary_location === "cary"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Cary</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="morrisville"
                      checked={formState.primary_location === "morrisville"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Morrisville</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="apex"
                      checked={formState.primary_location === "apex"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Apex</span>
                  </label>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  If your location isn't listed, or if you have multiple
                  locations, please enter them below
                </span>
                <input
                  value={formState.other_location}
                  onChange={(event) =>
                    updateField("other_location", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Additional locations"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Do you offer Medication Management? *
                </span>
                <select
                  value={
                    formState.offer_medication_management === null
                      ? ""
                      : formState.offer_medication_management.toString()
                  }
                  onChange={(event) => {
                    const value =
                      event.target.value === ""
                        ? ""
                        : event.target.value === "true"
                        ? "true"
                        : "false";
                    updateField("offer_medication_management", value);
                  }}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  What types of therapy do you offer?{" "}
                  <p className="text-xs text-orange-600">
                    Select all that apply
                  </p>
                </span>
                <div className="space-y-2">
                  {[
                    "Individual Therapy",
                    "Couples Therapy",
                    "Family Therapy",
                    "Group Therapy",
                    "Cognitive Behavioral Therapy (CBT)",
                    "Dialectical Behavior Therapy (DBT)",
                    "Psychodynamic Therapy",
                    "Humanistic Therapy",
                    "Trauma Therapy",
                    "Art Therapy",
                    "Play Therapy",
                    "Other",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.types_of_therapy.includes(option)}
                        onChange={(event) =>
                          updateArrayField(
                            "types_of_therapy",
                            option,
                            event.target.checked
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  What types of patients does your practice serve? *
                  <p className="text-xs text-orange-600">
                    Select all that apply
                  </p>
                </span>
                <div className="space-y-2">
                  {[
                    "Toddler",
                    "Children",
                    "Preteens & Teens",
                    "Young Adults (18-24)",
                    "Adults (25-64)",
                    "Elders (65+)",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.patient_types.includes(option)}
                        onChange={(event) =>
                          updateArrayField(
                            "patient_types",
                            option,
                            event.target.checked
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Ethnicity (optional){" "}
                  <p className="text-xs text-orange-600">
                    Select all that apply to the members of your practice.
                  </p>
                </span>
                <div className="space-y-2">
                  {[
                    "White",
                    "Black / African American",
                    "Hispanic and Latino",
                    "Asian",
                    "Native American",
                    "Pacific Islander",
                    "Other",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.ethnicity.includes(option)}
                        onChange={(event) =>
                          updateArrayField(
                            "ethnicity",
                            option,
                            event.target.checked
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please select the gender identity or identities that apply to
                  you or your clinical staff.{" "}
                  <p className="text-xs text-orange-600">
                    select all that apply
                  </p>
                </span>
                <div className="space-y-2">
                  {["male_only", "female_only", "both", "non_binary"].map(
                    (option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formState.gender_identity.includes(option)}
                          onChange={(event) =>
                            updateArrayField(
                              "gender_identity",
                              option,
                              event.target.checked
                            )
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">
                          {option === "male_only" && "Male staff only"}
                          {option === "female_only" && "Female staff only"}
                          {option === "both" && "Both Male and Female staff"}
                          {option === "non_binary" && "Non Binary staff"}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Add additional demographic details (optional):
                </span>
                <input
                  value={formState.additional_demographic_details}
                  onChange={(event) =>
                    updateField(
                      "additional_demographic_details",
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Language, Religion, Faith, LGBTQ+"
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please list all insurance plans your practice accepts. *
                </span>
                <textarea
                  value={formState.accepted_insurance_plans}
                  onChange={(event) =>
                    updateField("accepted_insurance_plans", event.target.value)
                  }
                  className="min-h-[80px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="List accepted insurance plans"
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  List your self-pay rates for services.{" "}
                  <p className="text-xs text-orange-600">Without insurance</p>
                </span>
                <textarea
                  value={formState.self_pay_rate_of_services}
                  onChange={(event) =>
                    updateField("self_pay_rate_of_services", event.target.value)
                  }
                  className="min-h-[80px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Pyschiatric Evaluation: $350, $200/hour for couples counseling..."
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Are you currently accepting new patients? *
                  <p className="text-xs text-orange-600">
                    We recommend pausing your subscription when no longer
                    accepting new patients
                  </p>
                </span>
                <select
                  value={formState.is_accepting_new_patients.toString()}
                  onChange={(event) =>
                    updateField(
                      "is_accepting_new_patients",
                      event.target.value === "true" ? "true" : "false"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Is your facility ADA accessible? *
                  <p className="text-xs text-orange-600">
                    If this changes, please update your answer.
                  </p>
                </span>
                <select
                  value={formState.is_ada_accessible.toString()}
                  onChange={(event) =>
                    updateField(
                      "is_ada_accessible",
                      event.target.value === "true" ? "true" : "false"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  How do you currently see patients? In person, virtual, or
                  both? *
                  <p className="text-xs text-orange-600">
                    If this changes, please update your answer.
                  </p>
                </span>
                <select
                  value={formState.see_patient_type}
                  onChange={(event) =>
                    updateField("see_patient_type", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select patient type</option>
                  <option value="in_person_only">In-Person Only</option>
                  <option value="virtual_only">Virtual Only</option>
                  <option value="in_person_virtual">
                    In-Person and Virtual
                  </option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Are you willing to travel to patients who are unable to
                  commute? *
                  <p className="text-xs text-orange-600">
                    If this changes, please update your answer.
                  </p>
                </span>
                <select
                  value={formState.willing_to_travel}
                  onChange={(event) =>
                    updateField("willing_to_travel", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="depends">
                    Yes - Depends on the situation
                  </option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  How long is your current wait time for new patients? *
                  <p className="text-xs text-orange-600">
                    If this changes, please update your answer.
                  </p>
                </span>
                <input
                  value={formState.wait_time}
                  onChange={(event) =>
                    updateField("wait_time", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., 2-3 weeks"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Business Hours
                  <p className="text-xs text-orange-600">
                    Please highlight any flexible hours you offer
                  </p>
                </span>
                <input
                  value={formState.business_hours}
                  onChange={(event) =>
                    updateField("business_hours", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                />
              </label>

              {/* Visibility Package Field */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Choose the subscription package that suits you best
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.visibility_packages.includes(
                        "ai_search_only"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "visibility_packages",
                          "ai_search_only",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      AI Search Tool only ($25/month)
                      <p className="text-xs text-orange-600">
                        - Do not select(Free until March 31st 2026)
                      </p>
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.visibility_packages.includes(
                        "cta_spot_1"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "visibility_packages",
                          "cta_spot_1",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      Add a "Call To Action" - Gain extra visibility on
                      rdumentalhealth.com by featuring your practice in
                      high-traffic areas.
                      <p className="text-xs text-orange-600">
                        - Select one spot only (Free until March 31st 2026)
                        $28/month per each spot
                      </p>
                    </span>
                  </label>
                  {/* <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.visibility_packages.includes(
                        "cta_spot_2"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "visibility_packages",
                          "cta_spot_2",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      Call To Action (CTA) Spot #2 ($28/month) - Optional if you
                      want extra visibility on rdumentalhealth.com year)
                    </span>
                  </label> */}
                </div>
              </label>

              {/* Mental Health Condition Field */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  If you selected a CTA spot, which mental health condition
                  would you like to be featured under? Just a heads-up:
                  purchased slots vanish from the list below. With only a few,
                  available, it’s first come, first served.
                </span>
                <div className="space-y-2">
                  {[
                    "depression",
                    "generalized_anxiety",
                    "social_anxiety",
                    "ptsd",
                    "ocd",
                    "bipolar",
                    "bpd",
                    "schizophrenia",
                    "eating_disorders",
                    "dysthymia",
                    "specific_phobias",
                    "agoraphobia",
                    "substance_use",
                    "autism_spectrum",
                    "adjustment_disorder",
                    "insomnia",
                    "somatic_symptom",
                    "histrionic_personality",
                    "panic_disorder",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.mental_health_condition.includes(
                          option
                        )}
                        onChange={(event) =>
                          updateArrayField(
                            "mental_health_condition",
                            option,
                            event.target.checked
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">
                        {option === "depression" &&
                          "Depression (Major Depressive Disorder)"}
                        {option === "generalized_anxiety" &&
                          "Generalized Anxiety Disorder (GAD)"}
                        {option === "social_anxiety" &&
                          "Social Anxiety Disorder"}
                        {option === "ptsd" &&
                          "Post-Traumatic Stress Disorder (PTSD)"}
                        {option === "ocd" &&
                          "Obsessive-Compulsive Disorder (OCD)"}
                        {option === "bipolar" && "Bipolar Disorder"}
                        {option === "bpd" &&
                          "Borderline Personality Disorder (BPD)"}
                        {option === "schizophrenia" && "Schizophrenia"}
                        {option === "eating_disorders" &&
                          "Eating Disorders (Anorexia, Bulimia, Binge Eating Disorder)"}
                        {option === "dysthymia" &&
                          "Dysthymia (Persistent Depressive Disorder)"}
                        {option === "specific_phobias" && "Specific Phobias"}
                        {option === "agoraphobia" && "Agoraphobia"}
                        {option === "substance_use" && "Substance Use Disorder"}
                        {option === "autism_spectrum" &&
                          "Autism Spectrum Disorder (ASD)"}
                        {option === "adjustment_disorder" &&
                          "Adjustment Disorder"}
                        {option === "insomnia" && "Insomnia Disorder"}
                        {option === "somatic_symptom" &&
                          "Somatic Symptom Disorder"}
                        {option === "histrionic_personality" &&
                          "Histrionic Personality Disorder"}
                        {option === "panic_disorder" && "Panic Disorder"}
                      </span>
                    </label>
                  ))}
                </div>
              </label>

              {/* CTA Message Field */}
              {/* <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  If you selected a CTA spot, what message would you like to use
                  as your call to action?
                </span>
                <textarea
                  value={formState.cta_message}
                  onChange={(event) =>
                    updateField("cta_message", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Take the first step towards better mental health today."
                  rows={3}
                />
              </label> */}
            </div>
          </div>
        </section>
      ) : isEditingPractice ? (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4 md:flex-row flex-col">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Edit practice
                </h2>
                <p className="text-sm text-slate-500">
                  Keep your profile current to rank highly in discovery results.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {renderSaveState()}
                <button
                  type="button"
                  onClick={handleSavePractice}
                  disabled={saveState === "saving"}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:shadow-blue-600/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {saveState === "saving" ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Practice Name? *
                </span>
                <input
                  value={formState.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Raleigh Therapy Group"
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Website *
                  <p className="text-xs text-orange-600">
                    It is ok to add direct link to appointment scheduling
                  </p>
                </span>
                <input
                  value={formState.website}
                  onChange={(event) =>
                    updateField("website", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="https://example.com"
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Description ({formState.description.length}/850)
                </span>
                <textarea
                  value={formState.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  maxLength={850}
                  className="min-h-[140px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Summarize your services and approach"
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Specialty ({formState.specialty.length}/1000)
                </span>
                <textarea
                  value={formState.specialty}
                  onChange={(event) =>
                    updateField("specialty", event.target.value)
                  }
                  maxLength={1000}
                  className="min-h-[80px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Anxiety, Couples Counseling"
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please list all services your practice offers *
                </span>
                <textarea
                  value={formState.services}
                  onChange={(event) =>
                    updateField("services", event.target.value)
                  }
                  className="min-h-[100px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Describe your services"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Practice address: *
                </span>
                <input
                  value={formState.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="123 Main Street, Raleigh, NC"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Phone number *
                </span>
                <input
                  value={formState.phone_number}
                  onChange={(event) =>
                    updateField("phone_number", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="(919) 555-1234"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Email *
                </span>
                <input
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="hello@example.com"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Confirm Email *
                </span>
                <input
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="hello@example.com"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Fax Number
                </span>
                <input
                  value={formState.fax}
                  onChange={(event) => updateField("fax", event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Fax Number"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please list the full names, credentials, and National Provider
                  Identifier (NPI) numbers of your clinical staff (we recommend
                  only listing providers who are taking new patients) *
                </span>
                <p className="text-xs text-orange-600">
                  The NPI number will not be displayed—this is for standard
                  vetting purposes only.
                </p>
                <textarea
                  value={formState.credentials_and_npi}
                  onChange={(event) =>
                    updateField("credentials_and_npi", event.target.value)
                  }
                  className="min-h-[80px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Dr. John Smith, MD, NPI: 1234567890&#10;Jane Doe, LCSW, NPI: 0987654321"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Select Your Practice Type *
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.practice_type.includes(
                        "psychiatry_only"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "practice_type",
                          "psychiatry_only",
                          event.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Psychiatry</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.practice_type.includes("therapy_only")}
                      onChange={(event) =>
                        updateArrayField(
                          "practice_type",
                          "therapy_only",
                          event.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Therapy</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.practice_type.includes(
                        "psychiatry_therapy"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "practice_type",
                          "psychiatry_therapy",
                          event.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      Mental Health Counseling
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.practice_type.includes("other")}
                      onChange={(event) =>
                        updateArrayField(
                          "practice_type",
                          "other",
                          event.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Other</span>
                  </label>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please indicate the primary location of your practice
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="chapel_hill"
                      checked={formState.primary_location === "chapel_hill"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Chapel Hill</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="durham"
                      checked={formState.primary_location === "durham"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Durham</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="raleigh"
                      checked={formState.primary_location === "raleigh"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Raleigh</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="cary"
                      checked={formState.primary_location === "cary"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Cary</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="morrisville"
                      checked={formState.primary_location === "morrisville"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Morrisville</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="primary_location"
                      value="apex"
                      checked={formState.primary_location === "apex"}
                      onChange={(event) =>
                        updateField("primary_location", event.target.value)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Apex</span>
                  </label>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  If your location isn't listed above, or if you have multiple
                  locations, please enter them below
                </span>
                <input
                  value={formState.other_location}
                  onChange={(event) =>
                    updateField("other_location", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Additional locations"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Do you offer Medication Management? *
                </span>
                <select
                  value={
                    formState.offer_medication_management === null
                      ? ""
                      : formState.offer_medication_management.toString()
                  }
                  onChange={(event) => {
                    const value =
                      event.target.value === ""
                        ? ""
                        : event.target.value === "true"
                        ? "true"
                        : "false";
                    updateField("offer_medication_management", value);
                  }}
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  What types of therapy do you offer?
                  <p className="text-xs text-orange-600">
                    Select all that apply
                  </p>
                </span>
                <div className="space-y-2">
                  {[
                    "Individual Therapy",
                    "Couples Therapy",
                    "Family Therapy",
                    "Group Therapy",
                    "Cognitive Behavioral Therapy (CBT)",
                    "Dialectical Behavior Therapy (DBT)",
                    "Psychodynamic Therapy",
                    "Humanistic Therapy",
                    "Trauma Therapy",
                    "Art Therapy",
                    "Play Therapy",
                    "Other",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.types_of_therapy.includes(option)}
                        onChange={(event) =>
                          updateArrayField(
                            "types_of_therapy",
                            option,
                            event.target.checked
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  What types of patients does your practice serve? *
                  <p className="text-xs text-orange-600">
                    Select all that apply
                  </p>
                </span>
                <div className="space-y-2">
                  {[
                    "Toddler",
                    "Children",
                    "Preteens & Teens",
                    "Young Adults (18-24)",
                    "Adults (25-64)",
                    "Elders (65+)",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.patient_types.includes(option)}
                        onChange={(event) =>
                          updateArrayField(
                            "patient_types",
                            option,
                            event.target.checked
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Ethnicity (optional){" "}
                  <p className="text-xs text-orange-600">
                    Select all that apply to the members of your practice.
                  </p>
                </span>
                <div className="space-y-2">
                  {[
                    "White",
                    "Black / African American",
                    "Hispanic and Latino",
                    "Asian",
                    "Native American",
                    "Pacific Islander",
                    "Other",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.ethnicity.includes(option)}
                        onChange={(event) =>
                          updateArrayField(
                            "ethnicity",
                            option,
                            event.target.checked
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please select the gender identity or identities that apply to
                  you or your clinical staff.{" "}
                  <p className="text-xs text-orange-600">
                    select all that apply
                  </p>
                </span>
                <div className="space-y-2">
                  {["male_only", "female_only", "both", "non_binary"].map(
                    (option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formState.gender_identity.includes(option)}
                          onChange={(event) =>
                            updateArrayField(
                              "gender_identity",
                              option,
                              event.target.checked
                            )
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">
                          {option === "male_only" && "Male staff only"}
                          {option === "female_only" && "Female staff only"}
                          {option === "both" && "Both Male and Female staff"}
                          {option === "non_binary" && "Non Binary staff"}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Add additional demographic details (optional):
                </span>
                <input
                  value={formState.additional_demographic_details}
                  onChange={(event) =>
                    updateField(
                      "additional_demographic_details",
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Language, Religion, Faith, LGBTQ+"
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please list all insurance plans your practice accepts. *
                </span>
                <textarea
                  value={formState.accepted_insurance_plans}
                  onChange={(event) =>
                    updateField("accepted_insurance_plans", event.target.value)
                  }
                  className="min-h-[80px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="List accepted insurance plans"
                />
              </label>
              <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  List your self-pay rates for services.{" "}
                  <p className="text-xs text-orange-600">Without insurance</p>
                </span>
                <textarea
                  value={formState.self_pay_rate_of_services}
                  onChange={(event) =>
                    updateField("self_pay_rate_of_services", event.target.value)
                  }
                  className="min-h-[80px] rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., $150/hour for individual therapy, $200/hour for couples counseling"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Are you currently accepting new patients? *
                  <p className="text-xs text-orange-600">
                    Please notify us if this changes.
                  </p>
                </span>
                <select
                  value={formState.is_accepting_new_patients.toString()}
                  onChange={(event) =>
                    updateField(
                      "is_accepting_new_patients",
                      event.target.value === "true" ? "true" : "false"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Is your facility ADA accessible? (Kindly notify us of any
                  updates.) *
                </span>
                <select
                  value={formState.is_ada_accessible.toString()}
                  onChange={(event) =>
                    updateField(
                      "is_ada_accessible",
                      event.target.value === "true" ? "true" : "false"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  How do you currently see patients? In person, virtual, or
                  both? *
                  <p className="text-xs text-orange-600">
                    Please notify us if this changes.
                  </p>
                </span>
                <select
                  value={formState.see_patient_type}
                  onChange={(event) =>
                    updateField("see_patient_type", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select patient type</option>
                  <option value="in_person_only">In-Person Only</option>
                  <option value="virtual_only">Virtual Only</option>
                  <option value="in_person_virtual">
                    In-Person and Virtual
                  </option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Are you willing to travel to patients who are unable to
                  commute? *
                </span>
                <select
                  value={formState.willing_to_travel}
                  onChange={(event) =>
                    updateField("willing_to_travel", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="depends">
                    Yes - Depends on the situation
                  </option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  How long is your current wait time for new patients? *
                  <p className="text-xs text-orange-600">
                    Let us know if this changes.
                  </p>
                </span>
                <input
                  value={formState.wait_time}
                  onChange={(event) =>
                    updateField("wait_time", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., 2-3 weeks"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Business Hours
                  <p className="text-xs text-orange-600">
                    Please highlight any flexible hours you offer
                  </p>
                </span>
                <input
                  value={formState.business_hours}
                  onChange={(event) =>
                    updateField("business_hours", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                />
              </label>

              {/* Visibility Package Field */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Which visibility package would you like to reserve?
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.visibility_packages.includes(
                        "ai_search_only"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "visibility_packages",
                          "ai_search_only",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      AI Search Tool only ($20/month) -
                      <p className="text-xs text-orange-600">
                        Do not check (Free until March 31st 2026)
                      </p>
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.visibility_packages.includes(
                        "cta_spot_1"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "visibility_packages",
                          "cta_spot_1",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      $28/month per spot (optional)
                    </span>
                    <p className="text-xs italic">
                      Gain extra visibility on rdumentalhealth.com by featuring
                      your practice in high-traffic areas.{" "}
                      <p className="text-xs text-orange-600">
                        Do not check (Free until March 31st 2026)
                      </p>
                    </p>
                  </label>
                  {/* <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.visibility_packages.includes(
                        "cta_spot_2"
                      )}
                      onChange={(event) =>
                        updateArrayField(
                          "visibility_packages",
                          "cta_spot_2",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      Call To Action (CTA) Spot #2 ($28 per month or $308 per
                      year)
                    </span>
                  </label> */}
                </div>
              </label>

              {/* Mental Health Condition Field */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  If you selected a CTA spot, which mental health condition
                  would you like to be featured under? Just a heads-up:
                  purchased slots vanish from the list below. With only a few,
                  available, it's first come, first served.
                </span>
                <div className="space-y-2">
                  {[
                    "depression",
                    "generalized_anxiety",
                    "social_anxiety",
                    "ptsd",
                    "ocd",
                    "bipolar",
                    "bpd",
                    "schizophrenia",
                    "eating_disorders",
                    "dysthymia",
                    "specific_phobias",
                    "agoraphobia",
                    "substance_use",
                    "autism_spectrum",
                    "adjustment_disorder",
                    "insomnia",
                    "somatic_symptom",
                    "histrionic_personality",
                    "panic_disorder",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.mental_health_condition.includes(
                          option
                        )}
                        onChange={(event) =>
                          updateArrayField(
                            "mental_health_condition",
                            option,
                            event.target.checked
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">
                        {option === "depression" &&
                          "Depression (Major Depressive Disorder)"}
                        {option === "generalized_anxiety" &&
                          "Generalized Anxiety Disorder (GAD)"}
                        {option === "social_anxiety" &&
                          "Social Anxiety Disorder"}
                        {option === "ptsd" &&
                          "Post-Traumatic Stress Disorder (PTSD)"}
                        {option === "ocd" &&
                          "Obsessive-Compulsive Disorder (OCD)"}
                        {option === "bipolar" && "Bipolar Disorder"}
                        {option === "bpd" &&
                          "Borderline Personality Disorder (BPD)"}
                        {option === "schizophrenia" && "Schizophrenia"}
                        {option === "eating_disorders" &&
                          "Eating Disorders (Anorexia, Bulimia, Binge Eating Disorder)"}
                        {option === "dysthymia" &&
                          "Dysthymia (Persistent Depressive Disorder)"}
                        {option === "specific_phobias" && "Specific Phobias"}
                        {option === "agoraphobia" && "Agoraphobia"}
                        {option === "substance_use" && "Substance Use Disorder"}
                        {option === "autism_spectrum" &&
                          "Autism Spectrum Disorder (ASD)"}
                        {option === "adjustment_disorder" &&
                          "Adjustment Disorder"}
                        {option === "insomnia" && "Insomnia Disorder"}
                        {option === "somatic_symptom" &&
                          "Somatic Symptom Disorder"}
                        {option === "histrionic_personality" &&
                          "Histrionic Personality Disorder"}
                        {option === "panic_disorder" && "Panic Disorder"}
                      </span>
                    </label>
                  ))}
                </div>
              </label>

              {/* CTA Message Field */}
              {/* <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  If you selected a CTA spot, what message would you like to use
                  as your call to action?
                </span>
                <textarea
                  value={formState.cta_message}
                  onChange={(event) =>
                    updateField("cta_message", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., Take the first step towards better mental health today."
                  rows={3}
                />
              </label> */}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4 shadow-inner">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  AI submission status
                </p>
                <p className="text-xs text-slate-500">
                  {formState.embeddingUpdatedAt
                    ? `Last submitted to AI ${new Date(
                        formState.embeddingUpdatedAt
                      ).toLocaleString()}`
                    : "Submit to AI to capture your latest updates."}
                </p>
              </div>
              <button
                type="button"
                onClick={regenerateEmbedding}
                disabled={!formState.id}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:shadow-slate-900/40 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Resubmit to AI
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Practice details
                </h2>
                <p className="text-sm text-slate-500">
                  Your practice is set up and ready for discovery.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleEditPractice}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-100"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Practice
                </button>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Practice Name? *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.name || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Website (it is ok to add direct link to appointment
                  scheduling) *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.website || "Not set"}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Description
                </span>
                <div className="min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.description || "Not set"}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Specialty
                </span>
                <div className="min-h-[80px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.specialty || "Not set"}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please list all services your practice offers *
                </span>
                <div className="min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.services || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Practice address: *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.address || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Phone number *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.phone_number || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Email *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.email || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Fax Number
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.fax || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Credentials and NPI
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.credentials_and_npi || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Practice Type
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {getPracticeTypeDisplay(formState.practice_type)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Primary Location
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {getPrimaryLocationDisplay(formState.primary_location)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Other Location
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.other_location || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Do you offer Medication Management? *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.offer_medication_management === null
                    ? "Not set"
                    : formState.offer_medication_management
                    ? "Yes"
                    : "No"}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  What types of therapy do you offer?
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formatArrayField(formState.types_of_therapy) || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  What types of patients does your practice serve? *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formatArrayField(formState.patient_types) || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Ethnicity (optional) (Select all that apply to the members of
                  your practice.)
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formatArrayField(formState.ethnicity) || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please select the gender identity or identities that apply to
                  you or your clinical staff.
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {getGenderIdentityDisplay(formState.gender_identity)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Add additional demographic details (optional):
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.additional_demographic_details || "Not set"}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Please list all insurance plans your practice accepts. *
                </span>
                <div className="min-h-[80px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.accepted_insurance_plans || "Not set"}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  List your self-pay rates for services. (Without insurance)
                </span>
                <div className="min-h-[80px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.self_pay_rate_of_services || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Are you currently accepting new patients? (Please notify us of
                  any changes.) *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.is_accepting_new_patients ? "Yes" : "No"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Is your facility ADA accessible? (Kindly notify us of any
                  updates.) *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.is_ada_accessible ? "Yes" : "No"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  How do you currently see patients? In person, virtual, or
                  both?* ( Please notify us if this changes. )
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {getSeePatientTypeDisplay(formState.see_patient_type)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Are you willing to travel to patients who are unable to
                  commute? *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {getWillingToTravelDisplay(formState.willing_to_travel)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  How long is your current wait time for new patients? (Let us
                  know if this changes.) *
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.wait_time || "Not set"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Business Hours (Please highlight any flexible hours you offer)
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.business_hours || "Not set"}
                </div>
              </div>

              {/* Visibility Package Display */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Which monthly package would you like to subscribe for?
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.visibility_packages.length > 0
                    ? formState.visibility_packages
                        .map((pkg) => getVisibilityPackageDisplay(pkg))
                        .join(", ")
                    : "Not set"}
                </div>
              </div>

              {/* Mental Health Condition Display */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  If you selected a CTA spot, which mental health condition
                  would you like to be featured under?
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {getMentalHealthConditionDisplay(
                    formState.mental_health_condition
                  )}
                </div>
              </div>

              {/* CTA Message Display */}
              {/* <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  If you selected a CTA spot, what message would you like to use
                  as your call to action?
                </span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                  {formState.cta_message || "Not set"}
                </div>
              </div> */}
            </div>
          </div>
        </section>
      )}

      {/* Copy Success Toast */}
      {showCopyToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg shadow-emerald-500/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Copied!</p>
              <p className="text-xs text-emerald-600">
                Chat link copied to clipboard
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
