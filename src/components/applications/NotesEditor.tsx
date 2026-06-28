"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function NotesEditor({
  applicationId,
  initialNotes,
}: {
  applicationId: string;
  initialNotes: string | null;
}) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const isDirty = notes !== (initialNotes ?? "");
  const queryClient = useQueryClient();

  const { mutate: saveNotes, isPending } = useMutation({
    mutationFn: async () => {
      if (notes.length > 2000)
        throw new Error("Notes cannot exceed 2000 characters");

      const res = await fetch(`/api/applications/${applicationId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error ?? "Failed to save notes");

      return data;
    },
    onSuccess: () => {
      toast.success("Notes saved!");
      queryClient.refetchQueries({ queryKey: ["application", applicationId] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Add personal notes about this application... e.g. HR contact, follow-up dates, salary expectations"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        className="resize-none text-sm max-h-72"
        disabled={isPending}
      />
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <p
          className={`text-xs text-muted-foreground ${notes.length > 2000 && "text-red-500"}`}
        >
          {notes.length} characters
        </p>
        <Button
          size="sm"
          onClick={() => saveNotes()}
          disabled={isPending || !isDirty || notes.length > 2000}
        >
          {isPending ? (
            <>
              <Loader2 size={13} className="animate-spin mr-1.5" />
              Saving...
            </>
          ) : (
            <>
              <Save size={13} className="mr-1.5" />
              Save notes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
