"use client";

import type { Application, ApplicationStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TrackerStatusUpdate from "@/components/tracker/TrackerStatusUpdate";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FILTER_STATUS_OPTIONS } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import { PaginationControls } from "@/components/data-fetching/PaginationControls";

export default function TrackerPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim(), 300);

  const {
    data,
    isLoading: isApplicationsLoading,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["applications", debounced, statusFilter, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/applications?q=${debounced}&limit=10&page=${page}&sort=desc&status=${statusFilter}`,
      );
      const data = await res.json();
      return data;
    },
    placeholderData: (prev) => prev,
    enabled: !!user,
  });

  const applications = (data?.applications ?? []) as Application[];
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;

  if (
    !isApplicationsLoading &&
    !isFetching &&
    applications.length === 0 &&
    !debounced.trim() &&
    statusFilter === "all" &&
    isFetched
  ) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="sm:bg-card sm:border border-border rounded-xl p-16 text-center">
          <p className="font-medium text-sm mb-1">No applications yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Analyze a job to start tracking your applications.
          </p>
          <Link
            href="/jobs"
            className="text-xs font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Find jobs →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">Application tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage all your job applications.
        </p>
      </div>

      {isApplicationsLoading ? (
        <div className="min-h-[calc(100dvh-250px)] flex items-center justify-center">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search by title or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isApplicationsLoading || isFetching}
                className={`h-7 border border-input bg-input/40 px-2 rounded-md flex items-center gap-2 text-xs capitalize`}
              >
                {statusFilter ?? "Saved"}
                {isApplicationsLoading ||
                  (isFetching && (
                    <Loader2 size={12} className="ml-1 animate-spin" />
                  ))}
                <ChevronDown size={12} className="ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={"space-y-1"}>
                {FILTER_STATUS_OPTIONS.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={`flex items-center justify-between gap-4`}
                    disabled={
                      s.value === statusFilter ||
                      isApplicationsLoading ||
                      isFetching
                    }
                  >
                    {s.label}
                    {s.value === statusFilter && <Check size={12} />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground">
            {applications.length} application
            {applications.length !== 1 ? "s" : ""}
          </p>

          {applications.length === 0 && !isFetching && isFetched ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No applications match your filters.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`bg-card border border-border rounded-xl p-2 sm:p-4 grid grid-cols-1 xl:grid-cols-2 gap-4 ${isFetching && "opacity-60"}`}
                >
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {app.job_title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {app.company && (
                        <span className="text-xs text-muted-foreground">
                          {app.company}
                        </span>
                      )}
                      {app.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin size={10} /> {app.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center xl:justify-between gap-2 sm:gap-3">
                    <div>
                      <TrackerStatusUpdate
                        applicationId={app.id}
                        currentStatus={app.status}
                      />
                    </div>

                    <Link
                      href={`/analyze/${app.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Button size="sm">
                        Analysis <ArrowRight size={12} />
                      </Button>
                    </Link>

                    {app.apply_url && (
                      <a
                        href={app.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Button size="sm" variant="outline">
                          Apply <ExternalLink size={12} />
                        </Button>
                      </a>
                    )}

                    <div>
                      <Badge
                        variant="secondary"
                        className={`text-sm font-medium ${
                          app.fit_score >= 70
                            ? "text-green-500"
                            : app.fit_score >= 40
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {app.fit_score}%
                      </Badge>
                    </div>

                    <div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {app.source}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              <PaginationControls
                currentPage={currentPage}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
