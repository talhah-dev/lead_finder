import { Lead, EmailStatus } from "@/types/lead";
import { deduplicateLeads, normalizePhone } from "@/lib/deduplicate";

const STATE_METROS: Record<string, [number, number][]> = {
  California: [
    [34.0522, -118.2437],
    [37.7749, -122.4194],
    [32.7157, -117.1611],
  ],
  Texas: [
    [29.7604, -95.3698],
    [32.7767, -96.797],
    [30.2672, -97.7431],
  ],
  Florida: [
    [25.7617, -80.1918],
    [28.5383, -81.3792],
    [27.9506, -82.4572],
  ],
  "New York": [
    [40.7128, -74.006],
    [42.8864, -78.8784],
  ],
  Illinois: [
    [41.8781, -87.6298],
    [39.7817, -89.6501],
  ],
  Pennsylvania: [
    [39.9526, -75.1652],
    [40.4406, -79.9959],
  ],
  Ohio: [
    [39.9612, -82.9988],
    [41.4993, -81.6944],
  ],
  Georgia: [
    [33.749, -84.388],
    [32.0809, -81.0912],
  ],
  "North Carolina": [
    [35.2271, -80.8431],
    [35.7796, -78.6382],
  ],
  Michigan: [
    [42.3314, -83.0458],
    [42.9634, -85.6681],
  ],
  Washington: [
    [47.6062, -122.3321],
    [47.6588, -117.426],
  ],
  Arizona: [
    [33.4484, -112.074],
    [32.2226, -110.9747],
  ],
  Colorado: [
    [39.7392, -104.9903],
    [38.8339, -104.8214],
  ],
  Nevada: [
    [36.1699, -115.1398],
    [39.5296, -119.8138],
  ],
};

const CATEGORY_TAG_MAP: Record<string, string[][]> = {
  Plumbers: [["craft", "plumber"]],
  "Air Conditioning Repair": [["craft", "hvac"]],
  Electricians: [["craft", "electrician"]],
  Roofers: [["craft", "roofer"]],
  "Pest Control Services": [["craft", "pest_control"]],
  "Cleaning Services": [["craft", "cleaning"], ["shop", "cleaning"]],
  Landscaping: [["craft", "gardener"], ["craft", "landscaper"]],
  "Auto Repair Shops": [["shop", "car_repair"]],
  Barbers: [["shop", "hairdresser"], ["shop", "barber"]],
  Dentists: [["amenity", "dentist"], ["healthcare", "dentist"]],
  "Appliance Repair": [["craft", "appliance_repair"]],
  "Garage Door Repair": [["craft", "garage_door_repair"], ["craft", "doors"]],
  Locksmiths: [["craft", "locksmith"]],
  "Tree Services": [["craft", "tree_surgeon"], ["craft", "tree_service"]],
  "Painting Contractors": [["craft", "painter"]],
  "Pool Service": [["craft", "swimming_pool"], ["craft", "pool_service"]],
  "Bathroom Remodeling": [["craft", "plumber"], ["craft", "bathroom_installation"]],
  "Air Duct Cleaning": [["craft", "cleaning"], ["craft", "hvac"]],
};

const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  "Cleaning Services": "cleaning",
  Plumbers: "plumber",
  "Air Conditioning Repair": "hvac air conditioning",
  Electricians: "electrician",
  Roofers: "roofing",
  "Pest Control Services": "pest control",
  Landscaping: "landscaping",
  "Auto Repair Shops": "auto repair",
  Barbers: "barber",
  Dentists: "dentist",
  "Appliance Repair": "appliance repair",
  "Garage Door Repair": "garage door",
  Locksmiths: "locksmith",
  "Tree Services": "tree service",
  "Painting Contractors": "painter",
  "Pool Service": "pool service",
  "Bathroom Remodeling": "bathroom remodeling",
  "Air Duct Cleaning": "air duct cleaning",
};

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

    const mailtoMatch = html.match(
      /href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i
    );
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

export async function searchWithOverpass(params: {
  query: string;
  state: string;
  category: string;
}): Promise<Lead[]> {
  const stateKey = params.state && params.state !== "All States" ? params.state : "California";
  const metros = STATE_METROS[stateKey] || STATE_METROS["California"];
  const tags =
    CATEGORY_TAG_MAP[params.category] ||
    (params.query ? [["name", params.query]] : [["amenity", "dentist"]]);

  const clauses: string[] = [];
  for (const [lat, lon] of metros) {
    for (const [key, val] of tags) {
      if (key === "name") {
        clauses.push(`node["name"~"${val}",i](around:35000,${lat},${lon});`);
      } else {
        clauses.push(`node["${key}"="${val}"](around:35000,${lat},${lon});`);
      }
    }
  }

  const query = `
[out:json][timeout:15];
(
  ${clauses.join("\n  ")}
);
out 25;
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "MapScoutLeadFinder/1.0 (contact@talhah.dev)",
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.elements) && data.elements.length > 0) {
        const leads: Lead[] = await Promise.all(
          data.slice(0, 50).map(async (el: { id: string | number; tags?: Record<string, string> }) => {
            const t = el.tags || {};
            const name =
              t.name ||
              t.brand ||
              (params.category !== "All Categories" ? params.category : "Local Business");
            const phone = t.phone || t["contact:phone"] || "";
            const website = t.website || t["contact:website"] || "";
            const street = t["addr:street"]
              ? `${t["addr:housenumber"] || ""} ${t["addr:street"]}`.trim()
              : "";
            const city = t["addr:city"] || stateKey;
            const zip = t["addr:postcode"] || "";
            const address = street ? `${street}, ${city}, ${stateKey} ${zip}`.trim() : city;

            let email = t.email || t["contact:email"] || null;
            let emailStatus: EmailStatus = email ? "verified" : "not_found";

            if (!email && website) {
              const enriched = await extractEmailFromWebsite(website);
              email = enriched.email;
              emailStatus = enriched.status;
            }

            return {
              id: `osm-${el.id}`,
              name,
              category: params.category !== "All Categories" ? params.category : "Local Business",
              phone,
              email,
              emailStatus,
              website,
              address,
              city,
              state: stateKey,
              zip,
              rating: 4.8,
              reviewCount: 24,
              placeId: `osm-${el.id}`,
              status: "New",
              scrapedAt: new Date().toISOString().slice(0, 10),
              openingHours: t.opening_hours || "",
              enrichmentDetails: {
                sourceUrl: website || undefined,
                domainVerified: Boolean(website),
              },
            } as Lead;
          })
        );

        if (leads.length > 0) return deduplicateLeads(leads);
      }
    }
  } catch {}

  return searchWithNominatim(params);
}

export async function searchWithNominatim(params: {
  query: string;
  state: string;
  category: string;
}): Promise<Lead[]> {
  const stateKey = params.state && params.state !== "All States" ? params.state : "California";
  const keyword =
    params.query.trim() ||
    CATEGORY_SEARCH_TERMS[params.category] ||
    (params.category !== "All Categories" ? params.category : "business");

  const q = `${keyword} ${stateKey}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    q
  )}&countrycodes=us&format=json&extratags=1&addressdetails=1&limit=50`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MapScoutLeadFinder/1.0 (contact@talhah.dev)",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const leads: Lead[] = await Promise.all(
          data.slice(0, 50).map(async (item) => {
            const extra = item.extratags || {};
            const addr = item.address || {};
            const name =
              item.name && item.name.length > 2
                ? item.name
                : (item.display_name || "").split(",")[0] || params.category;
            const phone = extra.phone || extra["contact:phone"] || "";
            const website = extra.website || extra["contact:website"] || "";
            const city = addr.city || addr.town || addr.village || stateKey;
            const zip = addr.postcode || "";
            const street = addr.road
              ? `${addr.house_number || ""} ${addr.road}`.trim()
              : "";
            const address = street ? `${street}, ${city}, ${stateKey} ${zip}`.trim() : city;

            let email = extra.email || extra["contact:email"] || null;
            let emailStatus: EmailStatus = email ? "verified" : "not_found";

            if (!email && website) {
              const enriched = await extractEmailFromWebsite(website);
              email = enriched.email;
              emailStatus = enriched.status;
            }

            return {
              id: `nom-${item.place_id || Math.random().toString(36).slice(2, 9)}`,
              name,
              category: params.category !== "All Categories" ? params.category : "Local Business",
              phone,
              email,
              emailStatus,
              website,
              address,
              city,
              state: stateKey,
              zip,
              rating: 4.7,
              reviewCount: 18,
              placeId: String(item.place_id || ""),
              status: "New",
              scrapedAt: new Date().toISOString().slice(0, 10),
              openingHours: extra.opening_hours || "",
              enrichmentDetails: {
                sourceUrl: website || undefined,
                domainVerified: Boolean(website),
              },
            } as Lead;
          })
        );

        return deduplicateLeads(leads);
      }
    }
  } catch {}

  return [];
}

interface SerpApiLocalResult {
  place_id?: string;
  title?: string;
  type?: string;
  phone?: string;
  website?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  operating_hours?: string;
  open_state?: string;
}

async function searchWithSerpApi(params: {
  query: string;
  state: string;
  category: string;
  limit?: number;
}): Promise<Lead[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || apiKey.trim().length < 5) return [];

  const targetCount = params.limit || 20;

  try {
    const searchTerm = `${params.query || params.category} in ${params.state || "California"}, USA`;
    const seenRawKeys = new Set<string>();
    const allItems: SerpApiLocalResult[] = [];
    const maxPages = Math.min(Math.ceil(targetCount / 15) + 2, 7);

    for (let page = 0; page < maxPages && allItems.length < targetCount; page++) {
      const start = page * 20;
      const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(
        searchTerm
      )}&start=${start}&api_key=${apiKey.trim()}`;

      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();

      if (data.local_results && Array.isArray(data.local_results)) {
        for (const item of (data.local_results as SerpApiLocalResult[])) {
          const rawPhone = item.phone ? normalizePhone(item.phone) : "";
          const rawPlaceId = (item.place_id || "").trim();
          const rawName = (item.title || "").toLowerCase().trim();

          const key = rawPhone || rawPlaceId || rawName;
          if (key && seenRawKeys.has(key)) {
            continue;
          }
          if (key) seenRawKeys.add(key);

          allItems.push(item);
          if (allItems.length >= targetCount) break;
        }

        if (data.local_results.length < 20) break;
      } else {
        break;
      }
    }

    if (allItems.length > 0) {
      const itemsToProcess = allItems.slice(0, targetCount);
      const leads: Lead[] = await Promise.all(
        itemsToProcess.map(async (item: SerpApiLocalResult) => {
          let email: string | null = null;
          let emailStatus: EmailStatus = "not_found";

          const website = item.website || "";
          if (website) {
            const enriched = await extractEmailFromWebsite(website);
            email = enriched.email;
            emailStatus = enriched.status;
          }

          const addressParts = (item.address || "").split(",");
          const city =
            addressParts.length > 1
              ? addressParts[addressParts.length - 2].trim()
              : params.state || "California";

          return {
            id: `serp-${item.place_id || Math.random().toString(36).slice(2, 9)}`,
            name: item.title || "Business",
            category:
              params.category !== "All Categories"
                ? params.category
                : item.type || "Local Business",
            phone: item.phone || "",
            email,
            emailStatus,
            website,
            address: item.address || "",
            city,
            state: params.state || "California",
            zip: "",
            rating: Number(item.rating) || 4.5,
            reviewCount: Number(item.reviews) || 10,
            placeId: item.place_id || "",
            status: "New",
            scrapedAt: new Date().toISOString().slice(0, 10),
            openingHours:
              typeof item.operating_hours === "string"
                ? item.operating_hours
                : item.open_state || "",
            enrichmentDetails: {
              sourceUrl: website,
              domainVerified: Boolean(website),
            },
          } as Lead;
        })
      );

      return deduplicateLeads(leads);
    }
  } catch {}

  return [];
}

export async function searchGoogleMapsLeads(params: {
  query: string;
  state: string;
  category: string;
  provider?: "osm" | "serpapi";
  limit?: number;
}): Promise<Lead[]> {
  const provider = params.provider || "osm";
  let results: Lead[] = [];

  if (provider === "serpapi") {
    results = await searchWithSerpApi(params);
  } else {
    results = await searchWithOverpass(params);
  }

  return deduplicateLeads(results);
}
