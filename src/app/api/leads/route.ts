import { NextRequest, NextResponse } from "next/server";
import { searchGoogleMapsLeads } from "@/lib/scraper";
import { saveSearchAndLeads } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const state = searchParams.get("state") || "California";
    const category = searchParams.get("category") || "All Categories";

    const leads = await searchGoogleMapsLeads({ query, state, category });

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
