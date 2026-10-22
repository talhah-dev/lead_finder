import { NextRequest, NextResponse } from "next/server";
import { searchGoogleMapsLeads } from "@/lib/scraper";
import { saveSearchAndLeads, updateLeadStatus } from "@/lib/db";
import { LeadStatus } from "@/types/lead";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const state = searchParams.get("state") || "California";
    const category = searchParams.get("category") || "All Categories";
    const provider = (searchParams.get("provider") as "osm" | "serpapi") || "osm";
    const limit = Number(searchParams.get("limit")) || 20;

    const leads = await searchGoogleMapsLeads({ query, state, category, provider, limit });

    const searchId = `search-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    try {
      await saveSearchAndLeads(
        {
          id: searchId,
          query,
          state,
          category,
          totalFound: leads.length,
        },
        leads
      );
    } catch {}

    return NextResponse.json({
      success: true,
      searchId,
      total: leads.length,
      leads,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to search leads",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { search, leads } = body;

    if (!search?.id || !Array.isArray(leads)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    await saveSearchAndLeads(search, leads);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to save leads" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, status } = body as { leadId: string; status: LeadStatus };

    if (!leadId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing leadId or status" },
        { status: 400 }
      );
    }

    await updateLeadStatus(leadId, status);
    return NextResponse.json({ success: true, leadId, status });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update lead status" },
      { status: 500 }
    );
  }
}
