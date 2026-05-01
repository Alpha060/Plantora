"use client";

import { useEffect } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center px-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Leaf className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-500 mb-6 max-w-md">
            An unexpected error occurred. Please try again or go back to the homepage.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
