"use client";

import { useState, useMemo } from "react";
import {
  Table as TableIcon,
  LayoutGrid,
  Download,
  MapPin,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SearchFilters } from "@/components/search-filters";
import { LeadMetrics } from "@/components/lead-metrics";
import { LeadTable } from "@/components/lead-table";
import { LeadCards } from "@/components/lead-cards";
import { LeadDetailSheet } from "@/components/lead-detail-sheet";
import { ExportDialog } from "@/components/export-dialog";
import { AccessGate } from "@/components/access-gate";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead, LeadFilters } from "@/types/lead";
import { toast } from "sonner";

const INITIAL_FILTERS: LeadFilters = {
  query: "",
  state: "All States",
  hasEmailOnly: false,
  hasPhoneOnly: false,
  hasWebsiteOnly: false,
  minRating: 0,
  maxRating: 5,
  ratingRange: "all",
  category: "All Categories",
  provider: "osm",
  limit: 20,
};

export default function Home() {
  const [filters, setFilters] = useState<LeadFilters>(INITIAL_FILTERS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("table");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (
        filters.state &&
        !filters.state.startsWith("All ") &&
        filters.state !== "All States" &&
        filters.state !== "All Regions" &&
        filters.state !== "All Cities"
      ) {
        const s = filters.state.toLowerCase();
        const matchesState = lead.state?.toLowerCase().includes(s);
        const matchesCity = lead.city?.toLowerCase().includes(s);
        const matchesAddress = lead.address?.toLowerCase().includes(s);
        if (!matchesState && !matchesCity && !matchesAddress) {
          return false;
        }
      }

      if (filters.category && filters.category !== "All Categories") {
        if (lead.category !== filters.category) {
          return false;
        }
      }

      if (filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesCategory = lead.category.toLowerCase().includes(q);
        const matchesCity = lead.city.toLowerCase().includes(q);
        const matchesAddress = lead.address.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesCity && !matchesAddress) {
          return false;
        }
      }

      if (filters.hasEmailOnly && !lead.email) {
        return false;
      }

      if (filters.hasPhoneOnly && !lead.phone) {
        return false;
      }

      if (filters.hasWebsiteOnly && !lead.website) {
        return false;
      }

      if (filters.minRating > 0 && lead.rating < filters.minRating) {
        return false;
      }

      if (
        filters.maxRating !== undefined &&
        filters.maxRating < 5 &&
        lead.rating > filters.maxRating
      ) {
        return false;
      }

      return true;
    });
  }, [leads, filters]);

  const handleFilterChange = (updated: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setLeads([]);
    setHasSearched(false);
    setSelectedIds([]);
    toast.info("Filters reset to default");
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    const providerName =
      filters.provider === "serpapi" ? "SerpApi (Google Maps)" : "OpenStreetMap";

    try {
      const params = new URLSearchParams({
        query: filters.query,
        country: filters.country || "United States",
        state: filters.state,
        category: filters.category,
        provider: filters.provider || "osm",
        limit: String(filters.limit || 20),
      });

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
        setSelectedIds([]);
        if (data.leads.length === 0) {
          if (data.excludedDuplicates && data.excludedDuplicates > 0) {
            toast.info(
              `All ${data.excludedDuplicates} found leads are already saved in your database`
            );
          } else {
            toast.info(`No leads found via ${providerName} for this criteria`);
          }
        } else {
          const excludedNote =
            data.excludedDuplicates && data.excludedDuplicates > 0
              ? ` (${data.excludedDuplicates} previously saved excluded)`
              : "";
          toast.success(
            `Found ${data.leads.length} new leads via ${providerName}${excludedNote}`
          );
        }
      } else {
        toast.error("Failed to fetch leads from server");
      }
    } catch {
      toast.error("Server error while searching leads");
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenLead = (lead: Lead) => {
    setActiveLead(lead);
    setIsDetailOpen(true);
  };

  const handleRemoveLead = async (lead: Lead) => {
    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          placeId: lead.placeId,
          phone: lead.phone,
          website: lead.website,
          name: lead.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l.id !== lead.id));
        setSelectedIds((prev) => prev.filter((id) => id !== lead.id));
        toast.success(`Removed "${lead.name}". It will never appear in future searches.`);
      } else {
        toast.error("Failed to remove lead");
      }
    } catch {
      toast.error("Network error while removing lead");
    }
  };

  return (
    <AccessGate>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar
          onExportClick={filteredLeads.length > 0 ? () => setIsExportOpen(true) : undefined}
          totalLeads={filteredLeads.length}
        />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-2 py-0.5 font-normal">
              <MapPin className="size-3 mr-1 text-primary" />
              Local Business Intelligence
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Google Maps Lead Finder
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Extract business names, direct phone numbers, verified emails, and websites
            across any US state and industry. Every search is automatically saved to your Neon database.
          </p>
        </div>

        <SearchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onSearch={handleSearch}
          isSearching={isSearching}
        />

        {hasSearched && filteredLeads.length > 0 && (
          <LeadMetrics leads={filteredLeads} />
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">
                Business Leads
              </h2>
              {hasSearched && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {filteredLeads.length} Results
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Tabs
                value={activeTab}
                onValueChange={(val) => {
                  if (val) setActiveTab(val);
                }}
              >
                <TabsList className="h-8">
                  <TabsTrigger value="table" className="text-xs gap-1.5 px-2.5">
                    <TableIcon className="size-3.5" />
                    <span>Table</span>
                  </TabsTrigger>
                  <TabsTrigger value="cards" className="text-xs gap-1.5 px-2.5">
                    <LayoutGrid className="size-3.5" />
                    <span>Cards</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportOpen(true)}
                disabled={filteredLeads.length === 0}
                className="gap-1.5 h-8 text-xs"
              >
                <Download className="size-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {activeTab === "table" ? (
            <LeadTable
              leads={filteredLeads}
              selectedIds={selectedIds}
              onSelectChange={setSelectedIds}
              onLeadClick={handleOpenLead}
              onExportSelected={() => setIsExportOpen(true)}
              onRemoveLead={handleRemoveLead}
              isLoading={isSearching}
              hasSearched={hasSearched}
            />
          ) : (
            <LeadCards
              leads={filteredLeads}
              onLeadClick={handleOpenLead}
              isLoading={isSearching}
              hasSearched={hasSearched}
            />
          )}
        </div>
      </main>

      <LeadDetailSheet
        lead={activeLead}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        allLeads={filteredLeads}
        selectedIds={selectedIds}
      />
    </div>
  </AccessGate>
  );
}
