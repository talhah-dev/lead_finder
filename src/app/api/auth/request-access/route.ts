import { NextRequest, NextResponse } from "next/server";
import { createAccessRequest, getAccessRequests } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const req = await createAccessRequest({ name, email });

    return NextResponse.json({
      success: true,
      request: req,
      message:
        req.status === "approved"
          ? "You already have approved access"
          : "Your access request has been submitted and is pending administrator review",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to submit request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email query parameter required" },
        { status: 400 }
      );
    }

    const all = await getAccessRequests();
    const match = all.find((u) => u.email.toLowerCase() === email);

    if (!match) {
      return NextResponse.json({
        success: true,
        exists: false,
        status: "none",
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      user: match,
      status: match.status,
      role: match.role,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to check status" },
      { status: 500 }
    );
  }
}
