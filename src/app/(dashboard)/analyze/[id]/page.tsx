"use client";

import { useParams } from "next/navigation";
import type { Application } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FitScoreRing from "@/components/analysis/FitScoreRing";
import DownloadButton from "@/components/analysis/DownloadButton";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import NotFound from "@/app/not-found";
import TrackerStatusUpdate from "@/components/tracker/TrackerStatusUpdate";
import NotesEditor from "@/components/applications/NotesEditor";

export default function AnalyzePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data, isLoading: isApplicationLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const res = await fetch(`/api/applications/${id}`);

      const data = await res.json();

      if (!res.ok) toast.error(data?.error ?? "Failed to fetch application");

      return data;
    },
    enabled: !!user && !!id,
  });

  const app = data?.application as Application;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
      {isApplicationLoading && (
        <div className="w-full min-h-[calc(100dvh-150px)] max-w-7xl px-6 py-10 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin" />
        </div>
      )}

      {!isApplicationLoading && !app && <NotFound />}

      {!isApplicationLoading && app && (
        <div>
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-medium">{app.job_title}</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {app.company && (
                  <span className="text-sm text-muted-foreground">
                    {app.company}
                  </span>
                )}
                {app.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={11} /> {app.location}
                  </span>
                )}
                {app.apply_url && (
                  <a
                    href={app.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink size={11} /> Apply link
                  </a>
                )}
              </div>
            </div>
            <TrackerStatusUpdate
              applicationId={app.id}
              currentStatus={app.status}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card h-fit border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2">
              <FitScoreRing score={app.fit_score} />
              <p className="text-xs text-muted-foreground">Overall fit</p>
            </div>
            <div className="sm:col-span-2 bg-card border border-border rounded-xl p-2.5 sm:p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                AI Summary
              </p>
              <p className="text-sm leading-relaxed">{app.ai_summary}</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-2.5 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-green-500" />
                <p className="text-xs font-medium text-green-500">
                  Matched skills
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {app.matched_skills?.length > 0 ? (
                  app.matched_skills?.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">N/A</p>
                )}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-2.5 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={14} className="text-red-500" />
                <p className="text-xs font-medium text-red-500">
                  Missing skills
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {app.missing_skills?.length > 0 ? (
                  app.missing_skills?.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">N/A</p>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="resume">
            <div className="flex items-center flex-wrap gap-2 justify-between mb-4">
              <TabsList>
                <TabsTrigger value="resume">Tailored resume</TabsTrigger>
                <TabsTrigger value="cover">Cover letter</TabsTrigger>
              </TabsList>
              <DownloadButton app={app} />
            </div>

            <TabsContent value="resume">
              <div className="bg-card border border-border rounded-xl p-3 sm:p-6 prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {app.tailored_resume}
                </ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent value="cover">
              <div className="bg-card border border-border rounded-xl p-3 sm:p-6 prose prose-sm prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {app.cover_letter}
                </ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 bg-card border border-border rounded-xl p-2.5 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
              Personal notes
            </p>
            <NotesEditor applicationId={app.id} initialNotes={app.notes} />
          </div>
        </div>
      )}
    </div>
  );
}
