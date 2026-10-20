import { NextRequest, NextResponse } from "next/server";
import { verifyAdminLogin } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await verifyAdminLogin(email, password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || "Invalid credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: "admin",
        status: "approved",
      },
    });

    response.cookies.set("getlead_admin_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Authentication failed" },
      { status: 500 }
    );
  }
}
