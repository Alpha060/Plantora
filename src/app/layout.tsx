import type { Metadata } from "next";
import { Manrope, Noto_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/types";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Plantora — Fresh Flowers & Plants Marketplace",
    template: "%s | Plantora",
  },
  description:
    "Plantora is Daltonganj's premier online marketplace for fresh flowers, plants, bouquets, and professional garden Landscape. Same-day delivery available.",
  keywords: [
    "flowers",
    "plants",
    "bouquets",
    "Daltonganj",
    "garden",
    "nursery",
    "online flower delivery",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side: fetch user profile to seed client store instantly (no spinner)
  let initialUser: AuthUser | null = null;
  try {
    const supabase = await createClient();
    // Use getUser() to validate the token directly via the Supabase server,
    // avoiding the "insecure storage medium" warning associated with getSession().
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      initialUser = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.phone || "User",
        phone: user.phone || null,
        email: user.email || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role: "buyer",
        is_active: true,
      };
    }
  } catch {
    // Non-critical — client-side auth will pick it up
  }

  return (
    <html lang="en" className={`${manrope.variable} ${notoSerif.variable} h-full antialiased`}>
      <head>
        <link rel="dns-prefetch" href="https://ntbbncljuwpnglnfveze.supabase.co" />
        <link rel="preconnect" href="https://ntbbncljuwpnglnfveze.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          <AuthProvider initialUser={initialUser}>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
