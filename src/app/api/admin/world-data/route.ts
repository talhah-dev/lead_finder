import { NextRequest, NextResponse } from "next/server";
import { Country, State, City } from "country-state-city";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const countryCode = searchParams.get("countryCode")?.toUpperCase();

    if (type === "countries") {
      const all = Country.getAllCountries().map((c) => ({
        name: c.name,
        code: c.isoCode,
        flag: c.flag,
        phonecode: c.phonecode,
        currency: c.currency,
        statesCount: State.getStatesOfCountry(c.isoCode).length,
      }));
      return NextResponse.json({ success: true, countries: all });
    }

    if (type === "subdivisions" && countryCode) {
      const states = State.getStatesOfCountry(countryCode) || [];
      const cityQuery = searchParams.get("cityQuery")?.toLowerCase();
      let allCities = City.getCitiesOfCountry(countryCode) || [];

      if (cityQuery) {
        allCities = allCities.filter((c) =>
          c.name.toLowerCase().includes(cityQuery)
        );
      }

      const cities = allCities.slice(0, 150).map((c) => ({
        name: c.name,
        stateCode: c.stateCode,
      }));

      return NextResponse.json({
        success: true,
        states: states.map((s) => ({ name: s.name, code: s.isoCode })),
        cities,
        totalCities: allCities.length,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid parameters" },
      { status: 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to load world data" },
      { status: 500 }
    );
  }
}
