"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [selectedSearch, setSelectedSearch] = useState<SearchHistoryItem | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("table");

  const loadSearchLeads = useCallback(async (item: SearchHistoryItem) => {
    setSelectedSearch(item);
    setIsLoadingLeads(true);
    setSelectedLeadIds([]);
    try {
      const res = await fetch(`/api/history?searchId=${item.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      }
    } catch {
      toast.error("Failed to load leads for this search");
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistoryItems(data.history);
        if (data.history.length > 0) {
          loadSearchLeads(data.history[0]);
        }
      }
    } catch {
      toast.error("Failed to load search history");
    } finally {
      setIsLoading(false);
    }
  }, [loadSearchLeads]);

  const handleDeleteHistory = async (id?: string) => {
    if (id) {
      setDeletingId(id);
    } else {
      setIsDeletingAll(true);
    }
    try {
      const url = id ? `/api/history?searchId=${id}` : "/api/history";
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(id ? "Search session removed" : "All history cleared");
        if (id) {
          setHistoryItems((prev) => prev.filter((i) => i.id !== id));
          if (selectedSearch?.id === id) {
            setSelectedSearch(null);
            setLeads([]);
          }
        } else {
          setHistoryItems([]);
          setSelectedSearch(null);
          setLeads([]);
        }
      }
    } catch {
      toast.error("Failed to delete history");
    } finally {
      if (id) {
        setDeletingId(null);
      } else {
        setIsDeletingAll(false);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.history)) {
          setHistoryItems(data.history);
          if (data.history.length > 0) {
            const first = data.history[0];
            setSelectedSearch(first);
            const lRes = await fetch(`/api/history?searchId=${first.id}`);
            const lData = await lRes.json();
            if (!ignore && lData.success && Array.isArray(lData.leads)) {
              setLeads(lData.leads);
            }
          }
        }
      } catch {
        if (!ignore) toast.error("Failed to load search history");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, []);

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
              onClick={fetchHistory}
              disabled={isLoading}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            {historyItems.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteHistory()}
                disabled={isDeletingAll || Boolean(deletingId) || isLoading}
                className="h-8 text-xs gap-1.5"
              >
                {isDeletingAll ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
            <RefreshCw className="size-8 animate-spin text-muted-foreground/60 mb-2" />
            <p className="text-xs text-muted-foreground">Loading Neon history...</p>
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
                      onClick={() => loadSearchLeads(item)}
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
                          disabled={deletingId === item.id || isDeletingAll}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHistory(item.id);
                          }}
                        >
                          {deletingId === item.id ? (
                            <RefreshCw className="size-3 animate-spin" />
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
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
                  <RefreshCw className="size-6 animate-spin text-muted-foreground/60 mb-2" />
                  <p className="text-xs text-muted-foreground">Loading leads from Neon database...</p>
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
                />
              ) : (
                <LeadCards
                  leads={leads}
                  onLeadClick={(lead) => {
                    setActiveLead(lead);
                    setIsDetailOpen(true);
                  }}
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
