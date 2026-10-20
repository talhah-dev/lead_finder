import { NextRequest, NextResponse } from "next/server";
import {
  getCountriesAndRegions,
  addCountry,
  addCountryWithRegions,
  deleteCountry,
  addRegion,
  deleteRegion,
} from "@/lib/db";

export async function GET() {
  try {
    const countries = await getCountriesAndRegions();
    return NextResponse.json({ success: true, countries });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, name, code, countryId, regions } = body;

    if (action === "add_country") {
      if (!name || !code) {
        return NextResponse.json(
          { success: false, error: "Country name and code are required" },
          { status: 400 }
        );
      }
      const id = await addCountryWithRegions(name, code, Array.isArray(regions) ? regions : []);
      return NextResponse.json({ success: true, id });
    }

    if (action === "add_region") {
      if (!countryId || !name) {
        return NextResponse.json(
          { success: false, error: "Country ID and region name are required" },
          { status: 400 }
        );
      }
      const id = await addRegion(countryId, name, code);
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to save location" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: "ID and type are required" },
        { status: 400 }
      );
    }

    if (type === "country") {
      await deleteCountry(id);
    } else if (type === "region") {
      await deleteRegion(id);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to delete location" },
      { status: 500 }
    );
  }
}
