"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, Store, Truck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { passwordLoginSchema } from "@/lib/validations";
import type { PasswordLoginFormData } from "@/lib/validations";
import { ROLE_DASHBOARDS, type UserRole } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Variant configuration — i18n-ready string map
// ---------------------------------------------------------------------------
type LoginVariant = "buyer" | "seller" | "admin" | "rider";

interface VariantConfig {
  heading: string;
  subtitle: string;
  registerHref: string | null;
  registerLabel: string;
  allowedRoles: UserRole[];
  defaultRedirect: string;
  icon: React.ReactNode | null;
}

const VARIANT_CONFIG: Record<LoginVariant, VariantConfig> = {
  buyer: {
    heading: "Welcome to Plantora",
    subtitle: "Enter your details to access your account.",
    registerHref: "/register",
    registerLabel: "Register",
    allowedRoles: ["buyer", "seller", "rider", "admin"],
    defaultRedirect: "/",
    icon: null,
  },
  seller: {
    heading: "Seller Portal",
    subtitle: "Access your store dashboard.",
    registerHref: "/seller/register",
    registerLabel: "Register Store",
    allowedRoles: ["seller", "admin"],
    defaultRedirect: "/seller/dashboard",
    icon: <Store className="h-5 w-5" />,
  },
  admin: {
    heading: "Admin Console",
    subtitle: "Manage the Plantora platform.",
    registerHref: null,
    registerLabel: "",
    allowedRoles: ["admin"],
    defaultRedirect: "/admin/dashboard",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  rider: {
    heading: "Rider Hub",
    subtitle: "Manage your deliveries.",
    registerHref: null,
    registerLabel: "",
    allowedRoles: ["rider", "admin"],
    defaultRedirect: "/rider/dashboard",
    icon: <Truck className="h-5 w-5" />,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface LoginFormProps {
  variant: LoginVariant;
}

export function LoginForm({ variant }: LoginFormProps) {
  const config = VARIANT_CONFIG[variant];
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Show error from redirect (e.g. OAuth rejection)
  useEffect(() => {
    if (errorParam === "not_registered") {
      toast.error("No account found. Please register first.");
    } else if (errorParam) {
      toast.error("Login failed. Please try again.");
    }
  }, [errorParam]);

  const form = useForm<PasswordLoginFormData>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const redirectWithReload = (path: string) => {
    window.location.assign(path);
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

  // Email + Password login
  const handleLogin = async (data: PasswordLoginFormData) => {
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

      const userId = authData.user?.id;
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      const userRole = (profile?.role || "buyer") as UserRole;

      if (!config.allowedRoles.includes(userRole)) {
        toast.error("Redirecting to correct portal.");
        redirectWithReload(ROLE_DASHBOARDS[userRole]);
        return;
      }

      toast.success("Logged in successfully!");
      
      // If an admin (or any non-buyer) logs in from the buyer page, route them to their dashboard
      let finalRedirect = redirectTo || config.defaultRedirect;
      if (!redirectTo && userRole !== "buyer" && variant === "buyer") {
        finalRedirect = ROLE_DASHBOARDS[userRole];
      }
      
      redirectWithReload(finalRedirect);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* The White Card */}
      <div className="w-full bg-white shadow-xl shadow-black/5 rounded-[28px] p-6 md:p-8 mb-6 relative z-20">

        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-[13px] font-bold text-[#1A3614]">
              Email Address
            </Label>
            <div className="flex items-center gap-0 border border-[#E2E8F0] rounded-[10px] overflow-hidden h-[48px] focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033]">
              <div className="flex items-center justify-center w-[48px] h-full bg-white border-r border-[#E2E8F0]">
                <Mail className="h-5 w-5 text-[#3B7033]" />
              </div>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email address"
                className="flex-1 h-full bg-white border-0 shadow-none focus-visible:ring-0 rounded-none px-4 text-[14px] placeholder:text-[#A0AEC0]"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-[13px] font-bold text-[#1A3614]">
                Password
              </Label>
              <Link href="/forgot-password" className="text-[12px] font-medium text-[#3B7033] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="flex items-center gap-0 border border-[#E2E8F0] rounded-[10px] overflow-hidden h-[48px] focus-within:ring-1 focus-within:ring-[#3B7033] focus-within:border-[#3B7033] relative">
              <div className="flex items-center justify-center w-[48px] h-full bg-white border-r border-[#E2E8F0]">
                <Lock className="h-5 w-5 text-[#3B7033]" />
              </div>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="flex-1 h-full bg-white border-0 shadow-none focus-visible:ring-0 rounded-none px-4 pr-12 text-[14px] placeholder:text-[#A0AEC0]"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#4A5568] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full h-[48px] bg-[#3B7033] hover:bg-[#2D5A27] text-white rounded-xl shadow-none transition-colors font-medium text-sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#718096]">OR</span>
            </div>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-[48px] rounded-xl border-[#E2E8F0] text-[#1A3614] hover:bg-[#F9FBF8] transition-colors font-medium text-sm shadow-none"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          {/* Register Link */}
          {config.registerHref && (
            <div className="text-center pt-3 pb-1">
              <p className="text-[13px] text-[#4A5568]">
                New to Plantora?{" "}
                <Link href={config.registerHref} className="text-[#3B7033] font-bold hover:underline">
                  Create an Account
                </Link>
              </p>
            </div>
          )}
        </form>
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
