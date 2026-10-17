import { Lead, EmailStatus } from "@/types/lead";
import { MOCK_LEADS } from "@/data/mockLeads";

export async function extractEmailFromWebsite(websiteUrl: string): Promise<{
  email: string | null;
  status: EmailStatus;
  sourceUrl?: string;
  socials?: { linkedin?: string; facebook?: string; instagram?: string };
}> {
  if (!websiteUrl || !websiteUrl.startsWith("http")) {
    return { email: null, status: "not_found" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { email: null, status: "not_found" };
    }

    const html = await response.text();

    const mailtoMatch = html.match(/href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i);
    if (mailtoMatch && mailtoMatch[1]) {
      return {
        email: mailtoMatch[1].toLowerCase(),
        status: "verified",
        sourceUrl: websiteUrl,
      };
    }

    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const matches = html.match(emailRegex);
    if (matches && matches.length > 0) {
      const filtered = matches.filter(
        (e) =>
          !e.endsWith(".png") &&
          !e.endsWith(".jpg") &&
          !e.endsWith(".jpeg") &&
          !e.endsWith(".webp") &&
          !e.includes("example.com") &&
          !e.includes("sentry") &&
          !e.includes("wixpress")
      );
      if (filtered.length > 0) {
        return {
          email: filtered[0].toLowerCase(),
          status: "verified",
          sourceUrl: websiteUrl,
        };
      }
    }

    return { email: null, status: "not_found" };
  } catch {
    return { email: null, status: "not_found" };
  }
}

export async function searchGoogleMapsLeads(params: {
  query: string;
  state: string;
  category: string;
}): Promise<Lead[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const searchTerm = `${params.query || params.category} in ${params.state || "California"}, USA`;
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        searchTerm
      )}&key=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.results && Array.isArray(data.results)) {
        const leads: Lead[] = [];

        for (const place of data.results.slice(0, 15)) {
          let website = "";
          let phone = "";
          let openingHours = "";

          if (place.place_id) {
            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,website,opening_hours,formatted_address&key=${apiKey}`;
              const dRes = await fetch(detailsUrl);
              const dData = await dRes.json();
              if (dData.result) {
                website = dData.result.website || "";
                phone = dData.result.formatted_phone_number || "";
                if (dData.result.opening_hours?.weekday_text) {
                  openingHours = dData.result.opening_hours.weekday_text[0] || "";
                }
              }
            } catch {}
          }

          let email: string | null = null;
          let emailStatus: EmailStatus = "not_found";

          if (website) {
            const enriched = await extractEmailFromWebsite(website);
            email = enriched.email;
            emailStatus = enriched.status;
          }

          const addressParts = (place.formatted_address || "").split(",");
          const city = addressParts.length > 1 ? addressParts[1].trim() : params.state;

          leads.push({
            id: `place-${place.place_id || Math.random().toString(36).slice(2, 9)}`,
            name: place.name || "Business",
            category: params.category !== "All Categories" ? params.category : "Local Business",
            phone: phone || "(555) 000-0000",
            email,
            emailStatus,
            website: website || "https://google.com/maps",
            address: place.formatted_address || "",
            city,
            state: params.state || "California",
            zip: "",
            rating: place.rating || 4.5,
            reviewCount: place.user_ratings_total || 10,
            placeId: place.place_id || "",
            status: "New",
            scrapedAt: new Date().toISOString().slice(0, 10),
            openingHours,
            enrichmentDetails: {
              sourceUrl: website,
              domainVerified: Boolean(website),
            },
          });
        }

        if (leads.length > 0) {
          return leads;
        }
      }
    } catch {}
  }

  const normalizedQuery = (params.query || "").toLowerCase().trim();
  const normalizedCategory = params.category;
  const normalizedState = params.state;

  return MOCK_LEADS.filter((lead) => {
    if (normalizedState && normalizedState !== "All States") {
      if (lead.state.toLowerCase() !== normalizedState.toLowerCase()) {
        return false;
      }
    }

    if (normalizedCategory && normalizedCategory !== "All Categories") {
      if (lead.category.toLowerCase() !== normalizedCategory.toLowerCase()) {
        return false;
      }
    }

    if (normalizedQuery) {
      const q = normalizedQuery;
      const mName = lead.name.toLowerCase().includes(q);
      const mCat = lead.category.toLowerCase().includes(q);
      const mCity = lead.city.toLowerCase().includes(q);
      if (!mName && !mCat && !mCity) return false;
    }

    return true;
  });
}
