import type { Metadata } from "next";
import { Manrope, Noto_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";
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
    "Plantora is Daltonganj's premier online marketplace for fresh flowers, plants, bouquets, and professional garden services. Same-day delivery available.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${notoSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

