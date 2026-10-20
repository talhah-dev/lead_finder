"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Globe,
  MapPin,
  Building2,
  ChevronRight,
  RefreshCw,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorldCountry, WorldSubdivision, WorldCity } from "@/types/admin";
import { cn } from "@/lib/utils";

export function LocationsView() {
  const [countryFilter, setCountryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("US");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const detailSectionRef = useRef<HTMLDivElement>(null);

  const {
    data: countriesData,
    isLoading: isLoadingCountries,
    isFetching: isFetchingCountries,
    refetch: refetchCountries,
  } = useQuery({
    queryKey: ["admin", "world-countries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/world-data?type=countries");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load countries");
      return (json.countries || []) as WorldCountry[];
    },
  });

  const rawCountriesData = countriesData as unknown;
  const countries: WorldCountry[] = Array.isArray(rawCountriesData)
    ? (rawCountriesData as WorldCountry[])
    : typeof rawCountriesData === "object" && rawCountriesData !== null && "countries" in rawCountriesData
      ? (((rawCountriesData as { countries: unknown }).countries || []) as WorldCountry[])
      : [];

  const selectedCountry = useMemo(() => {
    return (
      countries.find((c) => c.code === selectedCountryCode) ||
      countries[0] ||
      null
    );
  }, [countries, selectedCountryCode]);

  const {
    data: subdivisionsData,
    isLoading: isLoadingSubdivisions,
    isFetching: isFetchingSubdivisions,
  } = useQuery({
    queryKey: ["admin", "subdivisions", selectedCountry?.code, cityFilter],
    queryFn: async () => {
      if (!selectedCountry?.code) return { states: [], cities: [], totalCities: 0 };
      const url = cityFilter
        ? `/api/admin/world-data?type=subdivisions&countryCode=${selectedCountry.code}&cityQuery=${encodeURIComponent(
            cityFilter.trim()
          )}`
        : `/api/admin/world-data?type=subdivisions&countryCode=${selectedCountry.code}`;
      const res = await fetch(url);
      const json = await res.json();
      return {
        states: (json.states || []) as WorldSubdivision[],
        cities: (json.cities || []) as WorldCity[],
        totalCities: (json.totalCities || (json.cities || []).length) as number,
      };
    },
    enabled: !!selectedCountry?.code,
  });

  const states = subdivisionsData?.states || [];
  const cities = subdivisionsData?.cities || [];
  const totalCities = subdivisionsData?.totalCities || 0;

  const handleSelectCountry = (country: WorldCountry, shouldScroll: boolean = true) => {
    setSelectedCountryCode(country.code);
    setStateFilter("");
    setCityFilter("");

    if (shouldScroll && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const filteredCountries = useMemo(() => {
    if (!countryFilter) return countries;
    const term = countryFilter.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term)
    );
  }, [countries, countryFilter]);

  const totalPages = Math.ceil(filteredCountries.length / pageSize) || 1;
  const paginatedCountries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCountries.slice(start, start + pageSize);
  }, [filteredCountries, currentPage, pageSize]);

  const filteredStates = useMemo(() => {
    if (!stateFilter) return states;
    const term = stateFilter.toLowerCase();
    return states.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term)
    );
  }, [states, stateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search world countries (e.g., Pakistan, United States, Germany)..."
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Badge variant="outline" className="text-xs font-normal">
              {filteredCountries.length} countries
            </Badge>
            <Button
              size="icon-xs"
              variant="outline"
              onClick={() => refetchCountries()}
              title="Refresh countries"
              className="size-8"
            >
              {isFetchingCountries ? (
                <Spinner className="size-3.5" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Card className="border shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-xs">Flag</TableHead>
              <TableHead className="text-xs">Country Name</TableHead>
              <TableHead className="text-xs">Code</TableHead>
              <TableHead className="text-xs">Dialing</TableHead>
              <TableHead className="text-xs">Currency</TableHead>
              <TableHead className="text-xs">States / Regions</TableHead>
              <TableHead className="text-xs text-right">Explore</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingCountries ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-6 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedCountries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-xs text-muted-foreground"
                >
                  No countries match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedCountries.map((country) => {
                const isSelected = selectedCountry?.code === country.code;
                return (
                  <TableRow
                    key={country.code}
                    onClick={() => handleSelectCountry(country, true)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected
                        ? "bg-muted/80 hover:bg-muted font-medium"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <TableCell className="text-base py-2.5">
                      {country.flag || "🌐"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <span>{country.name}</span>
                        {isSelected && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 h-4"
                          >
                            Selected
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {country.code}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {country.phonecode ? `+${country.phonecode}` : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {country.currency || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {country.statesCount !== undefined
                        ? `${country.statesCount} states`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="size-7"
                        title="View states and cities"
                      >
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredCountries.length)} of{" "}
              {filteredCountries.length} countries
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon-xs"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="size-7"
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                size="icon-xs"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="size-7"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="px-2 font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="icon-xs"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="size-7"
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                size="icon-xs"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="size-7"
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div ref={detailSectionRef} className="pt-2">
        {selectedCountry ? (
          <Card className="border shadow-xs">
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCountry.flag || "🌐"}</span>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>{selectedCountry.name}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {selectedCountry.code}
                      </Badge>
                      {isFetchingSubdivisions && (
                        <Spinner className="size-3.5 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Subdivisions, administrative states, and metropolitan cities
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {selectedCountry.phonecode && (
                    <Badge variant="secondary" className="font-mono">
                      Dial: +{selectedCountry.phonecode}
                    </Badge>
                  )}
                  {selectedCountry.currency && (
                    <Badge variant="secondary">
                      Currency: {selectedCountry.currency}
                    </Badge>
                  )}
                  <Badge variant="default">
                    {states.length} States / Regions
                  </Badge>
                  <Badge variant="outline">
                    {totalCities} Cities
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <Tabs defaultValue="states" className="w-full">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3">
                  <TabsList className="h-9">
                    <TabsTrigger value="states" className="text-xs gap-1.5">
                      <MapPin className="size-3.5" />
                      <span>States & Provinces ({states.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="cities" className="text-xs gap-1.5">
                      <Building2 className="size-3.5" />
                      <span>Cities ({totalCities})</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="states" className="mt-0 space-y-3">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder={`Search states in ${selectedCountry.name}...`}
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>

                  {isLoadingSubdivisions ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                      ))}
                    </div>
                  ) : filteredStates.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border rounded-lg">
                      No states or provinces found for {selectedCountry.name}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
                      {filteredStates.map((state) => (
                        <div
                          key={state.code + state.name}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border bg-card/60 hover:bg-muted/50 transition-colors text-xs"
                        >
                          <span className="font-medium truncate pr-2">
                            {state.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="font-mono text-[10px] shrink-0"
                          >
                            {state.code}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cities" className="mt-0 space-y-3">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder={`Search cities in ${selectedCountry.name}...`}
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>

                  {isLoadingSubdivisions ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                      ))}
                    </div>
                  ) : cities.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border rounded-lg">
                      No cities found for {selectedCountry.name}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
                      {cities.map((city, idx) => (
                        <div
                          key={city.name + city.stateCode + idx}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border bg-card/60 hover:bg-muted/50 transition-colors text-xs"
                        >
                          <span className="font-medium truncate pr-2">
                            {city.name}
                          </span>
                          {city.stateCode && (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] shrink-0"
                            >
                              {city.stateCode}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="p-8 text-center border rounded-xl text-xs text-muted-foreground flex flex-col items-center gap-2">
            <Globe className="size-6 text-muted-foreground/60" />
            <span>Select any country in the table above to view all its states and cities</span>
          </div>
        )}
      </div>
    </div>
  );
}
