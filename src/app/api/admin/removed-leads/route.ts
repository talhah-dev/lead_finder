import { NextRequest, NextResponse } from "next/server";
import {
  getBlacklistedLeads,
  permanentlyRemoveLead,
  unblacklistLead,
} from "@/lib/db";

export async function GET() {
  try {
    const leads = await getBlacklistedLeads();
    return NextResponse.json({ success: true, leads });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch removed leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, placeId, phone, website, name, reason } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: "ID and name are required" },
        { status: 400 }
      );
    }

    await permanentlyRemoveLead({ id, placeId, phone, website, name, reason });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to remove lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    await unblacklistLead(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to unblock lead" },
      { status: 500 }
    );
  }
}
