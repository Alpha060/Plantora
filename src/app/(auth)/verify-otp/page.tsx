"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { otpSchema } from "@/lib/validations";
import type { OtpFormData } from "@/lib/validations";
import { APP_NAME } from "@/lib/constants";

const RESEND_COOLDOWN = 30; // seconds

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const redirect = searchParams.get("redirect") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResend = useCallback(async () => {
    if (resendTimer > 0 || !email) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setResendTimer(RESEND_COOLDOWN);
      toast.success("OTP resent!");
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  }, [email, resendTimer]);

  const handleVerify = async (data: OtpFormData) => {
    if (!email) {
      toast.error("Email address missing. Please go back and try again.");
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: data.otp,
        type: "email",
      });

      if (error) {
        toast.error(error.message || "Invalid OTP");
        return;
      }

      toast.success("Email verified!");
      router.push(redirect);
      router.refresh();
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="w-full text-center space-y-6">
        <p className="text-on-surface-variant text-lg">No email address provided.</p>
        <Button variant="outline" onClick={() => router.push("/login")} className="h-12 px-8 rounded-xl border-outline-variant/50 text-on-surface hover:bg-surface-container-low transition-colors">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold font-serif text-on-surface">Verify Your Email</h1>
        <p className="text-on-surface-variant flex items-center flex-wrap gap-1">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-primary inline-flex items-center px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10">
            {email}
          </span>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="otp" className="text-on-surface font-semibold text-sm">Verification Code</Label>
          <div className="relative group">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              className="pl-12 h-14 bg-surface-container-low border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl text-center text-xl tracking-[0.4em] font-mono flex-1 block w-full"
              maxLength={6}
              autoFocus
              {...form.register("otp")}
            />
          </div>
          {form.formState.errors.otp && (
            <p className="text-xs text-error mt-1 ml-1">
              {form.formState.errors.otp.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-premium text-on-primary rounded-xl shadow-ambient hover:-translate-y-0.5 transition-transform"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <ArrowRight className="h-5 w-5 mr-2" />
          )}
          Verify Code
        </Button>

        <div className="text-center pt-2">
          {resendTimer > 0 ? (
            <p className="text-sm text-on-surface-variant">
              Resend code in{" "}
              <span className="font-bold text-primary tabular-nums">
                {resendTimer}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-bold text-primary hover:text-primary-fixed-dim transition-colors"
              disabled={isLoading}
            >
              Resend Verification Code
            </button>
          )}
        </div>
      </form>

      <p className="text-center text-xs text-on-surface-variant font-medium pt-4">
        Having trouble? Contact {APP_NAME} support for help.
      </p>
    </div>
  );
}

function VerifyOtpFallback() {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold font-serif text-on-surface">Verify Your Email</h1>
        <p className="text-on-surface-variant">Loading...</p>
      </div>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpFallback />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
