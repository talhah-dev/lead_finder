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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead, LeadFilters, LeadStatus } from "@/types/lead";
import { toast } from "sonner";
import { deduplicateLeads } from "@/lib/deduplicate";

const INITIAL_FILTERS: LeadFilters = {
  query: "",
  state: "California",
  hasEmailOnly: false,
  hasPhoneOnly: false,
  hasWebsiteOnly: false,
  minRating: 0,
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
    const matching = leads.filter((lead) => {
      if (filters.state && filters.state !== "All States") {
        if (lead.state.toLowerCase() !== filters.state.toLowerCase()) {
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

      return true;
    });
    return deduplicateLeads(matching);
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
        state: filters.state,
        category: filters.category,
        provider: filters.provider || "osm",
        limit: String(filters.limit || 20),
      });

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.leads)) {
        const unique = deduplicateLeads(data.leads);
        setLeads(unique);
        setSelectedIds([]);
        if (unique.length === 0) {
          toast.info(`No leads found via ${providerName} for this criteria`);
        } else {
          toast.success(
            `Found ${unique.length} unique leads via ${providerName} and saved to database`
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

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (activeLead && activeLead.id === leadId) {
      setActiveLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
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
              onStatusChange={handleStatusChange}
              isLoading={isSearching}
              hasSearched={hasSearched}
            />
          ) : (
            <LeadCards
              leads={filteredLeads}
              onLeadClick={handleOpenLead}
              onStatusChange={handleStatusChange}
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
        onStatusChange={handleStatusChange}
      />

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        allLeads={filteredLeads}
        selectedIds={selectedIds}
      />
    </div>
  );
}
