"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Hook that manages auth state synchronization between Supabase and Zustand.
 * Should be called once at the app root level (via AuthProvider).
 */
export function useAuth() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double-init in React Strict Mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const supabase = createClient();

    const fetchProfile = async (userId: string, sessionUser?: SupabaseUser) => {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, phone, email, avatar_url, role, is_active")
        .eq("id", userId)
        .single();

      if (error || !data) {
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
          useAuthStore.getState().setUser(fallbackProfile);
          return;
        }
        useAuthStore.getState().clearUser();
        return;
      }

      useAuthStore.getState().setUser(data as AuthUser);
    };

    // Check existing session on mount
    const initSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await fetchProfile(user.id, user);
        } else {
          useAuthStore.getState().clearUser();
        }
      } catch (error) {
        console.error("Auth init error:", error);
        useAuthStore.getState().clearUser();
      }
    };

    // Add timeout: if auth takes > 2s, show login button instead of spinner
    const timeoutId = setTimeout(() => {
      const state = useAuthStore.getState();
      if (state.isLoading) {
        state.setLoading(false);
      }
    }, 2000);

    initSession().finally(() => clearTimeout(timeoutId));

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else if (event === "SIGNED_OUT") {
        useAuthStore.getState().clearUser();
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // Stable — no deps, runs once

  // Return store state for convenience (reads are reactive via Zustand)
  const { user, isLoading, isAuthenticated } = useAuthStore();

  const signOut = useCallback(async () => {
    const supabase = createClient();
    useAuthStore.getState().clearUser();
    await supabase.auth.signOut().catch(() => {});
    window.location.assign("/api/auth/logout");
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut,
  };
}
