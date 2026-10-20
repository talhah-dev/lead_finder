import { neon } from "@neondatabase/serverless";
import { Lead, EmailStatus, LeadStatus } from "@/types/lead";

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

  await sql`
    CREATE TABLE IF NOT EXISTS removed_leads (
      id TEXT PRIMARY KEY,
      place_id TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      website TEXT DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      reason TEXT DEFAULT 'removed_by_user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS access_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      company TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS custom_countries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS custom_regions (
      id TEXT PRIMARY KEY,
      country_id TEXT REFERENCES custom_countries(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      code TEXT DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS custom_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country_id TEXT,
      sector TEXT DEFAULT 'General',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT DEFAULT 'Administrator',
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await seedInitialData();
}

let isSeeded = false;
async function seedInitialData() {
  if (isSeeded) return;
  try {
    const existingUsers = await sql`SELECT count(*)::int as count FROM access_requests;`;
    if ((existingUsers[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO access_requests (id, name, email, company, status, role)
        VALUES
          ('usr-admin', 'Admin', 'admin@getlead.com', 'GetLead Team', 'approved', 'admin'),
          ('usr-khurram', 'Khurram', 'khurram@example.com', 'Khurram Enterprise', 'approved', 'member'),
          ('usr-salman', 'Salman Khan', 'salman@example.com', 'SK Digital', 'pending', 'member')
        ON CONFLICT (email) DO NOTHING;
      `;
    }

    const existingCountries = await sql`SELECT count(*)::int as count FROM custom_countries;`;
    if ((existingCountries[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO custom_countries (id, name, code, is_default)
        VALUES
          ('c-us', 'United States', 'US', TRUE),
          ('c-ca', 'Canada', 'CA', FALSE),
          ('c-pk', 'Pakistan', 'PK', FALSE),
          ('c-gb', 'United Kingdom', 'GB', FALSE)
        ON CONFLICT (name) DO NOTHING;
      `;

      const regions = [
        ['c-us', 'All States', 'ALL'],
        ['c-us', 'California', 'CA'],
        ['c-us', 'Texas', 'TX'],
        ['c-us', 'Florida', 'FL'],
        ['c-us', 'New York', 'NY'],
        ['c-us', 'Illinois', 'IL'],
        ['c-us', 'Pennsylvania', 'PA'],
        ['c-us', 'Ohio', 'OH'],
        ['c-us', 'Georgia', 'GA'],
        ['c-us', 'North Carolina', 'NC'],
        ['c-us', 'Michigan', 'MI'],
        ['c-us', 'Washington', 'WA'],
        ['c-us', 'Arizona', 'AZ'],
        ['c-us', 'Colorado', 'CO'],
        ['c-ca', 'All Provinces', 'ALL'],
        ['c-ca', 'Ontario', 'ON'],
        ['c-ca', 'British Columbia', 'BC'],
        ['c-ca', 'Quebec', 'QC'],
        ['c-ca', 'Alberta', 'AB'],
        ['c-ca', 'Manitoba', 'MB'],
        ['c-ca', 'Nova Scotia', 'NS'],
        ['c-ca', 'Saskatchewan', 'SK'],
        ['c-pk', 'All Cities', 'ALL'],
        ['c-pk', 'Karachi', 'KHI'],
        ['c-pk', 'Lahore', 'LHE'],
        ['c-pk', 'Islamabad', 'ISB'],
        ['c-pk', 'Rawalpindi', 'RWP'],
        ['c-pk', 'Faisalabad', 'FSD'],
        ['c-pk', 'Peshawar', 'PEW'],
        ['c-pk', 'Multan', 'MUX'],
        ['c-pk', 'Quetta', 'UET'],
        ['c-pk', 'Sialkot', 'SKT'],
        ['c-gb', 'All Regions', 'ALL'],
        ['c-gb', 'London', 'LDN'],
        ['c-gb', 'Manchester', 'MAN'],
        ['c-gb', 'Birmingham', 'BHX'],
        ['c-gb', 'Leeds', 'LBA'],
        ['c-gb', 'Glasgow', 'GLA'],
        ['c-gb', 'Liverpool', 'LPL'],
        ['c-gb', 'Bristol', 'BRS'],
        ['c-gb', 'Edinburgh', 'EDI']
      ];

      for (const [countryId, name, code] of regions) {
        const id = `reg-${countryId}-${name.toLowerCase().replace(/\s+/g, '-')}`;
        await sql`
          INSERT INTO custom_regions (id, country_id, name, code)
          VALUES (${id}, ${countryId}, ${name}, ${code})
          ON CONFLICT DO NOTHING;
        `;
      }
    }

    const existingCats = await sql`SELECT count(*)::int as count FROM custom_categories;`;
    if ((existingCats[0]?.count || 0) === 0) {
      const defaultCategories: [string, string | null, string][] = [
        ['All Categories', null, 'General'],
        ['Cleaning Services', null, 'Home Services'],
        ['Clinics', null, 'Healthcare'],
        ['Medical Practices', null, 'Healthcare'],
        ['Medical Services', null, 'Healthcare'],
        ['Dentists', null, 'Healthcare'],
        ['Urgent Care', null, 'Healthcare'],
        ['Chiropractors', null, 'Healthcare'],
        ['Physical Therapy', null, 'Healthcare'],
        ['Veterinary Clinics', null, 'Healthcare'],
        ['Plumbers', null, 'Home Services'],
        ['Air Conditioning Repair', null, 'Home Services'],
        ['Electricians', null, 'Home Services'],
        ['Roofers', null, 'Home Services'],
        ['Pest Control Services', null, 'Home Services'],
        ['Landscaping', null, 'Home Services'],
        ['Auto Repair Shops', null, 'Automotive'],
        ['Barbers', null, 'Personal Care'],
        ['Software Agencies', null, 'Technology'],
        ['Marketing Agencies', null, 'Marketing']
      ];

      for (const [name, countryId, sector] of defaultCategories) {
        const id = `cat-${name.toLowerCase().replace(/\s+/g, '-')}`;
        await sql`
          INSERT INTO custom_categories (id, name, country_id, sector)
          VALUES (${id}, ${name}, ${countryId}, ${sector})
          ON CONFLICT DO NOTHING;
        `;
      }
    }

    isSeeded = true;
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
  await initDatabase();

  await sql`
    INSERT INTO search_history (id, query, state, category, total_found, created_at)
    VALUES (${search.id}, ${search.query}, ${search.state}, ${search.category}, ${search.totalFound}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      total_found = EXCLUDED.total_found,
      created_at = NOW();
  `;

  for (const lead of leads) {
    const socialLinksJson = JSON.stringify(lead.socialLinks || {});
    const enrichmentJson = JSON.stringify(lead.enrichmentDetails || {});

    await sql`
      INSERT INTO saved_leads (
        id, search_id, name, category, phone, email, email_status,
        website, address, city, state, zip, rating, review_count,
        place_id, status, scraped_at, opening_hours, social_links, enrichment_details, created_at
      )
      VALUES (
        ${lead.id}, ${search.id}, ${lead.name}, ${lead.category}, ${lead.phone || ""},
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

  return rows.map((r) => ({
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

  return rows.map((r) => ({
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

export interface ExistingLeadIdentifiers {
  ids: Set<string>;
  placeIds: Set<string>;
  phones: Set<string>;
  names: Set<string>;
  websites: Set<string>;
}

export async function getExistingLeadIdentifiers(): Promise<ExistingLeadIdentifiers> {
  await initDatabase();
  try {
    const [savedRows, removedRows] = await Promise.all([
      sql`
        SELECT id, place_id, phone, website, LOWER(TRIM(name)) AS name_lower
        FROM saved_leads
        LIMIT 50000;
      `,
      sql`
        SELECT id, place_id, phone, website, LOWER(TRIM(name)) AS name_lower
        FROM removed_leads
        LIMIT 50000;
      `,
    ]);

    const ids = new Set<string>();
    const placeIds = new Set<string>();
    const phones = new Set<string>();
    const names = new Set<string>();
    const websites = new Set<string>();

    const allRows = [...savedRows, ...removedRows];

    for (const row of allRows) {
      if (row.id) ids.add(String(row.id));
      if (row.place_id && String(row.place_id).trim()) {
        placeIds.add(String(row.place_id).trim());
      }
      if (row.phone) {
        const cleaned = String(row.phone).replace(/\D/g, "");
        if (cleaned.length >= 7) phones.add(cleaned);
      }
      if (row.website) {
        const cleanedUrl = String(row.website)
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .replace(/\/+$/, "")
          .toLowerCase();
        if (cleanedUrl.length > 3) websites.add(cleanedUrl);
      }
      if (row.name_lower && String(row.name_lower).trim().length > 2) {
        names.add(String(row.name_lower).trim());
      }
    }

    return { ids, placeIds, phones, names, websites };
  } catch {
    return {
      ids: new Set(),
      placeIds: new Set(),
      phones: new Set(),
      names: new Set(),
      websites: new Set(),
    };
  }
}

export function isLeadDuplicate(
  lead: Lead,
  existing: ExistingLeadIdentifiers
): boolean {
  if (lead.id && existing.ids.has(lead.id)) return true;
  if (lead.placeId && existing.placeIds.has(lead.placeId.trim())) return true;
  if (lead.phone) {
    const cleaned = lead.phone.replace(/\D/g, "");
    if (cleaned.length >= 7 && existing.phones.has(cleaned)) return true;
  }
  if (lead.website) {
    const cleanedUrl = lead.website
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "")
      .toLowerCase();
    if (cleanedUrl.length > 3 && existing.websites.has(cleanedUrl)) return true;
  }
  if (lead.name) {
    const nameLower = lead.name.toLowerCase().trim();
    if (nameLower.length > 2 && existing.names.has(nameLower)) return true;
  }
  return false;
}

export async function permanentlyRemoveLead(lead: {
  id: string;
  placeId?: string;
  phone?: string;
  website?: string;
  name: string;
  reason?: string;
}) {
  await initDatabase();
  await sql`
    INSERT INTO removed_leads (id, place_id, phone, website, name, reason, created_at)
    VALUES (
      ${lead.id},
      ${lead.placeId || ""},
      ${lead.phone || ""},
      ${lead.website || ""},
      ${lead.name},
      ${lead.reason || "removed_by_user"},
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  `;
  await sql`DELETE FROM saved_leads WHERE id = ${lead.id};`;
}

export async function getBlacklistedLeads() {
  await initDatabase();
  const rows = await sql`
    SELECT id, place_id, phone, website, name, reason, created_at
    FROM removed_leads
    ORDER BY created_at DESC
    LIMIT 200;
  `;
  return rows.map((r) => ({
    id: String(r.id),
    placeId: String(r.place_id || ""),
    phone: String(r.phone || ""),
    website: String(r.website || ""),
    name: String(r.name),
    reason: String(r.reason || "removed_by_user"),
    createdAt: String(r.created_at || ""),
  }));
}

export async function unblacklistLead(id: string) {
  await initDatabase();
  await sql`DELETE FROM removed_leads WHERE id = ${id};`;
}

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: "pending" | "approved" | "rejected";
  role: "member" | "admin";
  createdAt: string;
  updatedAt: string;
}

export async function getAccessRequests(): Promise<AccessRequest[]> {
  await initDatabase();
  const rows = await sql`
    SELECT id, name, email, company, status, role, created_at, updated_at
    FROM access_requests
    ORDER BY created_at DESC;
  `;
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    company: String(r.company || ""),
    status: (r.status as "pending" | "approved" | "rejected") || "pending",
    role: (r.role as "member" | "admin") || "member",
    createdAt: String(r.created_at || ""),
    updatedAt: String(r.updated_at || ""),
  }));
}

export async function createAccessRequest(params: {
  name: string;
  email: string;
  company?: string;
}): Promise<AccessRequest> {
  await initDatabase();
  const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const cleanEmail = params.email.toLowerCase().trim();

  const existing = await sql`
    SELECT id, name, email, company, status, role, created_at, updated_at
    FROM access_requests
    WHERE LOWER(email) = ${cleanEmail};
  `;

  if (existing.length > 0) {
    const r = existing[0];
    return {
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      company: String(r.company || ""),
      status: (r.status as "pending" | "approved" | "rejected") || "pending",
      role: (r.role as "member" | "admin") || "member",
      createdAt: String(r.created_at || ""),
      updatedAt: String(r.updated_at || ""),
    };
  }

  await sql`
    INSERT INTO access_requests (id, name, email, company, status, role, created_at, updated_at)
    VALUES (${id}, ${params.name.trim()}, ${cleanEmail}, ${params.company?.trim() || ""}, 'pending', 'member', NOW(), NOW());
  `;

  return {
    id,
    name: params.name.trim(),
    email: cleanEmail,
    company: params.company?.trim() || "",
    status: "pending",
    role: "member",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateAccessRequestStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
  role?: "member" | "admin"
) {
  await initDatabase();
  if (role) {
    await sql`
      UPDATE access_requests
      SET status = ${status}, role = ${role}, updated_at = NOW()
      WHERE id = ${id};
    `;
  } else {
    await sql`
      UPDATE access_requests
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id};
    `;
  }
}

export async function deleteAccessRequest(id: string) {
  await initDatabase();
  await sql`DELETE FROM access_requests WHERE id = ${id};`;
}

export interface CustomRegion {
  id: string;
  countryId: string;
  name: string;
  code: string;
}

export interface CustomCountry {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  regions: CustomRegion[];
}

export async function getCountriesAndRegions(): Promise<CustomCountry[]> {
  await initDatabase();
  const countries = await sql`
    SELECT id, name, code, is_default
    FROM custom_countries
    ORDER BY is_default DESC, name ASC;
  `;

  const regions = await sql`
    SELECT id, country_id, name, code
    FROM custom_regions
    ORDER BY name ASC;
  `;

  return countries.map((c) => ({
    id: String(c.id),
    name: String(c.name),
    code: String(c.code),
    isDefault: Boolean(c.is_default),
    regions: regions
      .filter((r) => r.country_id === c.id)
      .map((r) => ({
        id: String(r.id),
        countryId: String(r.country_id),
        name: String(r.name),
        code: String(r.code || ""),
      })),
  }));
}

export async function addCountry(name: string, code: string): Promise<string> {
  await initDatabase();
  const id = `c-${code.toLowerCase().trim() || Date.now()}`;
  await sql`
    INSERT INTO custom_countries (id, name, code, is_default)
    VALUES (${id}, ${name.trim()}, ${code.trim().toUpperCase()}, FALSE)
    ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;
  `;
  return id;
}

export async function addCountryWithRegions(
  name: string,
  code: string,
  regions: { name: string; code?: string }[] = []
): Promise<string> {
  await initDatabase();
  const id = `c-${code.toLowerCase().trim() || Date.now()}`;
  await sql`
    INSERT INTO custom_countries (id, name, code, is_default)
    VALUES (${id}, ${name.trim()}, ${code.trim().toUpperCase()}, FALSE)
    ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;
  `;

  for (const reg of regions) {
    const regId = `reg-${id}-${reg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    await sql`
      INSERT INTO custom_regions (id, country_id, name, code)
      VALUES (${regId}, ${id}, ${reg.name.trim()}, ${reg.code?.trim().toUpperCase() || ""})
      ON CONFLICT DO NOTHING;
    `;
  }

  return id;
}

export async function deleteCountry(id: string) {
  await initDatabase();
  await sql`DELETE FROM custom_countries WHERE id = ${id};`;
}

export async function addRegion(countryId: string, name: string, code?: string): Promise<string> {
  await initDatabase();
  const id = `reg-${countryId}-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
  await sql`
    INSERT INTO custom_regions (id, country_id, name, code)
    VALUES (${id}, ${countryId}, ${name.trim()}, ${code?.trim().toUpperCase() || ""});
  `;
  return id;
}

export async function deleteRegion(id: string) {
  await initDatabase();
  await sql`DELETE FROM custom_regions WHERE id = ${id};`;
}

export interface CustomCategoryItem {
  id: string;
  name: string;
  countryId: string | null;
  sector: string;
}

export async function getCustomCategories(countryId?: string): Promise<CustomCategoryItem[]> {
  await initDatabase();
  const rows = await sql`
    SELECT id, name, country_id, sector
    FROM custom_categories
    ORDER BY name ASC;
  `;
  const all = rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    countryId: r.country_id ? String(r.country_id) : null,
    sector: String(r.sector || "General"),
  }));

  if (countryId) {
    return all.filter((c) => c.countryId === null || c.countryId === countryId);
  }
  return all;
}

export async function addCustomCategory(name: string, countryId?: string | null, sector = "General") {
  await initDatabase();
  const id = `cat-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
  await sql`
    INSERT INTO custom_categories (id, name, country_id, sector)
    VALUES (${id}, ${name.trim()}, ${countryId || null}, ${sector.trim()});
  `;
  return id;
}

export async function deleteCustomCategory(id: string) {
  await initDatabase();
  await sql`DELETE FROM custom_categories WHERE id = ${id};`;
}

export async function verifyAdminLogin(email: string, password: string): Promise<{
  success: boolean;
  user?: { id: string; email: string; name: string; role: "admin" };
  error?: string;
}> {
  await initDatabase();
  const cleanEmail = email.toLowerCase().trim();
  const envEmail = (process.env.ADMIN_EMAIL || "admin@getlead.com").toLowerCase().trim();
  const envPassword = process.env.ADMIN_PASSWORD || "talhaammar";

  const rows = await sql`
    SELECT id, email, password, name, role
    FROM admin_users
    WHERE LOWER(email) = ${cleanEmail};
  `;

  if (rows.length > 0) {
    const user = rows[0];
    if (user.password === password) {
      return {
        success: true,
        user: {
          id: String(user.id),
          email: String(user.email),
          name: String(user.name || "Administrator"),
          role: "admin",
        },
      };
    }
  }

  if (cleanEmail === envEmail && password === envPassword) {
    return {
      success: true,
      user: {
        id: "admin-env",
        email: envEmail,
        name: "Administrator",
        role: "admin",
      },
    };
  }

  return { success: false, error: "Invalid email or password" };
}


