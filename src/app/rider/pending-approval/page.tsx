"use client";

import { CheckCircle2, Clock, Truck, Leaf } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function RiderPendingApprovalPage() {
  return (
    <div className="min-h-screen bg-[#F9FBF8] flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[#E2E8F0] bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-[#3B7033]" />
          <span className="font-serif font-bold text-xl text-[#1A3614]">{APP_NAME}</span>
        </Link>
        <span className="text-sm font-semibold text-[#3B7033] bg-[#E8F5E9] px-3 py-1 rounded-full">
          Delivery Partner Portal
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#E2E8F0] p-8 md:p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
          </div>
          
          <h1 className="font-serif text-3xl font-bold text-[#1A3614] mb-4">Under Review</h1>
          <p className="text-[#4A5568] mb-6 leading-relaxed text-sm">
            We have received your delivery partner application. Our operations team is currently verifying your profile and vehicle details.
          </p>
          
          <div className="bg-[#F9FBF8] border border-[#E8F5E9] rounded-2xl p-5 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-[#4A5568]">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Partner profile submitted</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#4A5568]">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Vehicle information recorded</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-amber-700 font-medium">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 animate-spin" />
              <span>Awaiting admin activation</span>
            </div>
          </div>

          <p className="text-xs text-[#718096] mb-8 leading-relaxed">
            This verification process usually takes 24 hours. Once activated, you will be able to log in, go online, and accept delivery assignments.
          </p>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-[#3B7033] hover:bg-[#2D5A27] text-white rounded-xl h-12 font-bold shadow-md shadow-[#3B7033]/20">
                Return to Homepage
              </Button>
            </Link>
            <Link href="/rider/login" className="block">
              <Button variant="outline" className="w-full border-[#E2E8F0] text-[#4A5568] hover:bg-[#F9FBF8] rounded-xl h-12 font-semibold">
                Check Login Status
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
