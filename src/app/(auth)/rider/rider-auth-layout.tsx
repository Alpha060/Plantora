"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Truck, Headphones, Lock, Clock, CheckCircle, Users, Leaf, Phone } from "lucide-react";
import { useContact } from "@/hooks/use-contact";

interface RiderAuthLayoutProps {
  children: React.ReactNode;
}

export function RiderAuthLayout({ children }: RiderAuthLayoutProps) {
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
              <Link href="/rider/login" className="text-[#2D5A27] font-semibold hover:underline">
                Login
              </Link>
            </p>
          )}
          {isLogin && (
            <p className="text-sm text-[#4A5568]">
              Want to join as a Rider?{" "}
              <Link href="/rider/register" className="text-[#2D5A27] font-semibold hover:underline">
                Register
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
                  <span className="text-[#2D5A27]">Rider!</span>
                </>
              ) : (
                <>
                  Join Plantora<br/>
                  as a <span className="text-[#2D5A27]">Delivery Partner</span>
                </>
              )}
            </h1>
            <p className="text-[#334155] text-[15px] mb-10 leading-relaxed max-w-[95%]">
              {isLogin
                ? "Login to your rider app and start delivering orders."
                : "Become a delivery partner for Plantora and start earning by delivering plants across Daltonganj."}
            </p>

            {/* Features */}
            <div className="flex flex-col gap-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(45,90,39,0.1)]">
                  <Truck className="w-6 h-6 text-[#2D5A27]" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-[#1A3614] text-sm mb-1.5">
                    {isLogin ? "Manage Deliveries" : "Flexible Earnings"}
                  </h3>
                  <p className="text-[13px] text-[#475569] leading-relaxed">
                    {isLogin ? "Track your orders and earnings." : "Work on your schedule and earn per delivery."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(45,90,39,0.1)]">
                  <ShieldCheck className="w-6 h-6 text-[#2D5A27]" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-[#1A3614] text-sm mb-1.5">Secure Payments</h3>
                  <p className="text-[13px] text-[#475569] leading-relaxed">Guaranteed weekly payouts to your bank account.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(45,90,39,0.1)]">
                  <Headphones className="w-6 h-6 text-[#2D5A27]" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-[#1A3614] text-sm mb-1.5">Rider Support</h3>
                  <p className="text-[13px] text-[#475569] leading-relaxed">Dedicated support team to help you on the road.</p>
                </div>
              </div>
            </div>

            {/* Image placeholder */}
            <div className="relative w-full h-[400px] mb-6 rounded-xl overflow-hidden shadow-sm bg-[#E8F5E9] flex items-center justify-center">
              <Truck className="w-24 h-24 text-[#2D5A27]/20" />
            </div>

            {/* Need Help Card */}
            <div className="bg-[#F0F7F1] rounded-xl p-5">
              <h3 className="font-bold text-[#1A3614] text-[13px] mb-1">Need Help?</h3>
              <p className="text-[11px] text-[#4A5568] mb-3 leading-snug">Our team is here to help you<br/>get started.</p>
              <div className="flex items-center gap-2 text-[#2D5A27] font-bold text-sm mb-1">
                <Phone className="w-4 h-4" />
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
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <div className="relative w-full h-[300px] sm:h-[350px] bg-emerald-900">
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black/80" />
          
          {/* Header on image */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
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
              <Link href="/rider/login" className="text-white text-sm font-medium drop-shadow-md">
                Login
              </Link>
            ) : (
              <Link href="/rider/register" className="text-white text-sm font-medium drop-shadow-md">
                Register
              </Link>
            )}
          </div>

          {/* Hero Text */}
          <div className="absolute bottom-12 left-4 right-4 z-10">
            {isLogin ? (
              <>
                <h1 className="text-white text-2xl sm:text-3xl font-serif font-bold leading-tight drop-shadow-lg">
                  Welcome Back,<br />Rider!
                </h1>
                <p className="text-white/90 text-sm mt-2 drop-shadow-md">
                  Login to your rider app and manage your deliveries.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-white text-2xl sm:text-3xl font-serif font-bold leading-tight drop-shadow-lg">
                  Join Plantora<br />as a Delivery Partner
                </h1>
                <p className="text-white/90 text-sm mt-2 drop-shadow-md">
                  Earn on your schedule by delivering plants.
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
      </div>
    </div>
  );
}
