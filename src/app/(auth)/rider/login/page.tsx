import { Suspense } from "react";
import { RiderAuthLayout } from "../rider-auth-layout";
import { RiderLoginForm } from "@/components/auth/rider-login-form";
import { Loader2 } from "lucide-react";

function LoginFallback() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-[#3B7033]" />
    </div>
  );
}

export default function RiderLoginPage() {
  return (
    <RiderAuthLayout>
      <Suspense fallback={<LoginFallback />}>
        <RiderLoginForm />
      </Suspense>
    </RiderAuthLayout>
  );
}
