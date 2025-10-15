"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/AuthProvider";
import { useAppSelector } from "@/store/hooks";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, session } = useAuth();
  const authState = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !session && !authState.userId) {
      router.replace("/login");
    }
  }, [isLoading, session, authState.userId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600">Checking your access…</p>
        </div>
      </div>
    );
  }

  if (!session || !authState.userId) {
    return null;
  }

  return <>{children}</>;
}
