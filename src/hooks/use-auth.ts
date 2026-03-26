"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types";
import type { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Hook that manages auth state synchronization between Supabase and Zustand.
 * Should be called once at the app root level (via AuthProvider).
 */
export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, clearUser } =
    useAuthStore();

  const fetchProfile = useCallback(
    async (userId: string, sessionUser?: SupabaseUser) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, phone, email, avatar_url, role, is_active")
        .eq("id", userId)
        .single();

      if (error || !data) {
        // No profile row yet — use session data as fallback
        // This happens when user just registered via OTP but the profile
        // row hasn't been created or RLS blocks the read
        if (sessionUser) {
          const fallbackProfile: AuthUser = {
            id: sessionUser.id,
            full_name: sessionUser.user_metadata?.full_name || sessionUser.phone || "User",
            phone: sessionUser.phone || null,
            email: sessionUser.email || null,
            avatar_url: null,
            role: "buyer",
            is_active: true,
          };
          setUser(fallbackProfile);
          return fallbackProfile;
        }
        clearUser();
        return null;
      }

      const profile = data as AuthUser;
      setUser(profile);
      return profile;
    },
    [setUser, clearUser]
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
  }, [clearUser]);

  useEffect(() => {
    const supabase = createClient();

    // Check existing session on mount
    const initSession = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        clearUser();
      }
      setLoading(false);
    };

    initSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session?.user) {
          await fetchProfile(session.user.id, session.user);
        } else if (event === "SIGNED_OUT") {
          clearUser();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, clearUser, setLoading]);

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut,
    fetchProfile,
  };
}
