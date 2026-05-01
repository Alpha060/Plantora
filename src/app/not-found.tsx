import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
          <Leaf className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-6xl font-bold text-emerald-700 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Page not found
        </h2>
        <p className="text-gray-500 mb-6 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
