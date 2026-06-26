"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlignLeft,
  Briefcase,
  CheckCircle2,
  Code2,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Upload,
} from "lucide-react";
import ResumeUploadDialog from "@/components/resume/ResumeUploadDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Resume } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";

export default function ResumePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const supabase = createClient();

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

  const resume = resumeData?.resume as Resume;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">Your resume</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View your parsed resume data or upload a new version.
        </p>
      </div>
      {isResumeLoading && (
        <div className="w-full min-h-[calc(100dvh-250px)] max-w-7xl px-6 py-10 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin" />
        </div>
      )}
      {!isResumeLoading && resume && (
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-xl p-2.5 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{resume.file_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last updated{" "}
                  {new Date(resume.updated_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResumeDownload}
              >
                <Download size={13} className="mr-1.5" />
                View
              </Button>

              <Button size="sm" onClick={() => setOpen(true)}>
                <Upload size={13} className="mr-1.5" />
                Update
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {resume.parsed_data?.summary && (
              <div className="bg-card border border-border rounded-xl p-2.5 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlignLeft size={14} className="text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                </div>
                <p className="text-sm leading-relaxed">
                  {resume.parsed_data.summary}
                </p>
              </div>
            )}

            {resume.parsed_data?.skills?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-2.5 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 size={14} className="text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Skills
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.parsed_data.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {resume.parsed_data?.experience?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-2.5 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase size={14} className="text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Experience
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {resume.parsed_data.experience.map((exp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        size={13}
                        className="text-muted-foreground mt-0.5 shrink-0"
                      />
                      <p className="text-sm">{exp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resume.parsed_data?.education?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-2.5 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap size={14} className="text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Education
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {resume.parsed_data.education.map((edu, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        size={13}
                        className="text-muted-foreground mt-0.5 shrink-0"
                      />
                      <p className="text-sm">{edu}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ResumeUploadDialog
            open={open}
            onClose={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
