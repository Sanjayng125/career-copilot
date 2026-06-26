import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/auth/LoginButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-8 py-12 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Career Copilot
          </h1>
          <p className="text-muted-foreground text-sm text-center">
            Your AI-powered job application assistant
          </p>
        </div>

        <div className="w-full border border-border rounded-xl p-8 flex flex-col gap-6 bg-card">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-lg">Get started</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to start applying smarter
            </p>
          </div>
          <LoginButton />

          <Link href="/" className="mx-auto">
            <Button variant="ghost" className="underline">
              <ArrowLeft className="h-5 w-5" />
              <span>Go to home</span>
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
