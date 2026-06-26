import Link from "next/link";
import { BriefcaseIcon } from "lucide-react";
import HeaderAuth from "@/components/layout/HeaderAuth";

export default async function Header() {
  return (
    <nav className="flex items-center justify-between px-3 py-2 sm:px-8 sm:py-4 border-b border-border">
      <Link href={"/"} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
          <BriefcaseIcon size={14} className="text-background" />
        </div>
        <span className="font-medium text-sm">Career Copilot</span>
      </Link>
      <HeaderAuth />
    </nav>
  );
}
