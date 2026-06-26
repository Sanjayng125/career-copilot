"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function OnboardingUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { mutate: uploadResume, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error ?? "Failed to parse resume");

      return data;
    },
    onSuccess: () => {
      toast.success("Resume uploaded successfully!");
      router.replace("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (dropped.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }
    setFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }
    setFile(selected);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8 flex flex-col gap-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
          ${dragging ? "border-foreground bg-muted" : "border-border hover:border-foreground/40 hover:bg-muted/50"}
          ${file ? "border-foreground/40 bg-muted/50" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <>
            <CheckCircle2 size={32} className="text-foreground" />
            <div className="text-center">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} /> Remove
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Upload size={20} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Drop your resume here</p>
              <p className="text-muted-foreground text-xs mt-1">
                or click to browse · PDF only · Max 5MB
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          What we extract
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Skills & technologies",
            "Work experience",
            "Education",
            "Summary",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <FileText size={12} />
              {item}
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => uploadResume()}
        disabled={!file || isPending}
        size="lg"
        className="w-full"
      >
        {isPending ? "Uploading & parsing..." : "Upload resume"}
      </Button>
    </div>
  );
}
