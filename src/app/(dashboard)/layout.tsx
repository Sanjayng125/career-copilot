import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Career Copilot - Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: resume } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!resume) redirect("/onboarding");

  const name = (user.user_metadata?.full_name as string) ?? "User";
  const avatar = (user.user_metadata?.avatar_url as string) ?? "";
  const email = user.email ?? "";

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar name={name} avatar={avatar} email={email} />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
