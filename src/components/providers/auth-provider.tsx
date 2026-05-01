"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types";

/**
 * AuthProvider — initializes auth state listener.
 * Place this in the root layout to keep auth in sync across the app.
 */
export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const hasSeededStore = useRef(false);

  // Seed the auth store before children render on the client so the header
  // does not get stuck in its loading state while auth revalidates.
  if (!hasSeededStore.current) {
    useAuthStore.setState({
      user: initialUser,
      isAuthenticated: !!initialUser,
      isLoading: false,
    });
    hasSeededStore.current = true;
  }

  // This hook sets up the onAuthStateChange listener.
  useAuth();

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "development" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations.map(async (registration) => {
            console.log("[SW] unregistering stale service worker", {
              scope: registration.scope,
            });
            await registration.unregister();
          })
        )
      )
      .catch((error) => {
        console.error("[SW] failed to unregister service workers", error);
      });
  }, []);

  return <>{children}</>;
}
