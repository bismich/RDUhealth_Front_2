"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

import { useAppSelector } from "@/store/hooks";
import { createSupabaseClient } from "@/lib/supabase";

type UserProfile = {
  id: number;
  supabase_id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  full_name: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ProfileFormState = {
  first_name: string;
  last_name: string;
  email: string;
  dirty: boolean;
};

type PasswordFormState = {
  new_password: string;
  confirm_password: string;
  dirty: boolean;
};

const initialProfileState = (): ProfileFormState => ({
  first_name: "",
  last_name: "",
  email: "",
  dirty: false,
});

const initialPasswordState = (): PasswordFormState => ({
  new_password: "",
  confirm_password: "",
  dirty: false,
});

export default function ProfilePage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const { accessToken } = useAppSelector((state) => state.auth);
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
    data: profileData,
    error: profileError,
    mutate: mutateProfile,
  } = useSWR(
    canQuery ? `${baseUrl}/api/v1/auth/profile/` : null,
    authorizedFetcher
  );

  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(initialProfileState);
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(initialPasswordState);
  const [profileSaveState, setProfileSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [passwordSaveState, setPasswordSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Update profile form when data loads
  useEffect(() => {
    if (profileData) {
      const profile = profileData as UserProfile;
      setProfileForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        dirty: false,
      });
    }
  }, [profileData]);

  // Auto-save profile changes
  useEffect(() => {
    if (!profileForm.dirty || !canQuery) {
      return;
    }
    const timeout = setTimeout(async () => {
      setProfileSaveState("saving");
      try {
        const payload = {
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          email: profileForm.email,
        };
        const response = await fetch(`${baseUrl}/api/v1/auth/profile/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error("Failed to update profile");
        }
        setProfileForm((state) => ({ ...state, dirty: false }));
        setProfileSaveState("saved");
        void mutateProfile();
      } catch (error) {
        console.error(error);
        setProfileSaveState("error");
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [accessToken, baseUrl, canQuery, profileForm, mutateProfile]);

  const updateProfileField = useCallback(
    (field: keyof ProfileFormState, value: string) => {
      setProfileForm((state) => ({ ...state, [field]: value, dirty: true }));
    },
    []
  );

  const updatePasswordField = useCallback(
    (field: keyof PasswordFormState, value: string) => {
      setPasswordForm((state) => ({ ...state, [field]: value, dirty: true }));
    },
    []
  );

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canQuery) return;

      if (passwordForm.new_password !== passwordForm.confirm_password) {
        setPasswordSaveState("error");
        return;
      }

      setPasswordSaveState("saving");
      try {
        const supabase = createSupabaseClient();

        // Update password using Supabase Auth
        const { error } = await supabase.auth.updateUser({
          password: passwordForm.new_password,
        });

        if (error) {
          throw new Error(error.message);
        }

        setPasswordForm(initialPasswordState());
        setPasswordSaveState("saved");
        setShowPasswordForm(false);
      } catch (error) {
        console.error(error);
        setPasswordSaveState("error");
      }
    },
    [canQuery, passwordForm]
  );

  const renderProfileSaveState = () => {
    if (profileSaveState === "saving") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          Saving…
        </span>
      );
    }
    if (profileSaveState === "saved") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Saved
        </span>
      );
    }
    if (profileSaveState === "error") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Save failed
        </span>
      );
    }
    return null;
  };

  const renderPasswordSaveState = () => {
    if (passwordSaveState === "saving") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          Updating…
        </span>
      );
    }
    if (passwordSaveState === "saved") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Password updated
        </span>
      );
    }
    if (passwordSaveState === "error") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Update failed
        </span>
      );
    }
    return null;
  };

  if (profileError) {
    return (
      <div className="flex flex-col gap-12">
        <header className="rounded-[32px] border border-white/70 bg-white/80 px-8 py-10 shadow-2xl shadow-blue-500/10 backdrop-blur">
          <div className="space-y-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Profile
            </span>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-slate-900">
                Profile Management
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Manage your account settings and personal information.
              </p>
            </div>
          </div>
        </header>
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8">
          <p className="text-red-600">
            Unable to load profile information. Please check your connection and
            try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <header className="rounded-[32px] border border-white/70 bg-white/80 px-8 py-10 shadow-2xl shadow-blue-500/10 backdrop-blur">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Profile
          </span>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-slate-900">
              Profile Management
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Manage your account settings and personal information.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Personal Information
              </h2>
              <p className="text-sm text-slate-500">
                Update your basic profile information.
              </p>
            </div>
            {renderProfileSaveState()}
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  First Name
                </span>
                <input
                  value={profileForm.first_name}
                  onChange={(event) =>
                    updateProfileField("first_name", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your first name"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Last Name
                </span>
                <input
                  value={profileForm.last_name}
                  onChange={(event) =>
                    updateProfileField("last_name", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your last name"
                />
              </label>
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Email Address
              </span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  updateProfileField("email", event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your email address"
              />
            </label>
          </div>

          {profileData && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                Account Information
              </h3>
              <div className="space-y-1 text-xs text-slate-500">
                {/* <p>
                  Role:{" "}
                  <span className="font-medium text-slate-700">
                    {(profileData as UserProfile).role}
                  </span>
                </p> */}
                <p>
                  Member since:{" "}
                  <span className="font-medium text-slate-700">
                    {new Date(
                      (profileData as UserProfile).created_at
                    ).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  Last updated:{" "}
                  <span className="font-medium text-slate-700">
                    {new Date(
                      (profileData as UserProfile).updated_at
                    ).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Password Management */}
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Password Security
              </h2>
              <p className="text-sm text-slate-500">
                Update your password to keep your account secure.
              </p>
            </div>
            {renderPasswordSaveState()}
          </div>

          {!showPasswordForm ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                  <svg
                    className="h-6 w-6 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Change Password
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Click the button below to update your password.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:shadow-slate-900/40"
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
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Change Password
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  New Password
                </span>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(event) =>
                    updatePasswordField("new_password", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your new password"
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Confirm New Password
                </span>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(event) =>
                    updatePasswordField("confirm_password", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Confirm your new password"
                  required
                />
              </label>
              {passwordForm.new_password !== passwordForm.confirm_password &&
                passwordForm.confirm_password && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    passwordSaveState === "saving" ||
                    passwordForm.new_password !== passwordForm.confirm_password
                  }
                  className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {passwordSaveState === "saving"
                    ? "Updating..."
                    : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm(initialPasswordState());
                    setPasswordSaveState("idle");
                  }}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
