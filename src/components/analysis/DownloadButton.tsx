"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, ChevronDown } from "lucide-react";
import type { Application } from "@/types";

export default function DownloadButton({ app }: { app: Application }) {
  const downloadMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          "border-2 border-border px-2 py-0.5 rounded-lg flex items-center gap-2 text-sm"
        }
      >
        <Download size={12} className="mr-1" />
        Download
        <ChevronDown size={12} className="ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            downloadMarkdown(app.tailored_resume, `resume-${app.job_title}.md`)
          }
        >
          Tailored resume (.md)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            downloadMarkdown(
              app.cover_letter,
              `cover-letter-${app.job_title}.md`,
            )
          }
        >
          Cover letter (.md)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
