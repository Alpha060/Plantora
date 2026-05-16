"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Phone, Mail, Lock, Eye, EyeOff, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

const riderRegisterSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
  vehicle_type: z.string().min(1, "Vehicle type is required"),
  vehicle_number: z.string().min(4, "Vehicle number is required"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type RiderRegisterFormData = z.infer<typeof riderRegisterSchema>;

export function RiderRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RiderRegisterFormData>({
    resolver: zodResolver(riderRegisterSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
      vehicle_type: "bike",
      vehicle_number: "",
    },
  });

  const onSubmit = async (data: RiderRegisterFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rider/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Registration failed. Please try again.");
        return;
      }

      setIsSuccess(true);
      toast.success("Registration successful!");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto text-[#2D5A27]">
          <Truck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1A3614] mb-2">Application Submitted!</h2>
          <p className="text-sm text-[#718096]">
            Your application to become a delivery partner has been submitted successfully. 
            Our team will review your details and activate your account soon.
          </p>
        </div>
        <Link href="/rider/login" className="inline-block mt-4 text-[#2D5A27] font-semibold hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#1A3614] text-center mb-1">Join as a Rider</h2>
      <p className="text-sm text-[#718096] text-center mb-8">
        Fill out the form below to become a delivery partner.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
            <Input id="full_name" placeholder="Enter your full name" className="h-11 pl-10" {...form.register("full_name")} />
          </div>
          {form.formState.errors.full_name && <p className="text-xs text-red-500">{form.formState.errors.full_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
            <Input id="email" type="email" placeholder="Enter your email" className="h-11 pl-10" {...form.register("email")} />
          </div>
          {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Mobile Number <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
            <Input id="phone" placeholder="Enter mobile number" maxLength={10} className="h-11 pl-10" {...form.register("phone")} />
          </div>
          {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Vehicle Type <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => form.setValue("vehicle_type", val)} defaultValue="bike">
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bike">Bike / Scooter</SelectItem>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="auto">Auto / Rickshaw</SelectItem>
                <SelectItem value="mini_truck">Mini Truck</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.vehicle_type && <p className="text-xs text-red-500">{form.formState.errors.vehicle_type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_number" className="text-sm font-medium">Vehicle Number <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
              <Input id="vehicle_number" placeholder="e.g. JH01AB1234" className="h-11 pl-10 uppercase" {...form.register("vehicle_number")} />
            </div>
            {form.formState.errors.vehicle_number && <p className="text-xs text-red-500">{form.formState.errors.vehicle_number.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create password" className="h-11 pl-10 pr-10" {...form.register("password")} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password" className="text-sm font-medium">Confirm Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
            <Input id="confirm_password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" className="h-11 pl-10 pr-10" {...form.register("confirm_password")} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]">
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.formState.errors.confirm_password && <p className="text-xs text-red-500">{form.formState.errors.confirm_password.message}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[#3B7033] hover:bg-[#2D5A27] text-white rounded-xl font-bold text-sm mt-4">
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </div>
  );
}
