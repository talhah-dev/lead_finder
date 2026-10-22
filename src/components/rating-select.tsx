"use client";

import { Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "cn";

export interface RatingOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const RATING_OPTIONS: RatingOption[] = [
  { id: "all", label: "All Ratings", min: 0, max: 5 },
  { id: "1-2", label: "1 to 2 Rating", min: 1, max: 2 },
  { id: "1-3", label: "1 to 3 Rating", min: 1, max: 3 },
  { id: "1-4", label: "1 to 4 Rating", min: 1, max: 4 },
  { id: "1-5", label: "1 to 5 Rating", min: 1, max: 5 },
  { id: "2-3", label: "2 to 3 Rating", min: 2, max: 3 },
  { id: "2-4", label: "2 to 4 Rating", min: 2, max: 4 },
  { id: "2-5", label: "2 to 5 Rating", min: 2, max: 5 },
  { id: "3-4", label: "3 to 4 Rating", min: 3, max: 4 },
  { id: "3-5", label: "3 to 5 Rating", min: 3, max: 5 },
  { id: "4-5", label: "4 to 5 Rating", min: 4, max: 5 },
];

interface RatingSelectProps {
  value?: string;
  onSelectRange: (option: RatingOption) => void;
  className?: string;
}

export function RatingSelect({
  value = "all",
  onSelectRange,
  className,
}: RatingSelectProps) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => {
        if (!val) return;
        const opt = RATING_OPTIONS.find((o) => o.id === val) || RATING_OPTIONS[0];
        onSelectRange(opt);
      }}
    >
      <SelectTrigger className={className || "w-full h-8 text-xs"}>
        <SelectValue placeholder="All Ratings" />
      </SelectTrigger>
      <SelectContent className="min-w-48 max-h-80">
        {RATING_OPTIONS.map((opt) => (
          <SelectItem key={opt.id} value={opt.id}>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Star
                className={cn(
                  "size-3.5 shrink-0",
                  opt.id === "all"
                    ? "text-muted-foreground"
                    : "fill-amber-400 text-amber-500"
                )}
              />
              <span>{opt.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const RatingCombobox = RatingSelect;
