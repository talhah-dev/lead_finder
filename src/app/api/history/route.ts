import { NextRequest, NextResponse } from "next/server";
import {
  getSearchHistory,
  getLeadsBySearchId,
  getAllSavedLeads,
  deleteSearchHistory,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("searchId");
    const allLeads = searchParams.get("allLeads") === "true";

    if (searchId) {
      const leads = await getLeadsBySearchId(searchId);
      return NextResponse.json({ success: true, leads });
    }

    if (allLeads) {
      const leads = await getAllSavedLeads();
      return NextResponse.json({ success: true, leads });
    }

    const history = await getSearchHistory();
    return NextResponse.json({ success: true, history });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to fetch history",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("searchId") || undefined;

    await deleteSearchHistory(searchId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to delete history",
      },
      { status: 500 }
    );
  }
}
