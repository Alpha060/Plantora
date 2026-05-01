import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Loader2 } from "lucide-react";

function LoginFallback() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm variant="admin" />
    </Suspense>
  );
}
