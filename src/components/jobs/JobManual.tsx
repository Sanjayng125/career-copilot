"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function JobManual() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: analyze, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "manual",
          jobTitle,
          company,
          location,
          applyUrl,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Failed to analyze");

      return data;
    },
    onSuccess: (data) => {
      toast.success("Analysis complete!");
      queryClient.refetchQueries({ queryKey: ["dashboard"] });
      router.push(`/analyze/${data.applicationId}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = () => {
    if (!jobTitle.trim() || !description.trim()) {
      toast.error("Job title and description are required.");
      return;
    }
    analyze();
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Job title *</Label>
          <Input
            placeholder="e.g. Frontend Developer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Company</Label>
          <Input
            placeholder="e.g. Google"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Location</Label>
          <Input
            placeholder="e.g. Bangalore, India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Apply URL</Label>
          <Input
            placeholder="https://..."
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Job description *</Label>
        <Textarea
          placeholder="Paste the full job description here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          The more detail you paste, the better the AI analysis.
        </p>
      </div>

      <Button onClick={handleSubmit} disabled={isPending} className="w-fit">
        {isPending ? "Analyzing... (~15s)" : "Analyze this job →"}
      </Button>
    </div>
  );
}
