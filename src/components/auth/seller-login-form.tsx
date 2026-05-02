"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { passwordLoginSchema } from "@/lib/validations";
import type { PasswordLoginFormData } from "@/lib/validations";


export function SellerLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<PasswordLoginFormData>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: PasswordLoginFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      // Check user role
      const userId = authData.user?.id;
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      const userRole = profile?.role;

      if (userRole !== "seller" && userRole !== "admin") {
        toast.error("This account is not registered as a seller.");
        await supabase.auth.signOut();
        return;
      }

      if (userRole === "seller") {
        const { data: storeData } = await supabase
          .from("stores")
          .select("status")
          .eq("user_id", userId)
          .single();

        if (storeData) {
          if (storeData.status === "pending") {
            toast.error("Your account is pending admin approval. Please wait.");
            await supabase.auth.signOut();
            return;
          }
          if (storeData.status === "rejected") {
            toast.error("Your account registration was rejected.");
            await supabase.auth.signOut();
            return;
          }
        }
      }

      toast.success("Logged in successfully!");
      router.push("/seller/dashboard");
      router.refresh();
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        toast.error(error.message || "Failed to initiate Google login.");
        setIsLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#1A3614] text-center mb-1">Seller Login</h2>
      <p className="text-sm text-[#718096] text-center mb-10">
        Please login to continue to your seller dashboard.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-bold text-[#1A3614] ml-1">
            Email Address
          </Label>
          <div className="flex h-12 rounded-xl overflow-hidden border border-[#E2E8F0] focus-within:border-[#2D5A27] transition-all">
            <div className="w-12 h-full bg-[#F9FBF8] flex items-center justify-center border-r border-[#E2E8F0]">
              <Mail className="w-5 h-5 text-[#2D5A27]" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="flex-1 h-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-xs text-red-500 ml-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-bold text-[#1A3614] ml-1">
            Password
          </Label>
          <div className="flex h-12 rounded-xl overflow-hidden border border-[#E2E8F0] focus-within:border-[#2D5A27] transition-all relative">
            <div className="w-12 h-full bg-[#F9FBF8] flex items-center justify-center border-r border-[#E2E8F0]">
              <Lock className="w-5 h-5 text-[#2D5A27]" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="flex-1 h-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm pr-12"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#4A5568]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-red-500 ml-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-[#2D5A27] font-bold hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#3B7033] hover:bg-[#2D5A27] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-[#2D5A27]/10"
        >
          {isLoading ? "Logging in..." : "Login to Dashboard"}
        </Button>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-[#E2E8F0]/80" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-[#94A3B8] font-medium">OR</span>
          </div>
        </div>

        {/* Google Login */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-12 rounded-xl border-[#E2E8F0] text-[#1A3614] hover:bg-[#F9FBF8] transition-all font-bold text-sm"
        >
          <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>
      </form>

      {/* Register Link */}
      <div className="mt-12 text-center">
        <p className="text-sm text-[#718096] mb-4">
          New to GreenBloom Seller Panel?
        </p>
        <Link
          href="/seller/register"
          className="inline-flex items-center justify-center w-full px-6 py-3 border border-[#3B7033] text-[#3B7033] rounded-xl font-bold text-sm hover:bg-[#F9FBF8] transition-all"
        >
          Create Seller Account
        </Link>
      </div>
    </div>
  );
}
