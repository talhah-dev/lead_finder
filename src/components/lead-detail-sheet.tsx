"use client";

import { useState } from "react";
import {
  ExternalLink,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Star,
  Copy,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@/types/lead";
import { toast } from "sonner";

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
}: LeadDetailSheetProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!lead) return null;

  const copyField = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const copyFullCard = () => {
    const card = [
      `Business: ${lead.name}`,
      `Category: ${lead.category}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email || "N/A"}`,
      `Website: ${lead.website}`,
      `Address: ${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`,
      `Rating: ${lead.rating} (${lead.reviewCount} reviews)`,
    ].join("\n");

    navigator.clipboard.writeText(card);
    toast.success("Full lead card copied to clipboard");
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${lead.name} ${lead.address} ${lead.city} ${lead.state}`
  )}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        <div className="p-6 pb-4">
          <SheetHeader className="p-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {lead.category}
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                {lead.state}
              </Badge>
            </div>
            <SheetTitle className="text-xl font-bold leading-tight">
              {lead.name}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 text-xs mt-1">
              <span className="flex items-center text-amber-500 font-semibold">
                <Star className="size-3.5 fill-amber-500 mr-1" />
                <span>{lead.rating.toFixed(1)}</span>
              </span>
              <span>•</span>
              <span>{lead.reviewCount} Reviews</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Verified Listing</span>
            </SheetDescription>
          </SheetHeader>
        </div>

        <Separator />

        <div className="p-6 space-y-5 text-sm">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Contact Channels
            </h4>
            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5" />
                  <span>Phone Number</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <a
                    href={`tel:${lead.phone}`}
                    className="hover:underline font-medium text-foreground"
                  >
                    {lead.phone}
                  </a>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => copyField(lead.phone, "Phone", "detail-phone")}
                  >
                    {copiedKey === "detail-phone" ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5" />
                  <span>Enriched Email</span>
                </div>
                {lead.email ? (
                  <div className="flex items-center gap-1 font-mono">
                    <a
                      href={`mailto:${lead.email}`}
                      className="hover:underline font-medium text-foreground"
                    >
                      {lead.email}
                    </a>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => copyField(lead.email!, "Email", "detail-email")}
                    >
                      {copiedKey === "detail-email" ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Not found</span>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="size-3.5" />
                  <span>Website</span>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-mono"
                  >
                    <span className="truncate max-w-[140px]">
                      {lead.website.replace(/^https?:\/\//, "")}
                    </span>
                    <ExternalLink className="size-3" />
                  </a>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => copyField(lead.website, "Website", "detail-website")}
                  >
                    {copiedKey === "detail-website" ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Google Maps Location & Hours
            </h4>
            <div className="rounded-lg border bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{lead.address}</p>
                  <p className="text-muted-foreground">
                    {lead.city}, {lead.state} {lead.zip}
                  </p>
                </div>
              </div>

              {lead.openingHours && (
                <div className="flex items-center gap-2 border-t pt-2 text-muted-foreground">
                  <Clock className="size-3.5 shrink-0" />
                  <span>{lead.openingHours}</span>
                </div>
              )}
            </div>
          </div>

          {lead.enrichmentDetails && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Crawler & Enrichment Intelligence
              </h4>
              <div className="rounded-lg border bg-muted/10 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Extraction Source</span>
                  <span className="font-mono text-[11px] truncate max-w-[190px]">
                    {lead.enrichmentDetails.sourceUrl || "Website Homepage"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Domain Verified</span>
                  <Badge
                    variant={lead.enrichmentDetails.domainVerified ? "default" : "secondary"}
                    className="text-[10px] h-4"
                  >
                    {lead.enrichmentDetails.domainVerified ? "Verified Active" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Google Place ID</span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">
                    {lead.placeId}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <SheetFooter className="p-6 pt-4 flex-col sm:flex-col gap-2">
          <Button className="w-full gap-2" onClick={copyFullCard}>
            <Copy className="size-4" />
            Copy Complete Lead Card
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => window.open(googleMapsUrl, "_blank")}
          >
            <ExternalLink className="size-4" />
            Open in Google Maps
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
