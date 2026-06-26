"use client";

import {
  BarChart2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
  Download,
  LogOut,
} from "lucide-react";
import type { Application, Resume } from "@/types";
import Link from "next/link";
import { getAvgFitScore, getStatusCounts } from "@/utils";
import { STATUS_STYLES } from "@/lib/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import UsageCard from "@/components/dashboard/UsageCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: resumeData, isLoading: isResumeLoading } = useQuery({
    queryKey: ["resume"],
    queryFn: async () => {
      const res = await fetch("/api/resume");
      const data = await res.json();

      if (!data?.resume) router.replace("/onboarding");

      return data;
    },
    enabled: !!user,
  });

  const { data, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });

  if (isResumeLoading || isStatsLoading)
    return (
      <div className="w-full min-h-screen max-w-7xl px-6 py-10 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );

  const toastApplications = data?.stats?.total ?? 0;
  const toastInterviews = data?.stats?.interview ?? 0;
  const toastOffers = data?.stats?.offer ?? 0;
  const avgFitScore = data?.stats?.avgFitScore ?? 0;
  const recentApplications = (data?.recent as Application[]) ?? [];

  const resume = resumeData?.resume as Resume;

  const stats = [
    {
      label: "Total applications",
      value: toastApplications,
      icon: <Briefcase size={16} />,
    },
    {
      label: "Interviews",
      value: toastInterviews,
      icon: <BarChart2 size={16} />,
    },
    { label: "Offers", value: toastOffers, icon: <Trophy size={16} /> },
    {
      label: "Avg fit score",
      value: avgFitScore ? `${avgFitScore}%` : "—",
      icon: <CheckCircle2 size={16} />,
    },
  ];

  const handleResumeDownload = async () => {
    if (!resume?.file_path) return;

    const { data: file, error } = await supabase.storage
      .from("resumes")
      .download(resume.file_path);

    if (error || !file) {
      console.error("Failed to download resume:", error);
      return;
    }

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = resume.file_name || "resume";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.clear();
    router.replace("/");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">
          Hey, {user.user_metadata?.full_name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s your job hunt overview.
        </p>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-2 sm:p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                {stat.icon}
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="text-2xl font-medium">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-3 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <CheckCircle2 size={16} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{resume.file_name}</p>
              <p className="text-xs text-muted-foreground">
                Resume uploaded and parsed
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleResumeDownload}>
            <Download size={13} className="mr-1.5" />
            View
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm">Recent applications</h2>
            {toastApplications > 0 && (
              <Link
                href="/tracker"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            )}
          </div>

          {recentApplications.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <XCircle
                size={24}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="text-sm font-medium mb-1">No applications yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Search for jobs and start applying.
              </p>
              <Link
                href="/jobs"
                className="text-xs font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                Search jobs →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-card border border-border rounded-xl px-2.5 py-2 sm:px-5 sm:py-4 flex flex-wrap gap-2 items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {app.job_title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.company} · {app.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.fit_score && (
                      <span className="text-xs text-muted-foreground">
                        {app.fit_score}% fit
                      </span>
                    )}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[app.status]}`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <UsageCard />

      <Button
        variant={"destructive"}
        onClick={handleLogout}
        className={"md:hidden"}
      >
        <LogOut size={16} />
        Sign out
      </Button>
    </div>
  );
}
