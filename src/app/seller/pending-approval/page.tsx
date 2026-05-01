"use client";

import { CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-surface-container-high bg-surface-lowest flex items-center justify-center px-6 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-serif font-bold text-xl text-primary-fixed-dim">{APP_NAME}</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-lowest rounded-3xl shadow-ambient border border-surface-container-high p-8 md:p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-secondary/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-secondary/20 rounded-full flex items-center justify-center">
              <Clock className="h-10 w-10 text-secondary" />
            </div>
          </div>
          
          <h1 className="font-serif text-3xl font-bold text-on-surface mb-4">Under Review</h1>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            We have received your application and documents. Our team is currently reviewing your profile to ensure everything meets our seller guidelines.
          </p>
          
          <div className="bg-surface-container-lowest border border-surface-container rounded-xl p-4 mb-8 text-left space-y-3">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Store profile submitted</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>KYC documents uploaded</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Bank details secure</span>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant/70 mb-8">
            This process usually takes 24-48 business hours. We&apos;ll notify you via email and SMS once your store is approved.
          </p>

          <Link href="/">
            <Button className="w-full bg-primary rounded-full h-12">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
