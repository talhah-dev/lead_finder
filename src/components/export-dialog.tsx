"use client";

import { useState } from "react";
import { FileSpreadsheet, FileCode, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/lead";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allLeads: Lead[];
  selectedIds: string[];
}

export function ExportDialog({
  open,
  onOpenChange,
  allLeads,
  selectedIds,
}: ExportDialogProps) {
  const [copied, setCopied] = useState(false);
  const [exportMode, setExportMode] = useState<"all" | "selected">(
    selectedIds.length > 0 ? "selected" : "all"
  );

  const targetLeads =
    exportMode === "selected" && selectedIds.length > 0
      ? allLeads.filter((l) => selectedIds.includes(l.id))
      : allLeads;

  const generateCsv = (leads: Lead[]) => {
    const headers = [
      "Name",
      "Category",
      "Phone",
      "Email",
      "Website",
      "Address",
      "City",
      "State",
      "Zip",
      "Rating",
      "Reviews",
      "Google Place ID",
    ];

    const rows = leads.map((l) => [
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.category || "").replace(/"/g, '""')}"`,
      `"${l.phone || ""}"`,
      `"${l.email || ""}"`,
      `"${l.website || ""}"`,
      `"${(l.address || "").replace(/"/g, '""')}"`,
      `"${l.city || ""}"`,
      `"${l.state || ""}"`,
      `"${l.zip || ""}"`,
      l.rating,
      l.reviewCount,
      `"${l.placeId || ""}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  };

  const handleDownloadCsv = () => {
    const csvData = generateCsv(targetLeads);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `map_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targetLeads.length} leads as CSV`);
    onOpenChange(false);
  };

  const handleDownloadJson = () => {
    const jsonData = JSON.stringify(targetLeads, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `map_leads_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targetLeads.length} leads as JSON`);
    onOpenChange(false);
  };

  const handleCopyCsv = () => {
    const csvData = generateCsv(targetLeads);
    navigator.clipboard.writeText(csvData);
    setCopied(true);
    toast.success(`Copied CSV for ${targetLeads.length} leads to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Export Lead Data</DialogTitle>
          <DialogDescription className="text-xs">
            Download your Google Maps leads formatted for Excel, Google Sheets, or CRM.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={exportMode === "selected" ? "default" : "outline"}
                className="flex-1 text-xs"
                onClick={() => setExportMode("selected")}
              >
                Selected Only ({selectedIds.length})
              </Button>
              <Button
                size="sm"
                variant={exportMode === "all" ? "default" : "outline"}
                className="flex-1 text-xs"
                onClick={() => setExportMode("all")}
              >
                All Filtered ({allLeads.length})
              </Button>
            </div>
          )}

          <div className="rounded-lg border bg-muted/20 p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Leads to Export:</span>
              <span className="font-semibold text-foreground">
                {targetLeads.length} businesses
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Included Fields:</span>
              <span className="text-foreground">Name, Phone, Email, Web, Address, Rating</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full justify-start gap-3 h-11"
              onClick={handleDownloadCsv}
            >
              <FileSpreadsheet className="size-4" />
              <div className="text-left">
                <div className="font-medium">Download CSV (.csv)</div>
                <div className="text-[11px] opacity-80">Best for Excel, Numbers, and Google Sheets</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11"
              onClick={handleDownloadJson}
            >
              <FileCode className="size-4" />
              <div className="text-left">
                <div className="font-medium">Download JSON (.json)</div>
                <div className="text-[11px] text-muted-foreground">Standard structured format for web APIs</div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-center gap-2 text-xs"
              onClick={handleCopyCsv}
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>Copy Raw CSV to Clipboard</span>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
