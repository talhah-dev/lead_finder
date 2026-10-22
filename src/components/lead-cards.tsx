"use client";

import { useState } from "react";
import {
  ExternalLink,
  Mail,
  Phone,
  Star,
  MapPin,
  Clock,
  Copy,
  Check,
  Building,
  Search,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lead, LeadStatus } from "@/types/lead";
import { LeadStatusActions } from "@/components/lead-status-actions";
import { toast } from "sonner";

interface LeadCardsProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  isLoading?: boolean;
  hasSearched?: boolean;
}

export function LeadCards({
  leads,
  onLeadClick,
  onStatusChange,
  isLoading = false,
  hasSearched = false,
}: LeadCardsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="flex flex-col justify-between border p-4 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <div className="space-y-2 border-t pt-3">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex justify-between border-t pt-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
        ))}
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
        <h3 className="text-base font-medium">No leads match your criteria</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Try adjusting your search terms or filters above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {leads.map((lead) => {
        const phoneKey = `card-phone-${lead.id}`;
        const emailKey = `card-email-${lead.id}`;

        return (
          <Card
            key={lead.id}
            className="flex flex-col justify-between transition-shadow hover:shadow-md cursor-pointer border"
            onClick={() => onLeadClick(lead)}
          >
            <div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="text-[10px] mb-1.5 font-normal">
                      {lead.category}
                    </Badge>
                    <CardTitle className="text-base line-clamp-1">{lead.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 shrink-0">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    <span>{lead.rating.toFixed(1)}</span>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs mt-1">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">
                    {lead.address}, {lead.city}, {lead.state}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 pt-1 pb-3 text-xs">
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="size-3" />
                    Phone
                  </span>
                  <div className="flex items-center gap-1 font-mono">
                    <span>{lead.phone}</span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="size-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyText(lead.phone, "Phone", phoneKey);
                      }}
                    >
                      {copiedKey === phoneKey ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="size-3" />
                    Email
                  </span>
                  {lead.email ? (
                    <div className="flex items-center gap-1 font-mono">
                      <span className="max-w-[150px] truncate">{lead.email}</span>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="size-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyText(lead.email!, "Email", emailKey);
                        }}
                      >
                        {copiedKey === emailKey ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not found</span>
                  )}
                </div>

                {lead.openingHours && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3" />
                      Hours
                    </span>
                    <span>{lead.openingHours}</span>
                  </div>
                )}

                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">Status</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <LeadStatusActions
                      leadId={lead.id}
                      currentStatus={lead.status}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                </div>
              </CardContent>
            </div>

            <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5 text-xs">
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Visit Website</span>
                <ExternalLink className="size-3" />
              </a>

              <Button
                variant="outline"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onLeadClick(lead);
                }}
              >
                View Profile
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
