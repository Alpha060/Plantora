"use client";

import { usePathname } from "next/navigation";
import { Check, Store, FileText, Building2, Clock } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Leaf } from "lucide-react";
import Link from "next/link";

const steps = [
  { id: "store", title: "Store Info", icon: Store, path: "/seller/store" },
  { id: "documents", title: "Documents", icon: FileText, path: "/seller/documents" },
  { id: "bank", title: "Bank Details", icon: Building2, path: "/seller/bank" },
  { id: "pending", title: "Review", icon: Clock, path: "/seller/pending-approval" },
];

export function OnboardingStepper() {
  const pathname = usePathname();
  
  // Find current step index
  const currentIndex = steps.findIndex(s => pathname.startsWith(s.path));
  
  return (
    <div className="w-full py-8 mb-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-container-highest rounded-full -z-10 hidden sm:block"></div>
          
          {/* Active progress line */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500 hidden sm:block"
            style={{ width: `${Math.max(0, currentIndex) * (100 / (steps.length - 1))}%` }}
          ></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-surface px-2 sm:bg-transparent">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isActive 
                      ? "bg-primary text-on-primary ring-4 ring-primary/20" 
                      : isCompleted
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs sm:text-sm font-medium ${isActive || isCompleted ? "text-on-surface" : "text-on-surface-variant"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-surface-container-high bg-surface-lowest flex items-center justify-center px-6 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-serif font-bold text-xl text-primary-fixed-dim">{APP_NAME}</span>
          <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant ml-2 border-l pl-2 border-outline-variant/30">
            Seller Waitlist
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
