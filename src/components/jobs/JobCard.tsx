"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import type { Job } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export default function JobCard({
  job,
  source,
}: {
  job: Job;
  source: "search";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: analyze, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          jobTitle: job.job_title,
          company: job.employer_name,
          location: job.job_location,
          applyUrl: job.job_apply_link,
          description: job.job_description,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error ?? "Failed to analyze");

      return data;
    },
    onSuccess: (data) => {
      toast.success("Analysis complete!");
      queryClient.refetchQueries({ queryKey: ["dashboard"] });
      queryClient.refetchQueries({ queryKey: ["usage"] });
      router.push(`/analyze/${data?.applicationId}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {job.employer_logo && (
            <Image
              src={job.employer_logo}
              alt={job.employer_name}
              width={32}
              height={32}
              className="w-9 h-9 rounded-lg object-contain bg-muted p-1"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <div>
            <p className="font-medium text-sm">{job.job_title}</p>
            <p className="text-xs text-muted-foreground">{job.employer_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={job.job_apply_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline">
              Apply <ExternalLink size={12} />
            </Button>
          </a>
          <Button size="sm" onClick={() => analyze()} disabled={isPending}>
            {isPending ? (
              <>
                {"Analyzing...(~15s) "}
                <Loader2 size={12} className="animate-spin" />
              </>
            ) : (
              <>
                Analyze <ArrowRight size={12} />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {job.job_location && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={11} /> {job.job_location}
          </span>
        )}
        {job.job_posted_at && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={11} /> {job.job_posted_at}
          </span>
        )}
        {job.job_is_remote && (
          <Badge variant="secondary" className="text-xs">
            Remote
          </Badge>
        )}
        {job.job_employment_type && (
          <Badge variant="secondary" className="text-xs">
            {job.job_employment_type}
          </Badge>
        )}
      </div>
    </div>
  );
}
