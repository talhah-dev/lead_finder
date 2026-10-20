import { NextRequest, NextResponse } from "next/server";
import {
  getAccessRequests,
  updateAccessRequestStatus,
  deleteAccessRequest,
} from "@/lib/db";

export async function GET() {
  try {
    const requests = await getAccessRequests();
    return NextResponse.json({ success: true, requests });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, role } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID and status are required" },
        { status: 400 }
      );
    }

    await updateAccessRequestStatus(id, status, role);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update request" },
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

    await deleteAccessRequest(id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to delete request" },
      { status: 500 }
    );
  }
}
