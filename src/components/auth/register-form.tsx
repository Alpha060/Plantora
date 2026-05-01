"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, User, Phone, Mail, Eye, EyeOff } from "lucide-react";
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

const OTP_REQUEST_TIMEOUT_MS = 30000;

// ---------------------------------------------------------------------------
// Variant configuration — i18n-ready string map
// ---------------------------------------------------------------------------
type RegisterVariant = "buyer" | "seller";

interface VariantConfig {
  heading: string;
  subtitle: string;
  loginHref: string;
  loginLabel: string;
  defaultRedirect: string;
  oauthLabel: string;
  apiRole: string;
}

const VARIANT_CONFIG: Record<RegisterVariant, VariantConfig> = {
  buyer: {
    heading: "Create your Account",
    subtitle: `Enter your details to start shopping on ${APP_NAME}.`,
    loginHref: "/login",
    loginLabel: "Login",
    defaultRedirect: "/",
    oauthLabel: "OR CONTINUE WITH",
    apiRole: "buyer",
  },
  seller: {
    heading: "Register your Store",
    subtitle: "Create a seller account to start listing products.",
    loginHref: "/seller/login",
    loginLabel: "Login",
    defaultRedirect: "/seller/store",
    oauthLabel: "OR CONTINUE WITH",
    apiRole: "seller",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface RegisterFormProps {
  variant: RegisterVariant;
}

export function RegisterForm({ variant }: RegisterFormProps) {
  const config = VARIANT_CONFIG[variant];

  const [step, setStep] = useState<"info" | "otp">("info");
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const infoForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", phone: "", password: "" },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const redirectWithReload = (path: string) => {
    window.location.assign(path);
  };

  const isDevBypass = process.env.NEXT_PUBLIC_DEV_OTP_BYPASS === "true";

  // Google OAuth handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        toast.error(error.message || "Failed to initiate Google sign-up.");
        setIsLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      if (!isDevBypass) {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
            },
          },
        });
        if (error) {
          toast.error(error.message || "Failed to send OTP");
          return;
        }
      }

      setFormData(data);
      setStep("otp");
      toast.success(isDevBypass ? "Dev mode: enter any 6 digits" : "OTP sent to your email!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP + create user profile
  const handleVerifyOtp = async (data: OtpFormData) => {
    if (!formData) {
      toast.error("Registration details missing. Please try again.");
      setStep("info");
      return;
    }

    setIsLoading(true);
    try {
      if (isDevBypass) {
        // Dev mode: first create auth user via dev-verify, then create profile, then redirect via dev-callback
        const devRes = await fetch("/api/auth/dev-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        const devResult = await devRes.json();
        if (!devRes.ok) {
          toast.error(devResult.error || "Dev verify failed");
          return;
        }

        // Create profile via register API
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: devResult.user.id,
            full_name: formData.full_name,
            phone: formData.phone || null,
            email: formData.email,
            role: config.apiRole,
          }),
        });

        // Redirect via dev-callback to set cookies
        window.location.assign(
          `/api/auth/dev-callback?email=${encodeURIComponent(formData.email)}&mode=register&redirect=${encodeURIComponent(config.defaultRedirect)}`
        );
        return;
      }

      // Production flow
      const supabase = createClient();
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: data.otp.trim(),
        type: "email",
      });

      if (verifyError) {
        toast.error(verifyError.message || "Invalid OTP.");
        return;
      }

      const userId = verifyData.user?.id;
      if (!userId) {
        toast.error("User ID missing.");
        return;
      }

      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          full_name: formData.full_name,
          phone: formData.phone || null,
          email: formData.email,
          role: config.apiRole,
        }),
      });

      toast.success("Account created successfully! 🎉");
      redirectWithReload(config.defaultRedirect);
    } catch (err) {
      console.error("Registration verification error:", err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* The White Card */}
      <div className="w-full bg-white shadow-xl shadow-black/5 rounded-[28px] p-6 md:p-8 mb-6 relative z-20">

      {step === "info" ? (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-[18px] font-bold text-[#1A3614] tracking-tight">
              Register with Email
            </h1>
            <p className="text-[#718096] text-[13px] mt-1">
              We&apos;ll send you an OTP to verify your email
            </p>
          </div>

          <form
            onSubmit={infoForm.handleSubmit(handleSendOtp)}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="register-fullname"
                className="text-[13px] font-bold text-[#1A3614]"
              >
                Full Name
              </Label>
              <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden h-[48px] bg-white focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033] transition-colors">
                <div className="w-[48px] h-full flex items-center justify-center border-r border-[#E2E8F0] shrink-0">
                  <User className="w-5 h-5 text-[#3B7033]" />
                </div>
                <Input
                  id="register-fullname"
                  placeholder="Enter your full name"
                  className="flex-1 h-full border-0 shadow-none focus-visible:ring-0 rounded-none px-4 text-[14px] placeholder:text-[#A0AEC0]"
                  {...infoForm.register("full_name")}
                />
              </div>
              {infoForm.formState.errors.full_name && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {infoForm.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="register-email"
                className="text-[13px] font-bold text-[#1A3614]"
              >
                Email Address
              </Label>
              <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden h-[48px] bg-white focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033] transition-colors">
                <div className="w-[48px] h-full flex items-center justify-center border-r border-[#E2E8F0] shrink-0">
                  <Mail className="w-5 h-5 text-[#3B7033]" />
                </div>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 h-full border-0 shadow-none focus-visible:ring-0 rounded-none px-4 text-[14px] placeholder:text-[#A0AEC0]"
                  {...infoForm.register("email")}
                />
              </div>
              {infoForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {infoForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="register-phone"
                className="text-[13px] font-bold text-[#1A3614]"
              >
                Mobile Number <span className="text-[#718096] font-normal">(Optional)</span>
              </Label>
              <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden h-[48px] bg-white focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033] transition-colors">
                <div className="w-[48px] h-full flex items-center justify-center border-r border-[#E2E8F0] shrink-0">
                  <Phone className="w-5 h-5 text-[#3B7033]" />
                </div>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="Add your mobile number"
                  className="flex-1 h-full border-0 shadow-none focus-visible:ring-0 rounded-none px-4 text-[14px] placeholder:text-[#A0AEC0]"
                  maxLength={10}
                  {...infoForm.register("phone")}
                />
              </div>
              <p className="text-[11px] text-[#718096] ml-1">You can add this later in your profile</p>
              {infoForm.formState.errors.phone && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {infoForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="register-password"
                className="text-[13px] font-bold text-[#1A3614]"
              >
                Password
              </Label>
              <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden h-[48px] bg-white focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033] transition-colors relative">
                <div className="w-[48px] h-full flex items-center justify-center border-r border-[#E2E8F0] shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#3B7033]" />
                </div>
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="flex-1 h-full border-0 shadow-none focus-visible:ring-0 rounded-none px-4 pr-12 text-[14px] placeholder:text-[#A0AEC0]"
                  {...infoForm.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#4A5568] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {infoForm.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {infoForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#3B7033] hover:bg-[#3B7033]/90 text-white rounded-lg shadow-none transition-colors font-medium text-[15px] mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Send OTP
            </Button>

            <div className="relative py-2 mt-4">
              <Separator className="bg-[#E2E8F0]" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[12px] text-[#718096] uppercase">
                OR
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-lg border border-[#E2E8F0] text-[#1A3614] bg-white hover:bg-[#F8FAFC] transition-colors font-medium text-[14px]"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center pt-3 pb-1">
              <p className="text-[#4A5568] text-[14px] ">
                Already have an account?{" "}
                <Link href={config.loginHref} className="text-[#3B7033] font-bold hover:underline">
                  {config.loginLabel}
                </Link>
              </p>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 mb-8">
            <h1 className="text-[28px] font-bold font-serif text-[#1A3614] tracking-tight text-center">
              Verify your Email
            </h1>
            <p className="text-[#4A5568] text-sm text-center flex flex-col items-center gap-1">
              Code sent to{" "}
              <strong className="text-[#1A3614]">
                {formData?.email}
              </strong>
              <button
                type="button"
                onClick={() => setStep("info")}
                className="text-[#3B7033] hover:underline text-xs font-medium"
              >
                Change
              </button>
            </p>
          </div>

          <form
            onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label
                htmlFor="register-otp"
                className="text-xs font-semibold text-[#718096] uppercase tracking-wider"
              >
                ENTER 6-DIGIT OTP
              </Label>
              <Input
                id="register-otp"
                type="text"
                placeholder="000000"
                className="w-full h-[52px] bg-white border border-[#E2E8F0] shadow-none focus-visible:ring-1 focus-visible:ring-[#3B7033] rounded-[10px] text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                autoFocus
                {...otpForm.register("otp")}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-xs text-red-500 mt-1 ml-1">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#3B7033] hover:bg-[#2D5A27] text-white rounded-xl shadow-none transition-colors font-medium text-base"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
              Verify & Enter
            </Button>

            <button
              type="button"
              onClick={() => formData && handleSendOtp(formData)}
              className="w-full text-sm font-medium text-[#718096] hover:text-[#1A3614] transition-colors py-2"
              disabled={isLoading}
            >
              Didn&apos;t receive code?{" "}
              <span className="text-[#3B7033] font-bold">Resend</span>
            </button>
          </form>
        </div>
      )}
      </div>

      {/* Footer Features */}
      <div className="w-full flex flex-row items-center justify-between px-2 pb-2">
        <div className="flex flex-col items-center text-center gap-2 flex-1 px-1">
          <div className="w-9 h-9 rounded-full bg-[#EAF0E9] flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-[#3B7033]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#1A3614] leading-tight mb-0.5">Secure & Safe</p>
            <p className="text-[10px] text-[#718096] leading-[1.2]">100% secure<br />payments</p>
          </div>
        </div>
        <div className="flex flex-col items-center text-center gap-2 flex-1 px-1">
          <div className="w-9 h-9 rounded-full bg-[#EAF0E9] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B7033]">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#1A3614] leading-tight mb-0.5">24 Hour Delivery</p>
            <p className="text-[10px] text-[#718096] leading-[1.2]">Fast delivery in<br />Daltonganj</p>
          </div>
        </div>
        <div className="flex flex-col items-center text-center gap-2 flex-1 px-1">
          <div className="w-9 h-9 rounded-full bg-[#EAF0E9] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B7033]">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#1A3614] leading-tight mb-0.5">Fresh & Quality</p>
            <p className="text-[10px] text-[#718096] leading-[1.2]">Best quality<br />guaranteed</p>
          </div>
        </div>
      </div>

      {/* Mobile-only: Contact Us */}
      <div className="md:hidden text-center space-y-5 w-full py-6">
        <div className="flex items-center justify-center gap-1.5 text-[#4A5568] text-[14px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B7033]">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
          Need help? <Link href="/contact" className="text-[#3B7033] font-bold hover:underline ml-1">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
