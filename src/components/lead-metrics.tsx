"use client";

import { Mail, Phone, Star, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Lead } from "@/types/lead";

interface LeadMetricsProps {
  leads: Lead[];
}

export function LeadMetrics({ leads }: LeadMetricsProps) {
  const total = leads.length;
  const withEmail = leads.filter((l) => l.email).length;
  const withPhone = leads.filter((l) => l.phone).length;
  const highRated = leads.filter((l) => l.rating >= 4.5).length;
  const avgRating =
    total > 0
      ? (leads.reduce((sum, l) => sum + l.rating, 0) / total).toFixed(1)
      : "0.0";
  const emailRate = total > 0 ? Math.round((withEmail / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card className="p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Leads</p>
            <p className="text-xl font-semibold tracking-tight">{total}</p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Building2 className="size-4" />
          </div>
        </div>
      </Card>

      <Card className="p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">With Email</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl font-semibold tracking-tight">{withEmail}</p>
              <span className="text-[11px] text-muted-foreground">({emailRate}%)</span>
            </div>
          </div>
          <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Mail className="size-4" />
          </div>
        </div>
      </Card>

      <Card className="p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Direct Phone</p>
            <p className="text-xl font-semibold tracking-tight">{withPhone}</p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Phone className="size-4" />
          </div>
        </div>
      </Card>

      <Card className="p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Avg Rating</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl font-semibold tracking-tight">{avgRating}</p>
              <span className="text-[11px] text-muted-foreground">★ ({highRated} top)</span>
            </div>
          </div>
          <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Star className="size-4" />
          </div>
        </div>
      </Card>
    </div>
  );
}
