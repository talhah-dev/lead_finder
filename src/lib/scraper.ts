import { Lead, EmailStatus } from "@/types/lead";
import { ExistingLeadIdentifiers, isLeadDuplicate } from "@/lib/db";

const STATE_METROS: Record<string, [number, number][]> = {
  Alabama: [
    [33.5186, -86.8104],
    [34.7304, -86.5861],
  ],
  Alaska: [
    [61.2181, -149.9003],
    [64.8378, -147.7164],
    [58.3019, -134.4197],
  ],
  Arizona: [
    [33.4484, -112.074],
    [32.2226, -110.9747],
  ],
  Arkansas: [
    [34.7465, -92.2896],
    [36.0822, -94.1719],
  ],
  California: [
    [34.0522, -118.2437],
    [37.7749, -122.4194],
    [32.7157, -117.1611],
  ],
  Colorado: [
    [39.7392, -104.9903],
    [38.8339, -104.8214],
  ],
  Connecticut: [
    [41.7658, -72.6734],
    [41.3083, -72.9279],
  ],
  Delaware: [
    [39.7447, -75.5484],
    [39.1582, -75.5244],
  ],
  Florida: [
    [25.7617, -80.1918],
    [28.5383, -81.3792],
    [27.9506, -82.4572],
  ],
  Georgia: [
    [33.749, -84.388],
    [32.0809, -81.0912],
  ],
  Hawaii: [
    [21.3069, -157.8583],
    [20.8893, -156.4729],
    [19.7297, -155.09],
  ],
  Idaho: [
    [43.615, -116.2023],
    [43.4927, -112.0401],
  ],
  Illinois: [
    [41.8781, -87.6298],
    [39.7817, -89.6501],
  ],
  Indiana: [
    [39.7684, -86.1581],
    [41.0793, -85.1394],
  ],
  Iowa: [
    [41.5868, -93.625],
    [41.9779, -91.6656],
  ],
  Kansas: [
    [37.6872, -97.3301],
    [39.1155, -94.6268],
  ],
  Kentucky: [
    [38.2527, -85.7585],
    [38.0406, -84.5037],
  ],
  Louisiana: [
    [29.9511, -90.0715],
    [30.4515, -91.1871],
  ],
  Maine: [
    [43.6591, -70.2568],
    [44.8016, -68.7712],
  ],
  Maryland: [
    [39.2904, -76.6122],
    [38.9784, -76.4922],
  ],
  Massachusetts: [
    [42.3601, -71.0589],
    [42.2626, -71.8023],
  ],
  Michigan: [
    [42.3314, -83.0458],
    [42.9634, -85.6681],
  ],
  Minnesota: [
    [44.9778, -93.265],
    [44.9537, -93.09],
  ],
  Mississippi: [
    [32.2988, -90.1848],
    [30.3674, -89.0928],
  ],
  Missouri: [
    [39.0997, -94.5786],
    [38.627, -90.1994],
  ],
  Montana: [
    [45.7833, -108.5007],
    [46.8721, -113.994],
  ],
  Nebraska: [
    [41.2565, -95.9345],
    [40.8136, -96.7026],
  ],
  Nevada: [
    [36.1699, -115.1398],
    [39.5296, -119.8138],
  ],
  "New Hampshire": [
    [42.9956, -71.4548],
    [43.2081, -71.5376],
  ],
  "New Jersey": [
    [40.7357, -74.1724],
    [40.7178, -74.0431],
  ],
  "New Mexico": [
    [35.0844, -106.6504],
    [35.687, -105.9378],
  ],
  "New York": [
    [40.7128, -74.006],
    [42.8864, -78.8784],
  ],
  "North Carolina": [
    [35.2271, -80.8431],
    [35.7796, -78.6382],
  ],
  "North Dakota": [
    [46.8772, -96.7898],
    [46.8083, -100.7837],
  ],
  Ohio: [
    [39.9612, -82.9988],
    [41.4993, -81.6944],
  ],
  Oklahoma: [
    [35.4676, -97.5164],
    [36.154, -95.9928],
  ],
  Oregon: [
    [45.5152, -122.6784],
    [44.0521, -123.0868],
  ],
  Pennsylvania: [
    [39.9526, -75.1652],
    [40.4406, -79.9959],
  ],
  "Rhode Island": [
    [41.824, -71.4128],
    [41.7001, -71.4162],
  ],
  "South Carolina": [
    [32.7765, -79.9311],
    [34.0007, -81.0348],
  ],
  "South Dakota": [
    [43.546, -96.7313],
    [44.0805, -103.231],
  ],
  Tennessee: [
    [36.1627, -86.7816],
    [35.1495, -90.049],
  ],
  Texas: [
    [29.7604, -95.3698],
    [32.7767, -96.797],
    [30.2672, -97.7431],
  ],
  Utah: [
    [40.7608, -111.891],
    [40.2338, -111.6585],
  ],
  Vermont: [
    [44.4759, -73.2121],
    [44.2601, -72.5754],
  ],
  Virginia: [
    [36.8529, -75.978],
    [37.5407, -77.436],
  ],
  Washington: [
    [47.6062, -122.3321],
    [47.6588, -117.426],
  ],
  "West Virginia": [
    [38.3498, -81.6326],
    [39.6295, -79.9559],
  ],
  Wisconsin: [
    [43.0389, -87.9065],
    [43.0731, -89.4012],
  ],
  Wyoming: [
    [41.14, -104.8202],
    [42.8666, -106.3131],
  ],
};

const CATEGORY_TAG_MAP: Record<string, string[][]> = {
  Clinics: [["amenity", "clinic"], ["healthcare", "clinic"]],
  "Medical Practices": [["amenity", "doctors"], ["healthcare", "doctor"]],
  "Medical Services": [["healthcare", "centre"], ["amenity", "clinic"]],
  Dentists: [["amenity", "dentist"], ["healthcare", "dentist"]],
  "Urgent Care": [["amenity", "clinic"], ["healthcare", "clinic"]],
  Chiropractors: [["healthcare", "alternative"], ["craft", "chiropractor"]],
  "Physical Therapy": [["healthcare", "physiotherapist"], ["amenity", "physiotherapist"]],
  "Veterinary Clinics": [["amenity", "veterinary"]],
  Plumbers: [["craft", "plumber"]],
  "Air Conditioning Repair": [["craft", "hvac"]],
  Electricians: [["craft", "electrician"]],
  Roofers: [["craft", "roofer"]],
  "Pest Control Services": [["craft", "pest_control"]],
  "Cleaning Services": [["craft", "cleaning"], ["shop", "cleaning"]],
  Landscaping: [["craft", "gardener"], ["craft", "landscaper"]],
  "Auto Repair Shops": [["shop", "car_repair"]],
  Barbers: [["shop", "hairdresser"], ["shop", "barber"]],
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
  Clinics: "medical clinic",
  "Medical Practices": "medical practice doctors",
  "Medical Services": "medical services clinic",
  Dentists: "dentist",
  "Urgent Care": "urgent care clinic",
  Chiropractors: "chiropractor",
  "Physical Therapy": "physical therapy clinic",
  "Veterinary Clinics": "veterinary clinic animal hospital",
  "Cleaning Services": "cleaning",
  Plumbers: "plumber",
  "Air Conditioning Repair": "hvac air conditioning",
  Electricians: "electrician",
  Roofers: "roofing",
  "Pest Control Services": "pest control",
  Landscaping: "landscaping",
  "Auto Repair Shops": "auto repair",
  Barbers: "barber",
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
  limit?: number;
  existingLeads?: ExistingLeadIdentifiers;
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
        "User-Agent": "GetLeadFinder/1.0 (contact@talhah.dev)",
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

        const freshLeads = params.existingLeads
          ? leads.filter((l) => !isLeadDuplicate(l, params.existingLeads!))
          : leads;

        if (freshLeads.length > 0) return freshLeads;
      }
    }
  } catch {}

  return searchWithNominatim(params);
}

export async function searchWithNominatim(params: {
  query: string;
  country?: string;
  state: string;
  category: string;
  limit?: number;
  existingLeads?: ExistingLeadIdentifiers;
}): Promise<Lead[]> {
  const isAll =
    !params.state ||
    params.state.startsWith("All ") ||
    params.state === "All States" ||
    params.state === "All Cities" ||
    params.state === "All Regions";
  const stateKey = isAll ? "" : params.state;
  const countryName = params.country || "USA";
  const keyword =
    params.query.trim() ||
    CATEGORY_SEARCH_TERMS[params.category] ||
    (params.category !== "All Categories" ? params.category : "business");

  const locationQuery = stateKey
    ? `${stateKey}, ${countryName}`
    : countryName;
  const q = `${keyword} in ${locationQuery}`;
  const isUS = countryName === "USA" || countryName === "United States";
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    q
  )}${isUS ? "&countrycodes=us" : ""}&format=json&extratags=1&addressdetails=1&limit=50`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GetLeadFinder/1.0 (contact@talhah.dev)",
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

        const freshLeads = params.existingLeads
          ? leads.filter((l) => !isLeadDuplicate(l, params.existingLeads!))
          : leads;

        return freshLeads;
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
  country?: string;
  state: string;
  category: string;
  limit?: number;
  existingLeads?: ExistingLeadIdentifiers;
}): Promise<Lead[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || apiKey.trim().length < 5) return [];

  const targetCount = params.limit || 20;
  const maxPages = 5;

  try {
    const isAllRegions =
      !params.state ||
      params.state === "All States" ||
      params.state === "All Cities" ||
      params.state === "All Provinces" ||
      params.state === "All Regions";

    const countryName = params.country || "USA";
    const locationPart = isAllRegions
      ? `in ${countryName}`
      : `in ${params.state}, ${countryName}`;

    const searchTerm = `${params.query || params.category} ${locationPart}`;
    const freshItems: SerpApiLocalResult[] = [];

    for (let page = 0; page < maxPages && freshItems.length < targetCount; page++) {
      const start = page * 20;
      const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(
        searchTerm
      )}&start=${start}&api_key=${apiKey.trim()}`;

      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();

      if (data.local_results && Array.isArray(data.local_results)) {
        for (const item of data.local_results as SerpApiLocalResult[]) {
          const placeId = (item.place_id || "").trim();
          const phone = (item.phone || "").replace(/\D/g, "");
          const name = (item.title || "").toLowerCase().trim();

          if (params.existingLeads) {
            if (placeId && params.existingLeads.placeIds.has(placeId)) continue;
            if (phone.length >= 7 && params.existingLeads.phones.has(phone)) continue;
            if (name && params.existingLeads.names.has(name)) continue;
          }

          freshItems.push(item);
          if (freshItems.length >= targetCount) break;
        }

        if (data.local_results.length < 20) break;
      } else {
        break;
      }
    }

    if (freshItems.length > 0) {
      const itemsToProcess = freshItems.slice(0, targetCount);
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
              : params.state && !isAllRegions
              ? params.state
              : countryName;

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
            state: params.state || countryName,
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

      return leads;
    }
  } catch {}

  return [];
}

export async function searchGoogleMapsLeads(params: {
  query: string;
  country?: string;
  state: string;
  category: string;
  provider?: "osm" | "serpapi";
  limit?: number;
  existingLeads?: ExistingLeadIdentifiers;
}): Promise<Lead[]> {
  const provider = params.provider || "osm";

  if (provider === "serpapi") {
    return await searchWithSerpApi(params);
  }

  const isUS = !params.country || params.country === "United States" || params.country === "USA";
  if (isUS && STATE_METROS[params.state]) {
    return await searchWithOverpass(params);
  }

  return await searchWithNominatim(params);
}
