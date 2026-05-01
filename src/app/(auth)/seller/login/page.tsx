import { Suspense } from "react";
import { SellerAuthLayout } from "../seller-auth-layout";
import { SellerLoginForm } from "@/components/auth/seller-login-form";
import { Loader2 } from "lucide-react";

function LoginFallback() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-[#3B7033]" />
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <SellerAuthLayout>
      <Suspense fallback={<LoginFallback />}>
        <SellerLoginForm />
      </Suspense>
    </SellerAuthLayout>
  );
}
