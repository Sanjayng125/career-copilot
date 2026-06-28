import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  page: number;
  setPage: (value: React.SetStateAction<number>) => void;
  totalPages: number;
  disabled?: boolean;
}

export const PaginationControls = ({
  currentPage,
  page,
  setPage,
  totalPages,
  disabled,
}: PaginationControlsProps) => {
  return (
    <div className="mt-6 flex justify-center items-center gap-4 text-sm">
      <button
        disabled={page === 1 || disabled}
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        className="text-foreground disabled:opacity-50"
      >
        <ArrowLeft />
      </button>
      <span className="text-zinc-500">
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={page === totalPages || disabled}
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        className="text-foreground disabled:opacity-50"
      >
        <ArrowRight />
      </button>
    </div>
  );
};
