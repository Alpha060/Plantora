"use client";

import { useAuth } from "@/hooks/use-auth";

/**
 * AuthProvider — initializes auth state listener.
 * Place this in the root layout to keep auth in sync across the app.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This hook sets up the onAuthStateChange listener
  useAuth();
  return <>{children}</>;
}
