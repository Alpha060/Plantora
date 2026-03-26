"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, otpSchema } from "@/lib/validations";
import type { RegisterFormData, OtpFormData } from "@/lib/validations";
import { APP_NAME } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "otp">("info");
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const infoForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", phone: "", email: "" },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const handleSendOtp = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${data.phone}`,
      });

      if (error) {
        toast.error(error.message || "Failed to send OTP");
        return;
      }

      setFormData(data);
      setStep("otp");
      toast.success("OTP sent to your phone!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    if (!formData) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.verifyOtp({
        phone: `+91${formData.phone}`,
        token: data.otp,
        type: "sms",
      });

      if (error) {
        toast.error(error.message || "Invalid OTP. Please try again.");
        return;
      }

      if (authData.user) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: authData.user.id,
            full_name: formData.full_name,
            phone: formData.phone,
            email: formData.email || null,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || "Failed to create account");
          return;
        }

        toast.success("Account created successfully! 🎉");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-lowest">
      {/* Auth Navigation Tabs */}
      <div className="flex items-center gap-8 mb-8 border-b border-surface-container-high relative">
        <div className="relative pb-3">
          <Link href="/login" className="text-on-surface-variant hover:text-on-surface transition-colors">
            Login
          </Link>
        </div>
        <div className="relative pb-3">
          <span className="text-primary font-bold">Register</span>
          <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary" />
        </div>
      </div>

      {step === "info" ? (
        <div className="space-y-6">
          <div className="space-y-2 mb-8">
            <h1 className="text-[28px] font-bold font-serif text-on-surface tracking-tight">
              Create your Archive
            </h1>
            <p className="text-on-surface-variant text-sm">
              Enter your details to begin your botanical collection.
            </p>
          </div>

          <form onSubmit={infoForm.handleSubmit(handleSendOtp)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                FULL NAME
              </Label>
              <Input
                id="full_name"
                placeholder="Name Signature"
                className="w-full h-12 bg-surface-container border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg px-4 text-base placeholder:text-on-surface-variant/50"
                {...infoForm.register("full_name")}
              />
              {infoForm.formState.errors.full_name && (
                <p className="text-xs text-error mt-1 ml-1">
                  {infoForm.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                PHONE NUMBER
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-between w-20 h-12 bg-surface-container rounded-lg px-3 cursor-pointer">
                  <span className="text-sm font-medium text-on-surface">+91</span>
                  <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="000 000 0000"
                  className="flex-1 h-12 bg-surface-container border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg px-4 text-base placeholder:text-on-surface-variant/50"
                  maxLength={10}
                  {...infoForm.register("phone")}
                />
              </div>
              {infoForm.formState.errors.phone && (
                <p className="text-xs text-error mt-1 ml-1">
                  {infoForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                EMAIL <span className="text-on-surface-variant/50 font-normal">(OPTIONAL)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="address@domain.com"
                className="w-full h-12 bg-surface-container border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg px-4 text-base placeholder:text-on-surface-variant/50"
                {...infoForm.register("email")}
              />
              {infoForm.formState.errors.email && (
                <p className="text-xs text-error mt-1 ml-1">
                  {infoForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-none transition-colors font-medium text-base mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Send OTP
              {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>

            <div className="relative py-4">
              <Separator className="bg-surface-container-high" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-lowest px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                OR CURATOR SIGN UP
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-full border-surface-container text-on-surface hover:bg-surface-container transition-colors font-medium"
              disabled
            >
              <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 mb-8">
            <h1 className="text-[28px] font-bold font-serif text-on-surface tracking-tight">
              Verify your Identity
            </h1>
            <p className="text-on-surface-variant text-sm flex items-center gap-2">
              Code sent to <strong className="text-on-surface">+91 {formData?.phone}</strong>
              <button
                type="button"
                onClick={() => setStep("info")}
                className="text-primary hover:underline text-xs"
              >
                Change
              </button>
            </p>
          </div>

          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                ENTER 6-DIGIT OTP
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                className="w-full h-14 bg-surface-container border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                autoFocus
                {...otpForm.register("otp")}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-xs text-error mt-1 ml-1">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-none transition-colors font-medium text-base"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
              Verify & Enter
            </Button>

            <button
              type="button"
              onClick={() => formData && handleSendOtp(formData)}
              className="w-full text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors py-2"
              disabled={isLoading}
            >
              Didn't receive code? <span className="text-primary">Resend</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
