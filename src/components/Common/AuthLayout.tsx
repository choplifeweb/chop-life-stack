import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
// import { Appearance } from "@/components/Common/Appearance";
import { Footer } from "./Footer";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-zinc-900 relative hidden lg:flex lg:items-center lg:justify-center">
        <img
          src="/assets/images/chop_life_logo_black.png"
          alt="Chop Life"
          className="h-32 w-auto invert"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          {/* <Appearance /> */}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
