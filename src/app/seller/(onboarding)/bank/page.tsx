"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const bankSchema = z.object({
  account_holder: z.string().min(2, "Account holder name required"),
  account_number: z.string().min(8, "Valid account number required").max(20),
  ifsc_code: z.string().min(11, "Valid 11-character IFSC code required").max(11),
  bank_name: z.string().min(2, "Bank name required"),
  upi_id: z.string().optional(),
});

type BankFormData = z.infer<typeof bankSchema>;

export default function OnboardingBankPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      account_holder: "",
      account_number: "",
      ifsc_code: "",
      bank_name: "",
      upi_id: "",
    },
  });

  const onSubmit = async (data: BankFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/seller/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to save bank details");
        return;
      }

      toast.success("Bank details saved. Onboarding complete!");
      // Send to pending approval
      router.push("/seller/pending-approval");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-lowest rounded-2xl shadow-ambient border border-surface-container-high p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface mb-2">Bank Details</h1>
        <p className="text-on-surface-variant">Provide your bank account details for settlements and payouts.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="account_holder">Account Holder Name *</Label>
            <Input id="account_holder" placeholder="Name as per bank records" {...form.register("account_holder")} />
            {form.formState.errors.account_holder && <p className="text-xs text-error">{form.formState.errors.account_holder.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name *</Label>
            <Input id="bank_name" placeholder="E.g., State Bank of India" {...form.register("bank_name")} />
            {form.formState.errors.bank_name && <p className="text-xs text-error">{form.formState.errors.bank_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifsc_code">IFSC Code *</Label>
            <Input id="ifsc_code" placeholder="11-character alphanumeric code" maxLength={11} className="uppercase" {...form.register("ifsc_code")} />
            {form.formState.errors.ifsc_code && <p className="text-xs text-error">{form.formState.errors.ifsc_code.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="account_number">Account Number *</Label>
            <Input id="account_number" type="password" placeholder="Enter account number" {...form.register("account_number")} />
            {form.formState.errors.account_number && <p className="text-xs text-error">{form.formState.errors.account_number.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="upi_id">UPI ID (Optional)</Label>
            <Input id="upi_id" placeholder="yourname@upi" {...form.register("upi_id")} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-surface-container-high mt-8">
          <Button 
            type="button"
            variant="ghost" 
            onClick={() => router.push("/seller/onboarding/documents")}
            disabled={isLoading}
            className="text-on-surface-variant"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button 
            type="submit"
            disabled={isLoading} 
            className="bg-primary px-8 rounded-full h-12 shadow-md"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
