"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { StateCombobox, RegionOption } from "@/components/state-combobox";
import { CategoryCombobox, CategoryOption } from "@/components/category-combobox";
import { CountryCombobox, CountryOption } from "@/components/country-combobox";
import { RatingSelect } from "@/components/rating-select";
import { LeadFilters } from "@/types/lead";
import { WorldCountry } from "@/types/admin";

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

interface LoadedCategory {
  id: string;
  name: string;
  countryId: string | null;
  sector: string;
}

export function SearchFilters({
  filters,
  onFilterChange,
  onReset,
  onSearch,
  isSearching,
}: SearchFiltersProps) {
  const { data: creditsData, refetch: refetchCredits } = useQuery({
    queryKey: ["credits"],
    queryFn: async () => {
      const res = await fetch("/api/credits");
      const json = await res.json();
      return json.success ? (json as SerpApiCredits) : null;
    },
    enabled: filters.provider === "serpapi",
  });

  const { data: countriesData } = useQuery({
    queryKey: ["admin", "world-countries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/world-data?type=countries");
      const json = await res.json();
      return (json.countries || []) as WorldCountry[];
    },
  });

  const { data: catData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      return (json.categories || []) as LoadedCategory[];
    },
  });

  const credits = creditsData || null;
  const rawCountries = countriesData as unknown;
  const countries: WorldCountry[] = Array.isArray(rawCountries)
    ? (rawCountries as WorldCountry[])
    : typeof rawCountries === "object" && rawCountries !== null && "countries" in rawCountries
      ? (((rawCountries as { countries: unknown }).countries || []) as WorldCountry[])
      : [];

  const categories = catData || [];

  const fetchCredits = useCallback(() => {
    refetchCredits();
  }, [refetchCredits]);

  const activeCountry = useMemo(() => {
    if (!filters.country) {
      return countries.find((c) => c.code === "US") || countries[0];
    }
    return (
      countries.find(
        (c) =>
          c.name.toLowerCase() === filters.country?.toLowerCase() ||
          c.code.toLowerCase() === filters.country?.toLowerCase()
      ) || countries[0]
    );
  }, [countries, filters.country]);

  const { data: subdivisionsData } = useQuery({
    queryKey: ["subdivisions", activeCountry?.code],
    queryFn: async () => {
      if (!activeCountry?.code) return { states: [], cities: [] };
      const res = await fetch(
        `/api/admin/world-data?type=subdivisions&countryCode=${activeCountry.code}`
      );
      const json = await res.json();
      return {
        states: (json.states || []) as { name: string; code: string }[],
        cities: (json.cities || []) as { name: string; stateCode?: string }[],
      };
    },
    enabled: !!activeCountry?.code,
  });

  const dynamicRegions: RegionOption[] = useMemo(() => {
    if (!activeCountry) return [];

    const isUS = activeCountry.code === "US";
    const allLabel = isUS ? "All States" : `All ${activeCountry.name}`;
    const allOption: RegionOption = {
      code: "ALL",
      label: allLabel,
      region: "Entire Country",
    };

    const states = subdivisionsData?.states || [];
    const cities = subdivisionsData?.cities || [];

    const stateOptions: RegionOption[] = states.map((s) => ({
      code: s.code,
      label: s.name,
      region: "State / Province",
    }));

    const cityOptions: RegionOption[] = cities.map((c) => ({
      code: c.stateCode || "",
      label: c.name,
      region: "City",
    }));

    return [allOption, ...stateOptions, ...cityOptions];
  }, [activeCountry, subdivisionsData]);

  const dynamicCategories: CategoryOption[] = useMemo(() => {
    if (categories.length === 0) return [];
    const filtered = categories.filter(
      (c) =>
        c.countryId === null ||
        (activeCountry?.code && c.countryId?.toUpperCase() === activeCountry.code.toUpperCase()) ||
        (activeCountry?.name && c.countryId?.toLowerCase() === activeCountry.name.toLowerCase())
    );
    return filtered.map((c) => ({
      id: c.id,
      label: c.name,
      sector: c.sector || "General",
    }));
  }, [categories, activeCountry]);

  const handleCountryChange = (country: CountryOption) => {
    const isUS = country.code === "US";
    const defaultRegion = isUS ? "All States" : `All ${country.name}`;
    onFilterChange({
      country: country.name,
      state: defaultRegion,
    });
  };

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
              onFocus={(e) => e.currentTarget.select()}
              className="pl-9 h-10 text-sm"
            />
          </div>

          <div className="lg:col-span-2">
            <CountryCombobox
              value={activeCountry?.name || "United States"}
              onValueChange={handleCountryChange}
              items={countries.length > 0 ? countries : undefined}
              placeholder="Search country..."
            />
          </div>

          <div className="lg:col-span-2">
            <StateCombobox
              value={filters.state}
              onValueChange={(val) => onFilterChange({ state: val })}
              items={dynamicRegions.length > 0 ? dynamicRegions : undefined}
              placeholder={
                activeCountry?.name === "Pakistan"
                  ? "Search city or province..."
                  : activeCountry?.name === "Canada"
                  ? "Search province or city..."
                  : activeCountry?.name === "United States"
                  ? "Search state or city..."
                  : `Search in ${activeCountry?.name || "country"}...`
              }
            />
          </div>

          <div className="lg:col-span-2">
            <CategoryCombobox
              value={filters.category}
              onValueChange={(val) => onFilterChange({ category: val })}
              items={dynamicCategories.length > 0 ? dynamicCategories : undefined}
            />
          </div>

          <div className="lg:col-span-1">
            <Select
              value={filters.provider || "osm"}
              onValueChange={(val) => {
                if (val) {
                  onFilterChange({ provider: val as "osm" | "serpapi" });
                  if (val === "serpapi") fetchCredits();
                }
              }}
            >
              <SelectTrigger className="w-full h-10 px-2 text-xs">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="osm" className="text-xs">
                  OSM
                </SelectItem>
                <SelectItem value="serpapi" className="text-xs">
                  SerpApi
                </SelectItem>
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
