import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey || apiKey.trim().length < 5) {
    return NextResponse.json({
      success: false,
      configured: false,
      error: "No SerpApi key found in environment variables",
    });
  }

  try {
    const res = await fetch(
      `https://serpapi.com/account.json?api_key=${encodeURIComponent(apiKey.trim())}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        configured: true,
        error: "Failed to fetch SerpApi account info",
      });
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      configured: true,
      searchesLeft: data.total_searches_left ?? data.plan_searches_left ?? 0,
      searchesPerMonth: data.searches_per_month ?? 250,
      thisMonthUsage: data.this_month_usage ?? 0,
      planName: data.plan_name ?? "Free Plan",
      accountEmail: data.account_email ?? "",
    });
  } catch {
    return NextResponse.json({
      success: false,
      configured: true,
      error: "Error contacting SerpApi account servers",
    });
  }
}
