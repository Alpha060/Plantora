"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Store, TrendingUp, Headphones, Lock, Clock, CheckCircle, Users, Phone, Leaf } from "lucide-react";
import { useContact } from "@/hooks/use-contact";

interface SellerAuthLayoutProps {
  children: React.ReactNode;
}

export function SellerAuthLayout({ children }: SellerAuthLayoutProps) {
  const pathname = usePathname();
  const isLogin = pathname.includes("/login");
  const { contact, formatPhone } = useContact();

  return (
    <div className="min-h-screen bg-[#F9FBF8]">
      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-6 bg-[#F9FBF8]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#1A3614] font-serif text-xl font-bold leading-none">Plantora</span>
              <span className="text-[#3B7033] text-[10px] tracking-[0.25em] uppercase font-semibold">DALTONGANJ</span>
            </div>
          </Link>
          {!isLogin && (
            <p className="text-sm text-[#4A5568]">
              Already have an account?{" "}
              <Link href="/seller/login" className="text-[#2D5A27] font-semibold hover:underline">
                Login
              </Link>
            </p>
          )}
          {isLogin && (
            <p className="text-sm text-[#4A5568]">
              New to Plantora?{" "}
              <Link href="/seller/register" className="text-[#2D5A27] font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-10 py-6 flex items-start gap-12">
          {/* Left Sidebar */}
          <div className="w-[30%] flex flex-col pt-2">
            <h1 className="text-[32px] font-serif font-bold text-[#1A3614] leading-[1.2] mb-4">
              {isLogin ? (
                <>
                  Welcome Back,<br/>
                  <span className="text-[#2D5A27]">Seller!</span>
                </>
              ) : (
                <>
                  Join Plantora<br/>
                  as a <span className="text-[#2D5A27]">Seller</span>
                </>
              )}
            </h1>
            <p className="text-[#334155] text-[15px] mb-10 leading-relaxed max-w-[95%]">
              {isLogin
                ? "Login to your seller account and manage your store easily."
                : "Start selling your flowers, plants and gardening products to thousands of happy customers in Daltonganj."}
            </p>

            {/* Features */}
            <div className="flex flex-col gap-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(45,90,39,0.1)]">
                  <Store className="w-6 h-6 text-[#2D5A27]" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-[#1A3614] text-sm mb-1.5">
                    {isLogin ? "Manage Store" : "Grow Your Business"}
                  </h3>
                  <p className="text-[13px] text-[#475569] leading-relaxed">
                    {isLogin ? "Easily update products and track your orders." : "Reach more customers and grow your sales"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(45,90,39,0.1)]">
                  <ShieldCheck className="w-6 h-6 text-[#2D5A27]" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-[#1A3614] text-sm mb-1.5">Secure & Trusted</h3>
                  <p className="text-[13px] text-[#475569] leading-relaxed">100% secure payments and trusted platform</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(45,90,39,0.1)]">
                  <Headphones className="w-6 h-6 text-[#2D5A27]" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-[#1A3614] text-sm mb-1.5">Support You Can Count On</h3>
                  <p className="text-[13px] text-[#475569] leading-relaxed">Dedicated support for all your queries</p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative w-full h-[400px] mb-6 rounded-xl overflow-hidden shadow-sm">
              <Image 
                src={isLogin ? "/images/seller-login-hero.png" : "/images/seller-register-hero.png"} 
                alt="Seller Display" 
                fill 
                priority
                className="object-cover object-center" 
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            </div>

            {/* Need Help Card */}
            <div className="bg-[#F0F7F1] rounded-xl p-5">
              <h3 className="font-bold text-[#1A3614] text-[13px] mb-1">Need Help?</h3>
              <p className="text-[11px] text-[#4A5568] mb-3 leading-snug">Our team is here to help you<br/>get started.</p>
              <div className="flex items-center gap-2 text-[#2D5A27] font-bold text-sm mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{formatPhone(contact.phone)}</span>
              </div>
              <p className="text-[10px] text-[#718096]">Mon - Sun: 8:00 AM - 9:00 PM</p>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="w-[70%]">
            <div className={`bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-[#E2E8F0] p-8 ${isLogin ? 'min-h-[500px]' : 'min-h-[800px]'} flex flex-col justify-center`}>
              <div className="max-w-[480px] w-full mx-auto">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-[#E2E8F0] bg-white py-8">
          <div className="max-w-[1400px] mx-auto px-10">
            <div className="grid grid-cols-4 gap-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#2D5A27]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3614] text-[11px]">100% Secure</h4>
                  <p className="text-[10px] text-[#718096]">Your data is safe<br/>with us</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#2D5A27]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3614] text-[11px]">Fast Verification</h4>
                  <p className="text-[10px] text-[#718096]">Quick review and<br/>account activation</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-[#2D5A27]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3614] text-[11px]">24/7 Support</h4>
                  <p className="text-[10px] text-[#718096]">We're here to help<br/>you anytime</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#2D5A27]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3614] text-[11px]">Trusted Platform</h4>
                  <p className="text-[10px] text-[#718096]">Thousands of sellers<br/>trust us</p>
                </div>
              </div>
            </div>
            <div className="text-center text-[10px] text-[#718096] pt-6 mt-6 border-t border-[#E2E8F0]">
              © 2024 Plantora DaltOnganj. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Hero Image Section */}
        <div className="relative w-full h-[300px] sm:h-[350px]">
          <Image
            src={isLogin ? "/images/seller-login-hero.png" : "/images/seller-register-hero.png"}
            alt="Seller Hero"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 100vw"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black/80" />
          
          {/* Header on image */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-md flex items-center justify-center shadow-sm">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-serif text-lg font-bold leading-none drop-shadow-md">Plantora</span>
                <span className="text-white/90 text-[8px] tracking-[0.25em] uppercase font-semibold drop-shadow-md">DALTONGANJ</span>
              </div>
            </Link>
            {!isLogin ? (
              <Link href="/seller/login" className="text-white text-sm font-medium drop-shadow-md">
                Login
              </Link>
            ) : (
              <Link href="/seller/register" className="text-white text-sm font-medium drop-shadow-md">
                Register
              </Link>
            )}
          </div>

          {/* Hero Text */}
          <div className="absolute bottom-12 left-4 right-4">
            {isLogin ? (
              <>
                <h1 className="text-white text-2xl sm:text-3xl font-serif font-bold leading-tight drop-shadow-lg">
                  Welcome Back,<br />Seller!
                </h1>
                <p className="text-white/90 text-sm mt-2 drop-shadow-md">
                  Login to your seller account and manage your store easily.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-white text-2xl sm:text-3xl font-serif font-bold leading-tight drop-shadow-lg">
                  Join Plantora<br />as a Seller
                </h1>
                <p className="text-white/90 text-sm mt-2 drop-shadow-md">
                  Start selling your flowers, plants and gardening products.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 px-4 sm:px-6 relative z-20 -mt-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-7 border border-white/50 ring-1 ring-black/5">
            {children}
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="px-4 py-4 border-t border-[#E2E8F0] bg-white">
          {isLogin ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-1">
                  <Lock className="w-4 h-4 text-[#2D5A27]" />
                </div>
                <p className="text-[10px] font-semibold text-[#1A3614]">Secure & Safe</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-1">
                  <Headphones className="w-4 h-4 text-[#2D5A27]" />
                </div>
                <p className="text-[10px] font-semibold text-[#1A3614]">Seller Support</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-1">
                  <Store className="w-4 h-4 text-[#2D5A27]" />
                </div>
                <p className="text-[10px] font-semibold text-[#1A3614]">Easy Management</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-1">
                  <ShieldCheck className="w-3 h-3 text-[#2D5A27]" />
                </div>
                <p className="text-[8px] font-semibold text-[#1A3614]">100% Secure</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-1">
                  <CheckCircle className="w-3 h-3 text-[#2D5A27]" />
                </div>
                <p className="text-[8px] font-semibold text-[#1A3614]">Fast Verify</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-1">
                  <Clock className="w-3 h-3 text-[#2D5A27]" />
                </div>
                <p className="text-[8px] font-semibold text-[#1A3614]">24/7 Support</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-1">
                  <Users className="w-3 h-3 text-[#2D5A27]" />
                </div>
                <p className="text-[8px] font-semibold text-[#1A3614]">Trusted</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

