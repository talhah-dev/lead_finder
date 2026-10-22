import { neon } from "@neondatabase/serverless";
import { Lead, EmailStatus, LeadStatus } from "@/types/lead";
import { deduplicateLeads, normalizePhone } from "@/lib/deduplicate";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_Y6CHLhIom5RQ@ep-blue-rice-b4v7q0ue-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const sql = neon(databaseUrl);

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS search_history (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT 'All States',
      category TEXT NOT NULL DEFAULT 'All Categories',
      total_found INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS saved_leads (
      id TEXT PRIMARY KEY,
      search_id TEXT REFERENCES search_history(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT,
      email_status TEXT DEFAULT 'not_found',
      website TEXT DEFAULT '',
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      state TEXT DEFAULT '',
      zip TEXT DEFAULT '',
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      place_id TEXT DEFAULT '',
      status TEXT DEFAULT 'New',
      scraped_at TEXT DEFAULT '',
      opening_hours TEXT DEFAULT '',
      social_links JSONB DEFAULT '{}',
      enrichment_details JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_saved_leads_search_id ON saved_leads(search_id);
  `;

  try {
    await sql`
      DELETE FROM saved_leads a USING saved_leads b
      WHERE a.ctid < b.ctid
        AND a.search_id = b.search_id
        AND (
          (a.phone <> '' AND a.phone = b.phone)
          OR (a.place_id <> '' AND a.place_id = b.place_id)
          OR (a.name = b.name AND a.city = b.city)
        );
    `;
  } catch {}
}

export async function saveSearchAndLeads(
  search: {
    id: string;
    query: string;
    state: string;
    category: string;
    totalFound: number;
  },
  leads: Lead[]
) {
  const uniqueLeads = deduplicateLeads(leads);
  search.totalFound = uniqueLeads.length;

  await initDatabase();

  await sql`
    INSERT INTO search_history (id, query, state, category, total_found, created_at)
    VALUES (${search.id}, ${search.query}, ${search.state}, ${search.category}, ${search.totalFound}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      total_found = EXCLUDED.total_found,
      created_at = NOW();
  `;

  for (const lead of uniqueLeads) {
    const socialLinksJson = JSON.stringify(lead.socialLinks || {});
    const enrichmentJson = JSON.stringify(lead.enrichmentDetails || {});
    const cleanPhone = normalizePhone(lead.phone);
    const key = cleanPhone && cleanPhone.length >= 10
      ? cleanPhone
      : lead.placeId
      ? lead.placeId.replace(/[^a-zA-Z0-9_-]/g, "")
      : (lead.name + "-" + (lead.city || lead.state)).toLowerCase().replace(/[^a-z0-9]/g, "");
    const deterministicId = `lead-${search.id}-${key}`;

    await sql`
      INSERT INTO saved_leads (
        id, search_id, name, category, phone, email, email_status,
        website, address, city, state, zip, rating, review_count,
        place_id, status, scraped_at, opening_hours, social_links, enrichment_details, created_at
      )
      VALUES (
        ${deterministicId}, ${search.id}, ${lead.name}, ${lead.category}, ${lead.phone || ""},
        ${lead.email || null}, ${lead.emailStatus || "not_found"}, ${lead.website || ""},
        ${lead.address || ""}, ${lead.city || ""}, ${lead.state || ""}, ${lead.zip || ""},
        ${lead.rating || 0}, ${lead.reviewCount || 0}, ${lead.placeId || ""}, ${lead.status || "New"},
        ${lead.scrapedAt || ""}, ${lead.openingHours || ""}, ${socialLinksJson}::jsonb, ${enrichmentJson}::jsonb, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        email_status = EXCLUDED.email_status,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        status = EXCLUDED.status;
    `;
  }
}

export async function getSearchHistory() {
  await initDatabase();

  const rows = await sql`
    SELECT id, query, state, category, total_found, created_at
    FROM search_history
    ORDER BY created_at DESC
    LIMIT 50;
  `;

  return rows.map((r) => ({
    id: String(r.id),
    query: String(r.query),
    state: String(r.state),
    category: String(r.category),
    totalFound: Number(r.total_found),
    createdAt: (r.created_at as Date)?.toISOString() || new Date().toISOString(),
  }));
}

export async function getLeadsBySearchId(searchId: string): Promise<Lead[]> {
  await initDatabase();

  const rows = await sql`
    SELECT
      id, name, category, phone, email, email_status, website,
      address, city, state, zip, rating, review_count, place_id,
      status, scraped_at, opening_hours, social_links, enrichment_details
    FROM saved_leads
    WHERE search_id = ${searchId}
    ORDER BY rating DESC;
  `;

  const mapped = rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    category: String(r.category),
    phone: String(r.phone || ""),
    email: r.email ? String(r.email) : null,
    emailStatus: (r.email_status as EmailStatus) || "not_found",
    website: String(r.website || ""),
    address: String(r.address || ""),
    city: String(r.city || ""),
    state: String(r.state || ""),
    zip: String(r.zip || ""),
    rating: Number(r.rating) || 0,
    reviewCount: Number(r.review_count) || 0,
    placeId: String(r.place_id || ""),
    status: (r.status as LeadStatus) || "New",
    scrapedAt: String(r.scraped_at || ""),
    openingHours: String(r.opening_hours || ""),
    socialLinks: (r.social_links as Lead["socialLinks"]) || {},
    enrichmentDetails: (r.enrichment_details as Lead["enrichmentDetails"]) || {},
  }));

  return deduplicateLeads(mapped);
}

export async function getAllSavedLeads(): Promise<Lead[]> {
  await initDatabase();

  const rows = await sql`
    SELECT
      id, name, category, phone, email, email_status, website,
      address, city, state, zip, rating, review_count, place_id,
      status, scraped_at, opening_hours, social_links, enrichment_details
    FROM saved_leads
    ORDER BY created_at DESC
    LIMIT 200;
  `;

  const mapped = rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    category: String(r.category),
    phone: String(r.phone || ""),
    email: r.email ? String(r.email) : null,
    emailStatus: (r.email_status as EmailStatus) || "not_found",
    website: String(r.website || ""),
    address: String(r.address || ""),
    city: String(r.city || ""),
    state: String(r.state || ""),
    zip: String(r.zip || ""),
    rating: Number(r.rating) || 0,
    reviewCount: Number(r.review_count) || 0,
    placeId: String(r.place_id || ""),
    status: (r.status as LeadStatus) || "New",
    scrapedAt: String(r.scraped_at || ""),
    openingHours: String(r.opening_hours || ""),
    socialLinks: (r.social_links as Lead["socialLinks"]) || {},
    enrichmentDetails: (r.enrichment_details as Lead["enrichmentDetails"]) || {},
  }));

  return deduplicateLeads(mapped);
}

export async function deleteSearchHistory(searchId?: string) {
  await initDatabase();

  if (searchId) {
    await sql`DELETE FROM search_history WHERE id = ${searchId};`;
  } else {
    await sql`DELETE FROM saved_leads;`;
    await sql`DELETE FROM search_history;`;
  }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await initDatabase();
  await sql`
    UPDATE saved_leads
    SET status = ${status}
    WHERE id = ${leadId};
  `;
}
