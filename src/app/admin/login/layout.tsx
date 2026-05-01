import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-lowest">
      {/* Top Banner */}
      <div className="relative w-full h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#1a1025] via-[#2d1b3d] to-[#0f0a18]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_50%,rgba(156,39,176,0.3),transparent_70%)]" />

        <div className="relative z-10 px-12 py-8 bg-surface-lowest/10 backdrop-blur-md border border-surface-lowest/20 rounded-2xl flex flex-col items-center">
          <Link href="/">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2 text-center">
              {APP_NAME}
            </h1>
          </Link>
          <p className="text-purple-300/80 text-xs sm:text-sm tracking-[0.2em] uppercase font-medium">
            Admin Console
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <footer className="bg-primary/5 py-10 px-6 sm:px-12 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-primary/70">
            © {new Date().getFullYear()} {APP_NAME}. Restricted access.
          </p>
        </div>
      </footer>
    </div>
  );
}
