"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  History,
  Trash2,
  Table as TableIcon,
  LayoutGrid,
  Download,
  Calendar,
  Building,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { LeadTable } from "@/components/lead-table";
import { LeadCards } from "@/components/lead-cards";
import { LeadDetailSheet } from "@/components/lead-detail-sheet";
import { ExportDialog } from "@/components/export-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Lead } from "@/types/lead";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchHistoryItem {
  id: string;
  query: string;
  state: string;
  category: string;
  totalFound: number;
  createdAt: string;
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("table");

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["search-history"],
    queryFn: async () => {
      const res = await fetch("/api/history");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch history");
      return (json.history || []) as SearchHistoryItem[];
    },
  });

  const rawHistoryData = historyData as unknown;
  const historyItems: SearchHistoryItem[] = Array.isArray(rawHistoryData)
    ? (rawHistoryData as SearchHistoryItem[])
    : typeof rawHistoryData === "object" && rawHistoryData !== null && "history" in rawHistoryData
      ? (((rawHistoryData as { history: unknown }).history || []) as SearchHistoryItem[])
      : [];

  useEffect(() => {
    if (historyItems.length > 0 && !selectedSearchId) {
      setSelectedSearchId(historyItems[0].id);
    }
  }, [historyItems, selectedSearchId]);

  const selectedSearch =
    historyItems.find((h) => h.id === selectedSearchId) ||
    historyItems[0] ||
    null;

  const {
    data: leadsData,
    isLoading: isLoadingLeads,
  } = useQuery({
    queryKey: ["search-history-leads", selectedSearch?.id],
    queryFn: async () => {
      if (!selectedSearch?.id) return [] as Lead[];
      const res = await fetch(`/api/history?searchId=${selectedSearch.id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch leads");
      return (json.leads || []) as Lead[];
    },
    enabled: !!selectedSearch?.id,
  });

  const rawLeadsData = leadsData as unknown;
  const leads: Lead[] = Array.isArray(rawLeadsData)
    ? (rawLeadsData as Lead[])
    : typeof rawLeadsData === "object" && rawLeadsData !== null && "leads" in rawLeadsData
      ? (((rawLeadsData as { leads: unknown }).leads || []) as Lead[])
      : [];

  const deleteMutation = useMutation({
    mutationFn: async (id?: string) => {
      const url = id ? `/api/history?searchId=${id}` : "/api/history";
      const res = await fetch(url, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete history");
      return { id };
    },
    onSuccess: (data) => {
      toast.success(data.id ? "Search session removed" : "All history cleared");
      queryClient.invalidateQueries({ queryKey: ["search-history"] });
      queryClient.invalidateQueries({ queryKey: ["search-history-leads"] });
      if (data.id && selectedSearchId === data.id) {
        setSelectedSearchId(null);
      } else if (!data.id) {
        setSelectedSearchId(null);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete history");
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        onExportClick={leads.length > 0 ? () => setIsExportOpen(true) : undefined}
        totalLeads={leads.length}
      />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "xs" }),
                  "h-6 -ml-2 text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowLeft className="size-3.5 mr-1" />
                Back to Finder
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Search History
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and export previous searches and leads stored in your Neon database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchHistory()}
              disabled={isLoadingHistory}
              className="h-8 text-xs gap-1.5"
            >
              {isFetchingHistory ? (
                <Spinner className="size-3.5" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              <span>Refresh</span>
            </Button>

            {historyItems.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(undefined)}
                disabled={deleteMutation.isPending || isLoadingHistory}
                className="h-8 text-xs gap-1.5"
              >
                {deleteMutation.isPending && !deleteMutation.variables ? (
                  <>
                    <Spinner className="size-3.5" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Clear All</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <History className="size-10 text-muted-foreground/60 mb-3" />
            <h3 className="text-base font-medium">No search history yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              When you search for business leads, your search sessions and extracted data will be saved here automatically.
            </p>
            <Link href="/" className={buttonVariants({ size: "sm" })}>
              Start a New Search
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Searches ({historyItems.length})
              </h2>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {historyItems.map((item) => {
                  const isSelected = selectedSearch?.id === item.id;
                  const dateFormatted = new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <Card
                      key={item.id}
                      onClick={() => {
                        setSelectedSearchId(item.id);
                        setSelectedLeadIds([]);
                      }}
                      className={`cursor-pointer transition-all border p-3 ${
                        isSelected
                          ? "ring-2 ring-primary border-transparent bg-muted/30"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">
                            {item.query ? `"${item.query}"` : item.category}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <span>{item.state}</span>
                            <span>•</span>
                            <Badge variant="secondary" className="text-[10px] h-4 font-normal">
                              {item.category}
                            </Badge>
                          </div>
                        </div>

                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                          {item.totalFound} leads
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between border-t mt-2.5 pt-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {dateFormatted}
                        </span>

                        <Button
                          size="icon-xs"
                          variant="ghost"
                          className="size-5 text-muted-foreground hover:text-destructive"
                          disabled={deleteMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(item.id);
                          }}
                        >
                          {deleteMutation.isPending && deleteMutation.variables === item.id ? (
                            <Spinner className="size-3" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {selectedSearch && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold tracking-tight">
                        {selectedSearch.query ? `"${selectedSearch.query}"` : selectedSearch.category}
                      </h2>
                      <Badge variant="secondary" className="text-xs">
                        {selectedSearch.state}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {leads.length} saved leads retrieved from Neon
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
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
                      disabled={leads.length === 0}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Download className="size-3.5" />
                      <span>Export CSV</span>
                    </Button>
                  </div>
                </div>
              )}

              {isLoadingLeads ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center py-12 border rounded-xl gap-2 text-xs text-muted-foreground">
                    <Spinner className="size-4" />
                    <span>Loading leads from database...</span>
                  </div>
                </div>
              ) : leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                  <Building className="size-8 text-muted-foreground/60 mb-2" />
                  <p className="text-xs text-muted-foreground">Select a search on the left to view leads.</p>
                </div>
              ) : activeTab === "table" ? (
                <LeadTable
                  leads={leads}
                  selectedIds={selectedLeadIds}
                  onSelectChange={setSelectedLeadIds}
                  onLeadClick={(lead) => {
                    setActiveLead(lead);
                    setIsDetailOpen(true);
                  }}
                  onExportSelected={() => setIsExportOpen(true)}
                  hasSearched={true}
                />
              ) : (
                <LeadCards
                  leads={leads}
                  onLeadClick={(lead) => {
                    setActiveLead(lead);
                    setIsDetailOpen(true);
                  }}
                  hasSearched={true}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <LeadDetailSheet
        lead={activeLead}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        allLeads={leads}
        selectedIds={selectedLeadIds}
      />
    </div>
  );
}
