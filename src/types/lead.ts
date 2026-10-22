export type EmailStatus = "verified" | "unverified" | "not_found";

export type LeadStatus =
  | "New"
  | "Approved"
  | "Rejected"
  | "Pending"
  | "Follow Up"
  | "Interested"
  | "Contacted"
  | "Qualified"
  | "Archived";

export interface Lead {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string | null;
  emailStatus: EmailStatus;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rating: number;
  reviewCount: number;
  placeId: string;
  status: LeadStatus;
  scrapedAt: string;
  openingHours?: string;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  enrichmentDetails?: {
    sourceUrl?: string;
    domainVerified?: boolean;
    extractedAt?: string;
  };
}

export interface LeadFilters {
  query: string;
  country?: string;
  state: string;
  hasEmailOnly: boolean;
  hasPhoneOnly: boolean;
  hasWebsiteOnly: boolean;
  minRating: number;
  maxRating?: number;
  ratingRange?: string;
  category: string;
  provider?: "osm" | "serpapi";
  limit?: number;
}
