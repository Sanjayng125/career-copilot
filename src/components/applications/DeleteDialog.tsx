"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function DeleteDialog({
  open,
  onClose,
  onSuccess,
  applicationId,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  applicationId: string;
}) {
  const queryClient = useQueryClient();

  const { mutate: deleteApplication, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data?.error ?? "Failed to delete application");

      return data;
    },
    onSuccess: () => {
      toast.success("Application deleted successfully!");

      queryClient.refetchQueries({ queryKey: ["applications"] });
      queryClient.refetchQueries({ queryKey: ["dashboard"] });
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-sm:rounded-none">
        <DialogHeader>
          <DialogTitle>Delete application</DialogTitle>
        </DialogHeader>

        <div>
          <div className="py-2 px-3 border box-border bg-muted-foreground/10 rounded-xl">
            <p className="text-sm text-red-500 font-bold">
              Are you sure you want to delete this application?
            </p>
            <p className="text-xs">This action cannot be undone.</p>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteApplication()}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
