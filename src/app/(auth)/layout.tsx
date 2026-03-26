import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-lowest">
      {/* Top Banner - Hero Image with Overlay */}
      <div className="relative w-full h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        {/* Abstract dark green botanical background placeholder */}
        <div className="absolute inset-0 bg-[#0a1e12]">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e12] via-transparent to-transparent opacity-80" />
        </div>
        
        {/* Floating Glass Box */}
        <div className="relative z-10 px-12 py-8 bg-surface-lowest/10 backdrop-blur-md border border-surface-lowest/20 rounded-2xl flex flex-col items-center">
          <Link href="/">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2 text-center">
              {APP_NAME}
            </h1>
          </Link>
          <p className="text-white/80 text-xs sm:text-sm tracking-[0.2em] uppercase font-medium">
            Curating Your Sanctuary
          </p>
        </div>
      </div>

      {/* Main Content - Form Area */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer Area */}
      <footer className="bg-primary/5 py-12 px-6 sm:px-12 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-primary-fixed-variant">
              {APP_NAME}
            </h2>
            <p className="text-sm text-primary/70">
              © {new Date().getFullYear()} {APP_NAME} Botanical Archivist. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-primary/70">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
