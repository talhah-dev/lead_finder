"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RotateCcw, Filter, Zap, Sparkles } from "lucide-react";
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
import { StateCombobox } from "@/components/state-combobox";
import { CategoryCombobox } from "@/components/category-combobox";
import { RatingSelect } from "@/components/rating-select";
import { LeadFilters } from "@/types/lead";

interface SearchFiltersProps {
  filters: LeadFilters;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onReset: () => void;
  onSearch: () => void;
  isSearching: boolean;
}

interface SerpApiCredits {
  configured: boolean;
  searchesLeft: number;
  searchesPerMonth: number;
  thisMonthUsage: number;
  planName: string;
}

export function SearchFilters({
  filters,
  onFilterChange,
  onReset,
  onSearch,
  isSearching,
}: SearchFiltersProps) {
  const [credits, setCredits] = useState<SerpApiCredits | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/credits");
      const data = await res.json();
      if (data.success) {
        setCredits(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/credits");
        const data = await res.json();
        if (!ignore && data.success) {
          setCredits(data);
        }
      } catch {}
    }

    load();

    return () => {
      ignore = true;
    };
  }, [filters.provider, isSearching]);

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <div className="relative sm:col-span-2 lg:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Business name or keyword..."
              value={filters.query}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              className="pl-9 h-10 text-sm"
            />
          </div>

          <div className="lg:col-span-2">
            <StateCombobox
              value={filters.state}
              onValueChange={(val) => onFilterChange({ state: val })}
            />
          </div>

          <div className="lg:col-span-2">
            <CategoryCombobox
              value={filters.category}
              onValueChange={(val) => onFilterChange({ category: val })}
            />
          </div>

          <div className="lg:col-span-2">
            <Select
              value={filters.provider || "osm"}
              onValueChange={(val) => {
                if (val) {
                  onFilterChange({ provider: val as "osm" | "serpapi" });
                  if (val === "serpapi") fetchCredits();
                }
              }}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="osm">
                  OpenStreetMap (Free)
                </SelectItem>
                <SelectItem value="serpapi">
                  SerpApi (Google Maps)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-1">
            <Select
              value={String(filters.limit || 20)}
              onValueChange={(val) => {
                if (val) onFilterChange({ limit: Number(val) });
              }}
            >
              <SelectTrigger className="w-full h-10 px-2.5 text-xs">
                <SelectValue placeholder="Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 Leads</SelectItem>
                <SelectItem value="50">50 Leads</SelectItem>
                <SelectItem value="100">100 Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
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

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
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

            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-medium">Rating:</span>
              <div className="w-48 sm:w-52">
                <RatingSelect
                  value={filters.ratingRange || "all"}
                  onSelectRange={(opt) =>
                    onFilterChange({
                      ratingRange: opt.id,
                      minRating: opt.min,
                      maxRating: opt.max,
                    })
                  }
                  className="w-full h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {filters.provider === "serpapi" ? (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                <Zap className="size-3.5 fill-amber-500 text-amber-500 shrink-0" />
                <span>
                  {credits?.configured
                    ? `${credits.searchesLeft} / ${credits.searchesPerMonth} SerpApi Credits Left`
                    : "SerpApi Key Active"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <Sparkles className="size-3.5 text-emerald-500 shrink-0" />
                <span>100% Free & Unlimited</span>
              </div>
            )}

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
