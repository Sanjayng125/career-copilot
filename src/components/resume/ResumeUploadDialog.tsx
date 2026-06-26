"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ResumeUploadDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File) => {
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return false;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return false;
    }
    return true;
  };

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
      toast.success("Resume updated successfully!");

      queryClient.refetchQueries({ queryKey: ["resume"] });
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && validateFile(dropped)) setFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && validateFile(selected)) setFile(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-sm:rounded-none">
        <DialogHeader>
          <DialogTitle>Update resume</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors
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
                <CheckCircle2 size={28} className="text-foreground" />
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
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Upload size={18} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">Drop your resume here</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    PDF only · Max 5MB
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => uploadResume()}
              disabled={!file || isPending}
            >
              {isPending ? "Uploading & Parsing... ~(15s)" : "Upload & parse"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
