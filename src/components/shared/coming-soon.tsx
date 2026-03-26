import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hammer, ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ 
  title, 
  description = "This feature is currently under development. Our team is working hard to bring it to you soon!" 
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="h-20 w-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-6">
        <Hammer className="h-10 w-10 animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-slate-600 max-w-md mb-8">
        {description}
      </p>
      <Link href="/">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
