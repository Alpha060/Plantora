import { Suspense } from "react";
import { SellerAuthLayout } from "../seller-auth-layout";
import { SellerRegisterForm } from "@/components/auth/seller-register-form";
import { Loader2 } from "lucide-react";

function RegisterFallback() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-[#3B7033]" />
    </div>
  );
}

export default function SellerRegisterPage() {
  return (
    <SellerAuthLayout>
      <Suspense fallback={<RegisterFallback />}>
        <SellerRegisterForm />
      </Suspense>
    </SellerAuthLayout>
  );
}
