"use client";

import { Search, RotateCcw, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { US_STATES, CATEGORIES } from "@/data/mockLeads";
import { LeadFilters } from "@/types/lead";

interface SearchFiltersProps {
  filters: LeadFilters;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onReset: () => void;
  onSearch: () => void;
  isSearching: boolean;
}

export function SearchFilters({
  filters,
  onFilterChange,
  onReset,
  onSearch,
  isSearching,
}: SearchFiltersProps) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Service or business name..."
              value={filters.query}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              className="pl-9 h-10 text-sm"
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={filters.state}
              onValueChange={(val) => {
                if (val) onFilterChange({ state: val });
              }}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select US State" />
              </SelectTrigger>
              <SelectContent className="min-w-56">
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Select
              value={filters.category}
              onValueChange={(val) => {
                if (val) onFilterChange({ category: val });
              }}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="min-w-64">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <Button
              className="w-full h-10 gap-2 font-medium"
              onClick={onSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  <span>Find Leads</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Filter className="size-3.5" />
              Quick Filters:
            </span>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={filters.hasEmailOnly}
                onCheckedChange={(checked) =>
                  onFilterChange({ hasEmailOnly: Boolean(checked) })
                }
              />
              <span>Has Verified Email</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={filters.hasPhoneOnly}
                onCheckedChange={(checked) =>
                  onFilterChange({ hasPhoneOnly: Boolean(checked) })
                }
              />
              <span>Has Phone Number</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={filters.hasWebsiteOnly}
                onCheckedChange={(checked) =>
                  onFilterChange({ hasWebsiteOnly: Boolean(checked) })
                }
              />
              <span>Has Website</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={filters.minRating >= 4.5}
                onCheckedChange={(checked) =>
                  onFilterChange({ minRating: checked ? 4.5 : 0 })
                }
              />
              <span>Rating 4.5+ ★</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs h-8 text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RotateCcw className="size-3" />
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
