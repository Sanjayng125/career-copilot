"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApplicationStatus } from "@/types";
import { STATUS_OPTIONS, STATUS_STYLES } from "@/lib/constants";

export default function TrackerStatusUpdate({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const queryClient = useQueryClient();

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async (newStatus: ApplicationStatus) => {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, newStatus) => {
      setStatus(newStatus);
      queryClient.refetchQueries({ queryKey: ["applications"] });
      queryClient.refetchQueries({ queryKey: ["dashboard"] });
      toast.success("Status updated!");
    },
    onError: () => {
      toast.error("Failed to update status.");
    },
  });

  const current = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={`h-6 border-2 border-border px-2 py-0.5 rounded-lg flex items-center gap-2 text-xs ${STATUS_STYLES[currentStatus]}`}
      >
        {current?.label ?? "Saved"}
        {isPending && <Loader2 size={12} className="ml-1 animate-spin" />}
        <ChevronDown size={12} className="ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={"space-y-1"}>
        {STATUS_OPTIONS.map((s) => (
          <DropdownMenuItem
            key={s.value}
            onClick={() => updateStatus(s.value)}
            className={`flex items-center justify-between gap-4 ${STATUS_STYLES[s.value]}`}
            disabled={s.value === currentStatus || isPending}
          >
            {s.label}
            {s.value === status && <Check size={12} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
