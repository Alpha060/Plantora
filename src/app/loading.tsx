import { Leaf } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}
