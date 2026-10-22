import { NextRequest, NextResponse } from "next/server";
import { searchGoogleMapsLeads } from "@/lib/scraper";
import {
  saveSearchAndLeads,
  getExistingLeadIdentifiers,
  isLeadDuplicate,
  permanentlyRemoveLead,
  updateLeadStatus,
} from "@/lib/db";
import { LeadStatus } from "@/types/lead";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const country = searchParams.get("country") || "United States";
    const state = searchParams.get("state") || "All States";
    const category = searchParams.get("category") || "All Categories";
    const provider = (searchParams.get("provider") as "osm" | "serpapi") || "osm";
    const limit = Number(searchParams.get("limit")) || 20;

    const existing = await getExistingLeadIdentifiers();

    const rawLeads = await searchGoogleMapsLeads({
      query,
      country,
      state,
      category,
      provider,
      limit,
      existingLeads: existing,
    });

    const freshLeads = rawLeads.filter((l) => !isLeadDuplicate(l, existing));
    const excludedCount = rawLeads.length - freshLeads.length;

    const searchId = `search-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (freshLeads.length > 0) {
      try {
        await saveSearchAndLeads(
          {
            id: searchId,
            query,
            state,
            category,
            totalFound: freshLeads.length,
          },
          freshLeads
        );
      } catch {}
    }

    return NextResponse.json({
      success: true,
      searchId,
      total: freshLeads.length,
      leads: freshLeads,
      excludedDuplicates: excludedCount,
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, placeId, phone, website, name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lead id is required" },
        { status: 400 }
      );
    }

    await permanentlyRemoveLead({
      id,
      placeId,
      phone,
      website,
      name: name || "Removed Lead",
      reason: "user_deleted",
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to remove lead" },
      { status: 500 }
    );
  }
}
