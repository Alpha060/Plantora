"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";

export function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.includes("/seller/") || pathname.includes("/rider/")) {
    return <>{children}</>;
  }

  // Determine the image based on the current path
  let heroImage = "/images/hero-banner.png";
  if (pathname.includes("/seller/register")) {
    heroImage = "/images/seller-register-hero.png";
  } else if (pathname.includes("/seller/login")) {
    heroImage = "/images/seller-login-hero.png";
  } else if (pathname.includes("/register")) {
    heroImage = "/images/register-hero.png";
  } else if (pathname.includes("/login") || pathname.includes("/forgot-password")) {
    heroImage = "/images/login-hero.png";
  }

  const isLogin = pathname.includes("/login");
  const isForgotPassword = pathname.includes("/forgot-password");

  return (
    <div className="min-h-screen font-sans relative">

      {/* ========== DESKTOP LAYOUT (md+) ========== */}
      <div className="hidden md:flex min-h-screen relative bg-[#f8fdf6]">
        {/* Left-side background image */}
        <div className="absolute top-0 left-0 bottom-0 w-[50%] z-0">
          <Image
            src={heroImage}
            alt="Hero Background"
            fill
            priority
            sizes="55vw"
            className={`object-cover ${pathname.includes("/register") ? "object-right" : "object-center"}`}
          />
          <div className="absolute inset-y-0 right-0 w-4 bg-linear-to-l from-[#f8fdf6] to-transparent" />
        </div>

        {/* Left side: Brand + Welcome — centered in clear area of image */}
        <div className="relative z-10 w-[50%] flex flex-col items-center justify-center text-center pl-[10%] pr-[5%]">
          <div className="flex flex-col items-center mb-1">
            <div className="w-[72px] h-[72px] shrink-0 mb-3 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Leaf className="w-9 h-9 text-white" />
            </div>
            <h1 className="font-serif text-[40px] font-bold text-[#1A3614] leading-none tracking-tight">
              Plantora
            </h1>
            <p className="text-[#1A3614] text-[11px] tracking-[0.35em] uppercase font-bold mt-2">
              Daltonganj
            </p>
          </div>
          <p className="text-[#3B7033] text-[14px] font-semibold tracking-wide mt-2 mb-10">
            Flowers | Plants | Landscaping
          </p>

          <h2 className="font-serif text-[38px] font-bold text-[#1A3614] tracking-tight leading-tight mb-2">
            {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-[#4A5568] text-[15px] leading-relaxed">
            {isForgotPassword
              ? <>Recover access to your<br />Plantora account</>
              : isLogin
              ? <>Login to continue shopping<br />fresh flowers &amp; plants</>
              : <>Join us to start shopping<br />fresh flowers &amp; plants</>}
          </p>
        </div>

        {/* Right side: Form */}
        <div className="relative z-10 w-[50%] h-full flex flex-col items-start justify-center pl-[5%] pr-[5%] pb-20 overflow-y-auto">
          <div className="w-full max-w-[600px] my-auto py-8">
            {children}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/80 border-t border-[#E2E8F0] py-4">
          <div className="flex items-center justify-center gap-2 text-[#4A5568] text-[14px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B7033]">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
            Need help?{" "}
            <Link href="/contact" className="text-[#3B7033] font-bold hover:underline">
              Contact us
            </Link>
          </div>
        </div>
      </div>

      {/* ========== MOBILE LAYOUT (below md) ========== */}
      <div className="flex flex-col md:hidden min-h-screen bg-[#F9FBF8]">
        {/* Hero image */}
        <div className="relative w-full h-[320px] shrink-0">
          <Image
            src={heroImage}
            alt="Hero Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Light top overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-b from-white/60 via-white/30 to-transparent" />
          {/* Bottom fade into bg */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#F9FBF8] to-transparent" />

          {/* Back Button */}
          <div className="absolute top-5 left-5 z-20">
            <Link href="/">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3614" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </Link>
          </div>

          {/* Centered Logo + Text */}
          <div className="absolute inset-x-0 top-10 z-10 flex flex-col items-center text-center px-6">
            <div className="w-14 h-14 mb-2 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-serif text-[24px] font-bold text-[#1A3614] leading-none tracking-tight">
              Plantora
            </h1>
            <p className="text-[#1A3614] text-[7px] tracking-[0.4em] uppercase font-bold mt-1">
              Daltonganj
            </p>
            <p className="text-[#3B7033] text-[12px] font-semibold tracking-wide mt-1.5">
              Flowers | Plants | Landscaping
            </p>

            <h2 className="font-serif text-[28px] font-bold text-[#1A3614] leading-tight mt-4">
              {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-[#4A5568] text-[13px] leading-snug mt-1">
              {isForgotPassword
                ? <>Recover access to your<br />Plantora account</>
                : isLogin
                ? <>Login to continue shopping<br />fresh flowers &amp; plants</>
                : <>Join us to start shopping<br />fresh flowers &amp; plants</>}
            </p>
          </div>
        </div>

        {/* Form content */}
        <div className="px-4 -mt-4 mb-8 flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
