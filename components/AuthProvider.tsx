"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSession, clearSession } from "@/store/authSlice";
import { mutate } from "swr";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  isLoading: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  session: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSessionState] = useState<Session | null>(null);
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  useEffect(() => {
    const supabase = createSupabaseClient();

    // Fetch user profile from backend
    const fetchUserProfile = async (accessToken: string) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!baseUrl) {
          console.warn("NEXT_PUBLIC_API_BASE_URL not set, using default role");
          return "user";
        }

        const response = await fetch(`${baseUrl}/api/v1/auth/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const profile = await response.json();
          return profile.role || "user";
        } else {
          console.warn("Failed to fetch user profile, using default role");
          return "user";
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return "user";
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          dispatch(clearSession());
          setSessionState(null);
          // Clear SWR cache on error
          mutate(() => true, undefined, { revalidate: false });
        } else if (session) {
          setSessionState(session);
          const role = await fetchUserProfile(session.access_token);
          dispatch(
            setSession({
              userId: session.user.id,
              email: session.user.email ?? null,
              role: role as "user" | "admin",
              accessToken: session.access_token,
            })
          );
        } else {
          dispatch(clearSession());
          setSessionState(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch(clearSession());
        setSessionState(null);
        // Clear SWR cache on error
        mutate(() => true, undefined, { revalidate: false });
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (session) {
        setSessionState(session);
        const role = await fetchUserProfile(session.access_token);
        dispatch(
          setSession({
            userId: session.user.id,
            email: session.user.email ?? null,
            role: role as "user" | "admin",
            accessToken: session.access_token,
          })
        );
      } else {
        setSessionState(null);
        dispatch(clearSession());
        // Clear all SWR cache when user logs out
        mutate(() => true, undefined, { revalidate: false });
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isLoading, session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
