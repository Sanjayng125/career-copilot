"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  LayoutList,
  BriefcaseIcon,
  LogOut,
  FileText,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme-toggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Find jobs", href: "/jobs", icon: Search },
  { label: "Tracker", href: "/tracker", icon: LayoutList },
  { label: "Resume", href: "/resume", icon: FileText },
  { label: "Pricing", href: "/pricing", icon: Crown },
];

export default function Sidebar({
  name,
  avatar,
  email,
}: {
  name: string;
  avatar: string;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.clear();
    router.replace("/");
    router.refresh();
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-56 border-r border-border bg-background flex-col z-40">
      <div className="flex items-center justify-between gap-2 px-3 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center shrink-0">
            <BriefcaseIcon size={14} className="text-background" />
          </div>
          <span className="font-medium text-sm">Career Copilot</span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border flex flex-col gap-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate">
              {name.split(" ")[0]}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {email}
            </span>
          </div>
        </div>
        <Button variant={"destructive"} onClick={handleLogout}>
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
