"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";

export default function HeaderAuth() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.clear();
    router.replace("/");
    router.refresh();
  };

  if (!user) {
    return (
      <Link href="/login">
        <Button size="sm">Sign in</Button>
      </Link>
    );
  }

  const name = (user.user_metadata?.full_name as string) ?? "User";
  const avatar = (user.user_metadata?.avatar_url as string) ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors outline-none">
        <Avatar className="w-7 h-7">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:block">
          {name.split(" ")[0]}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/jobs" className="flex items-center gap-2 cursor-pointer">
            <Search size={14} />
            Search jobs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut size={14} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
