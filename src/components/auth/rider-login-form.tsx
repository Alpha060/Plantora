"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { passwordLoginSchema } from "@/lib/validations";
import type { PasswordLoginFormData } from "@/lib/validations";

export function RiderLoginForm() {
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

      if (userRole !== "rider" && userRole !== "admin") {
        toast.error("This account is not registered as a rider.");
        await supabase.auth.signOut();
        return;
      }

      if (userRole === "rider") {
        const { data: riderData } = await supabase
          .from("riders")
          .select("is_active")
          .eq("user_id", userId)
          .single();

        if (riderData && !riderData.is_active) {
          toast.info("Your account is under review.");
          router.push("/rider/pending-approval");
          router.refresh();
          return;
        }
      }

      toast.success("Logged in successfully!");
      router.push("/rider/dashboard");
      router.refresh();
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#1A3614] text-center mb-1">Rider Login</h2>
      <p className="text-sm text-[#718096] text-center mb-10">
        Please login to continue to your rider app.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-[#2D5A27] font-bold hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#3B7033] hover:bg-[#2D5A27] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-[#2D5A27]/10"
        >
          {isLoading ? "Logging in..." : "Login to App"}
        </Button>
      </form>

      <div className="mt-12 text-center">
        <p className="text-sm text-[#718096] mb-4">
          Want to become a Plantora Rider?
        </p>
        <Link
          href="/rider/register"
          className="inline-flex items-center justify-center w-full px-6 py-3 border border-[#3B7033] text-[#3B7033] rounded-xl font-bold text-sm hover:bg-[#F9FBF8] transition-all"
        >
          Register as Delivery Partner
        </Link>
      </div>
    </div>
  );
}
