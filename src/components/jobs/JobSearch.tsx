"use client";

import { useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Loader2, Wifi } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import type { DatePosted, EMPLOYMENT_TYPE, Job } from "@/types";
import { toast } from "sonner";
import { DATE_POSTED_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from "@/lib/constants";

type SearchParams = {
  query: string;
  location: string;
  datePosted: DatePosted;
  workFromHome: boolean | null;
  employmentType: EMPLOYMENT_TYPE | "Any";
};

export default function JobSearch() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [datePosted, setDatePosted] = useState<DatePosted>("all");
  const [workFromHome, setWorkFromHome] = useState<boolean | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [employmentType, setEmploymentType] = useState<EMPLOYMENT_TYPE>("Any");

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["jobs", searchParams],
      queryFn: async ({ pageParam = 1 }) => {
        const body: Record<string, unknown> = {
          ...searchParams,
          page: pageParam,
        };

        if (searchParams?.workFromHome !== true) delete body.workFromHome;
        if (searchParams?.employmentType === "Any") delete body.employmentType;

        const res = await fetch("/api/jobs/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.error ?? "Failed to fetch jobs. Try again.");
          throw new Error(data?.error ?? "Failed to fetch jobs");
        }

        queryClient.refetchQueries({ queryKey: ["usage"] });

        return data as { jobs: Job[] };
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.jobs.length === 10) return allPages.length + 1;
        return undefined;
      },
      enabled: !!searchParams,
      retry: false,
    });

  const allJobs = data?.pages.flatMap((page) => page.jobs) ?? [];

  const handleSearch = () => {
    if (isFetching || isFetchingNextPage) return;
    if (!query.trim()) {
      toast.error("Please enter a job title or keyword.");
      return;
    }

    setSearchParams({
      query,
      location,
      datePosted,
      workFromHome,
      employmentType,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Job title or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-8"
          />
        </div>
        <div className="relative flex-1 min-w-36">
          <MapPin
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isFetching && !isFetchingNextPage}
        >
          {isFetching && !isFetchingNextPage ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <Select
          value={employmentType}
          onValueChange={(v) => setEmploymentType(v as EMPLOYMENT_TYPE)}
        >
          <SelectTrigger className="w-36 h-8 text-xs capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={datePosted}
          onValueChange={(v) => setDatePosted(v as DatePosted)}
        >
          <SelectTrigger className="w-36 h-8 text-xs capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_POSTED_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={workFromHome === true ? "default" : "outline"}
          onClick={() => setWorkFromHome(workFromHome === true ? null : true)}
        >
          <Wifi size={12} />
          Remote only
        </Button>

        {(datePosted !== "all" ||
          workFromHome === true ||
          employmentType !== "Any") && (
          <Button
            variant={"ghost"}
            onClick={() => {
              setDatePosted("all");
              setWorkFromHome(null);
              setEmploymentType("Any");
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Clear filters
          </Button>
        )}
      </div>

      {isFetching && !isFetchingNextPage && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      )}

      {!isFetching && allJobs.length === 0 && searchParams && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No jobs found. Try a different search or adjust filters.
        </div>
      )}

      {allJobs.length > 0 && (
        <div className="flex flex-col gap-3">
          {allJobs.map((job) => (
            <JobCard key={job.job_id} job={job} source="search" />
          ))}

          {hasNextPage && (
            <Button
              variant="outline"
              className="w-max mx-auto mt-2"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Loading more...
                </>
              ) : (
                "Load more jobs"
              )}
            </Button>
          )}

          {!hasNextPage && (
            <p className="text-center text-xs text-muted-foreground py-4">
              No more jobs to load.
            </p>
          )}
        </div>
      )}

      {!searchParams && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Search for jobs above to get started.
        </div>
      )}
    </div>
  );
}
