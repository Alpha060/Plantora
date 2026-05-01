"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const resetSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

function ForgotPasswordContent() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  // Step 1: Send password reset OTP via email
  const handleSendOtp = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email.");
        return;
      }

      setEmail(data.email);
      setStep("reset");
      toast.success("Password reset link sent to your email!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and set new password
  const handleResetPassword = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Verify the OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: data.otp.trim(),
        type: "email",
      });

      if (verifyError) {
        toast.error(verifyError.message || "Invalid or expired OTP.");
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        toast.error(updateError.message || "Failed to update password.");
        return;
      }

      toast.success("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-white shadow-xl shadow-black/5 rounded-[28px] p-6 md:p-8 mb-6 relative z-20">

        {step === "email" ? (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[#EAF0E9] flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-6 w-6 text-[#3B7033]" />
              </div>
              <h1 className="text-[20px] font-bold text-[#1A3614] tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-[#718096] text-[13px] mt-2">
                Enter your email address and we&apos;ll send you an OTP to reset your password.
              </p>
            </div>

            <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-[13px] font-bold text-[#1A3614]">
                  Email Address
                </Label>
                <div className="flex items-center gap-0 border border-[#E2E8F0] rounded-[10px] overflow-hidden h-[48px] focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033]">
                  <div className="flex items-center justify-center w-[48px] h-full bg-white border-r border-[#E2E8F0]">
                    <Mail className="h-5 w-5 text-[#3B7033]" />
                  </div>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 h-full bg-white border-0 shadow-none focus-visible:ring-0 rounded-none px-4 text-[14px] placeholder:text-[#A0AEC0]"
                    {...emailForm.register("email")}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-[48px] bg-[#3B7033] hover:bg-[#2D5A27] text-white rounded-xl shadow-none transition-colors font-medium text-sm"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send OTP
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3B7033] hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[#EAF0E9] flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-[#3B7033]" />
              </div>
              <h1 className="text-[20px] font-bold text-[#1A3614] tracking-tight">
                Reset Password
              </h1>
              <p className="text-[#718096] text-[13px] mt-2">
                Enter the OTP sent to <strong className="text-[#1A3614]">{email}</strong> and your new password.
              </p>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-[#3B7033] hover:underline text-[12px] mt-1 font-medium"
              >
                Change Email
              </button>
            </div>

            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-5">
              {/* OTP */}
              <div className="space-y-2">
                <Label htmlFor="reset-otp" className="text-[13px] font-bold text-[#1A3614]">
                  Enter OTP
                </Label>
                <Input
                  id="reset-otp"
                  type="text"
                  placeholder="000000"
                  className="w-full h-[52px] bg-white border border-[#E2E8F0] shadow-none focus-visible:ring-1 focus-visible:ring-[#3B7033] rounded-[10px] text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoFocus
                  {...resetForm.register("otp")}
                />
                {resetForm.formState.errors.otp && (
                  <p className="text-xs text-red-500 mt-1 text-center">
                    {resetForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="reset-password" className="text-[13px] font-bold text-[#1A3614]">
                  New Password
                </Label>
                <div className="flex items-center gap-0 border border-[#E2E8F0] rounded-[10px] overflow-hidden h-[48px] focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033] relative">
                  <div className="flex items-center justify-center w-[48px] h-full bg-white border-r border-[#E2E8F0]">
                    <Lock className="h-5 w-5 text-[#3B7033]" />
                  </div>
                  <Input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="flex-1 h-full bg-white border-0 shadow-none focus-visible:ring-0 rounded-none px-4 pr-12 text-[14px] placeholder:text-[#A0AEC0]"
                    {...resetForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#4A5568]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {resetForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="reset-confirm" className="text-[13px] font-bold text-[#1A3614]">
                  Confirm Password
                </Label>
                <div className="flex items-center gap-0 border border-[#E2E8F0] rounded-[10px] overflow-hidden h-[48px] focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033] relative">
                  <div className="flex items-center justify-center w-[48px] h-full bg-white border-r border-[#E2E8F0]">
                    <Lock className="h-5 w-5 text-[#3B7033]" />
                  </div>
                  <Input
                    id="reset-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="flex-1 h-full bg-white border-0 shadow-none focus-visible:ring-0 rounded-none px-4 pr-12 text-[14px] placeholder:text-[#A0AEC0]"
                    {...resetForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#4A5568] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-[48px] bg-[#3B7033] hover:bg-[#2D5A27] text-white rounded-xl shadow-none transition-colors font-medium text-sm"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset Password
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleSendOtp({ email })}
                  className="text-[13px] font-medium text-[#718096] hover:text-[#1A3614] transition-colors py-2"
                  disabled={isLoading}
                >
                  Didn&apos;t receive code? <span className="text-[#3B7033] font-bold">Resend</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ForgotPasswordFallback() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-white shadow-xl shadow-black/5 rounded-[28px] p-6 md:p-8 mb-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B7033]" />
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
