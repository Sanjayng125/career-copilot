"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";
import { UsageData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Zap, Search, BarChart2, Crown } from "lucide-react";
import Link from "next/link";
import Notice from "../notice";

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color =
    pct >= 100 ? "bg-red-500" : pct >= 66 ? "bg-yellow-500" : "bg-foreground";

  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function UsageCard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const res = await fetch("/api/usage");
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json() as Promise<UsageData>;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const isPro = data?.plan === "pro";

  return (
    <div className="bg-card border border-border rounded-xl p-2.5 sm:p-5 mb-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-muted-foreground" />
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Daily usage
          </p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isPro
              ? "bg-yellow-500/10 text-yellow-500"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isPro ? (
            <span className="flex items-center gap-1">
              <Crown size={10} /> Pro
            </span>
          ) : (
            "Free"
          )}
        </span>
      </div>

      <Notice message="Due to very low free quota of Job Search API, i have restricted the route to very low search limits. so test the project wisely." />

      {isPro ? (
        <p className="text-xs text-muted-foreground">
          You're on Pro — unlimited analyses and searches.
          {data.plan_expires_at && (
            <span className="block mt-1">
              Renews on{" "}
              {new Date(data.plan_expires_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart2 size={12} />
                Analyses
              </div>
              <span className="text-xs text-muted-foreground">
                {data.usage.analyses.used}/{data.usage.analyses.limit} today
              </span>
            </div>
            <UsageBar
              used={data.usage.analyses.used}
              limit={data.usage.analyses.limit}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Search size={12} />
                Job searches
              </div>
              <span className="text-xs text-muted-foreground">
                {data.usage.searches.used}/{data.usage.searches.limit} today
              </span>
            </div>
            <UsageBar
              used={data.usage.searches.used}
              limit={data.usage.searches.limit}
            />
          </div>

          <Link
            href="/pricing"
            className="w-full mt-1 flex items-center justify-center gap-1.5 bg-muted hover:bg-muted/70 transition-colors text-xs font-medium py-2 rounded-lg"
          >
            <Crown size={12} />
            Upgrade to Pro
          </Link>

          <Notice
            message="Use test card: 4242 4242 4242 4242, any future date and rest any values."
            className="mt-5 mx-auto w-max"
          />
        </div>
      )}
    </div>
  );
}
