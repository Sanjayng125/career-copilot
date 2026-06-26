import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingUpload from "@/components/onboarding/OnboardingUpload";
import Header from "@/components/layout/Header";

export default async function OnboardingPage() {
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

  if (resume) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background px-4">
      <Header />

      <div className="w-full max-w-lg mx-auto py-10">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center mx-auto mb-4">
            <span className="text-background font-medium text-sm">C</span>
          </div>
          <h1 className="text-2xl font-medium mb-2">
            Welcome to Career Copilot
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload your resume once and we&apos;ll use it to analyze every job
            you apply to.
          </p>
        </div>

        <OnboardingUpload />
      </div>
    </div>
  );
}
