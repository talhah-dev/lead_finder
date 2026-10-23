"use client";

import { useState } from "react";
import {
  ExternalLink,
  Star,
  Check,
  Copy,
  Eye,
  Building,
  Search,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Lead, LeadStatus } from "@/types/lead";
import { LeadStatusActions } from "@/components/lead-status-actions";
import { cleanPhone } from "@/lib/deduplicate";
import { toast } from "sonner";

interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onLeadClick: (lead: Lead) => void;
  onExportSelected: () => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onRemoveLead?: (lead: Lead) => void;
  isLoading?: boolean;
  hasSearched?: boolean;
}

export function LeadTable({
  leads,
  selectedIds,
  onSelectChange,
  onLeadClick,
  onExportSelected,
  onStatusChange,
  onRemoveLead,
  isLoading = false,
  hasSearched = false,
}: LeadTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isAllSelected = leads.length > 0 && selectedIds.length === leads.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectChange([]);
    } else {
      onSelectChange(leads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  const copySelectedEmails = () => {
    const emails = leads
      .filter((l) => selectedIds.includes(l.id) && l.email)
      .map((l) => l.email as string)
      .join(", ");

    if (!emails) {
      toast.error("No emails found among selected leads");
      return;
    }
    navigator.clipboard.writeText(emails);
    toast.success(`Copied ${selectedIds.length} email(s) to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 px-3"></TableHead>
              <TableHead className="min-w-[220px]">Business Name</TableHead>
              <TableHead className="min-w-[110px]">Rating</TableHead>
              <TableHead className="min-w-[150px]">Phone Number</TableHead>
              <TableHead className="min-w-[200px]">Enriched Email</TableHead>
              <TableHead className="min-w-[160px]">Website</TableHead>
              <TableHead className="min-w-[140px]">Location</TableHead>
              <TableHead className="min-w-[180px]">Status</TableHead>
              <TableHead className="w-16 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell className="px-3">
                  <Skeleton className="size-4" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-28" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="size-6 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!hasSearched && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Search className="size-10 text-muted-foreground/60 mb-3" />
        <h3 className="text-base font-medium">Ready to search leads</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Choose a category, state, or enter a business keyword above, then click &quot;Find Leads&quot; to fetch live data.
        </p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Building className="size-10 text-muted-foreground/60 mb-3" />
        <h3 className="text-base font-medium">No leads found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Try adjusting your search query, selecting another US state, or relaxing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/60 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {selectedIds.length} lead{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={copySelectedEmails}
              className="gap-1"
            >
              <Copy className="size-3" />
              Copy Emails
            </Button>
            <Button
              size="xs"
              variant="default"
              onClick={onExportSelected}
              className="gap-1"
            >
              Export Selected
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => onSelectChange([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 px-3">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all leads"
                />
              </TableHead>
              <TableHead className="min-w-[220px]">Business Name</TableHead>
              <TableHead className="min-w-[110px]">Rating</TableHead>
              <TableHead className="min-w-[150px]">Phone Number</TableHead>
              <TableHead className="min-w-[200px]">Enriched Email</TableHead>
              <TableHead className="min-w-[160px]">Website</TableHead>
              <TableHead className="min-w-[140px]">Location</TableHead>
              <TableHead className="min-w-[180px]">Status</TableHead>
              <TableHead className="w-16 text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const phoneKey = `phone-${lead.id}`;
              const emailKey = `email-${lead.id}`;

              return (
                <TableRow
                  key={lead.id}
                  className={`transition-colors cursor-pointer ${
                    isSelected ? "bg-muted/30" : ""
                  }`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest("button") ||
                      target.closest("a") ||
                      target.closest("input") ||
                      target.closest("[role=checkbox]")
                    ) {
                      return;
                    }
                    onLeadClick(lead);
                  }}
                >
                  <TableCell
                    className="px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectOne(lead.id)}
                      aria-label={`Select ${lead.name}`}
                    />
                  </TableCell>

                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium hover:underline text-foreground">
                        {lead.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-normal"
                        >
                          {lead.category}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-amber-500">
                        <Star className="size-3.5 fill-amber-500" />
                        <span className="text-xs font-semibold ml-1 text-foreground">
                          {lead.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        ({lead.reviewCount})
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {lead.phone ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono">{cleanPhone(lead.phone)}</span>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          className="size-6 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(cleanPhone(lead.phone), "Phone number", phoneKey);
                          }}
                        >
                          {copiedId === phoneKey ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {lead.email ? (
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono px-2 py-0.5 text-foreground bg-muted/30"
                        >
                          {lead.email}
                        </Badge>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          className="size-6 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(lead.email!, "Email address", emailKey);
                          }}
                        >
                          {copiedId === emailKey ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant="ghost"
                        className="text-[11px] text-muted-foreground font-normal px-1.5 py-0"
                      >
                        Not available
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="truncate max-w-[120px]">
                        {lead.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    <span>
                      {lead.city}, {lead.state}
                    </span>
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <LeadStatusActions
                      leadId={lead.id}
                      currentStatus={lead.status}
                      onStatusChange={onStatusChange}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeadClick(lead);
                        }}
                        className="size-7 text-muted-foreground hover:text-foreground"
                        title="View details"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      {onRemoveLead && (
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLead(lead);
                          }}
                          className="size-7 text-muted-foreground hover:text-destructive"
                          title="Remove & permanently exclude lead"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
