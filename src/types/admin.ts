export interface AccessReq {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: "pending" | "approved" | "rejected";
  role: "member" | "admin";
  createdAt: string;
}

export interface CustomReg {
  id: string;
  countryId: string;
  name: string;
  code: string;
}

export interface CustomCtry {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  regions: CustomReg[];
}

export interface CategoryItem {
  id: string;
  name: string;
  countryId: string | null;
  sector: string;
}

export interface BlacklistedLead {
  id: string;
  placeId: string;
  phone: string;
  website: string;
  name: string;
  reason: string;
  createdAt: string;
}

export interface WorldCountry {
  name: string;
  code: string;
  flag?: string;
  phonecode?: string;
  currency?: string;
  statesCount?: number;
}

export interface WorldSubdivision {
  name: string;
  code: string;
}

export interface WorldCity {
  name: string;
  stateCode: string;
}
