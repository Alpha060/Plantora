import { Suspense } from "react";
import { RiderAuthLayout } from "../rider-auth-layout";
import { RiderRegisterForm } from "@/components/auth/rider-register-form";
import { Loader2 } from "lucide-react";

function RegisterFallback() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-[#3B7033]" />
    </div>
  );
}

export default function RiderRegisterPage() {
  return (
    <RiderAuthLayout>
      <Suspense fallback={<RegisterFallback />}>
        <RiderRegisterForm />
      </Suspense>
    </RiderAuthLayout>
  );
}
