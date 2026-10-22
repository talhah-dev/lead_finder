import { Lead } from "@/types/lead";

export function normalizePhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function normalizeDomain(url: string): string {
  if (!url) return "";
  try {
    const formatted = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(formatted);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const ignored = [
      "facebook.com",
      "instagram.com",
      "linkedin.com",
      "twitter.com",
      "x.com",
      "google.com",
      "maps.google.com",
      "yelp.com",
      "yellowpages.com",
    ];
    if (ignored.includes(host)) return "";
    return host;
  } catch {
    return "";
  }
}

export function normalizeName(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function deduplicateLeads(leads: Lead[]): Lead[] {
  if (!Array.isArray(leads) || leads.length === 0) return [];

  const seenPhones = new Set<string>();
  const seenPlaceIds = new Set<string>();
  const seenDomains = new Set<string>();
  const seenNameLocation = new Set<string>();

  const result: Lead[] = [];

  for (const lead of leads) {
    const cleanPhone = normalizePhone(lead.phone);
    const placeId = (lead.placeId || "").trim();
    const domain = normalizeDomain(lead.website);
    const normName = normalizeName(lead.name);
    const normCity = normalizeName(lead.city || lead.state);
    const nameLocKey = normName && normCity ? `${normName}|${normCity}` : "";

    let isDuplicate = false;

    if (cleanPhone && cleanPhone.length >= 10) {
      if (seenPhones.has(cleanPhone)) {
        isDuplicate = true;
      }
    }

    if (!isDuplicate && placeId && placeId.length > 5) {
      if (seenPlaceIds.has(placeId)) {
        isDuplicate = true;
      }
    }

    if (!isDuplicate && domain && domain.includes(".")) {
      if (seenDomains.has(domain)) {
        isDuplicate = true;
      }
    }

    if (!isDuplicate && nameLocKey) {
      if (seenNameLocation.has(nameLocKey)) {
        isDuplicate = true;
      }
    }

    if (isDuplicate) {
      if (lead.email) {
        const existing = result.find((item) => {
          if (cleanPhone && normalizePhone(item.phone) === cleanPhone) return true;
          if (placeId && item.placeId === placeId) return true;
          if (domain && normalizeDomain(item.website) === domain) return true;
          return false;
        });
        if (existing && !existing.email) {
          existing.email = lead.email;
          existing.emailStatus = lead.emailStatus;
        }
      }
      continue;
    }

    if (cleanPhone && cleanPhone.length >= 10) seenPhones.add(cleanPhone);
    if (placeId && placeId.length > 5) seenPlaceIds.add(placeId);
    if (domain && domain.includes(".")) seenDomains.add(domain);
    if (nameLocKey) seenNameLocation.add(nameLocKey);

    result.push(lead);
  }

  return result;
}
