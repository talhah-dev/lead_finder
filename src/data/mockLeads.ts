import { Lead } from "@/types/lead";

export interface USState {
  code: string;
  value: string;
  label: string;
  region: string;
}

export interface LeadCategory {
  id: string;
  value: string;
  label: string;
  sector: string;
}

export const CATEGORIES_DATA: LeadCategory[] = [
  { id: "all", value: "all-categories", label: "All Categories", sector: "General" },
  { id: "clinics", value: "clinics", label: "Clinics", sector: "Healthcare" },
  { id: "medical-practices", value: "medical-practices", label: "Medical Practices", sector: "Healthcare" },
  { id: "medical-services", value: "medical-services", label: "Medical Services", sector: "Healthcare" },
  { id: "dentists", value: "dentists", label: "Dentists", sector: "Healthcare" },
  { id: "urgent-care", value: "urgent-care", label: "Urgent Care", sector: "Healthcare" },
  { id: "chiropractors", value: "chiropractors", label: "Chiropractors", sector: "Healthcare" },
  { id: "physical-therapy", value: "physical-therapy", label: "Physical Therapy", sector: "Healthcare" },
  { id: "veterinary", value: "veterinary-clinics", label: "Veterinary Clinics", sector: "Healthcare" },
  { id: "plumbers", value: "plumbers", label: "Plumbers", sector: "Home Services" },
  { id: "hvac", value: "air-conditioning-repair", label: "Air Conditioning Repair", sector: "Home Services" },
  { id: "electricians", value: "electricians", label: "Electricians", sector: "Home Services" },
  { id: "roofers", value: "roofers", label: "Roofers", sector: "Home Services" },
  { id: "pest-control", value: "pest-control-services", label: "Pest Control Services", sector: "Home Services" },
  { id: "cleaning", value: "cleaning-services", label: "Cleaning Services", sector: "Home Services" },
  { id: "landscaping", value: "landscaping", label: "Landscaping", sector: "Home Services" },
  { id: "auto-repair", value: "auto-repair-shops", label: "Auto Repair Shops", sector: "Automotive" },
  { id: "barbers", value: "barbers", label: "Barbers", sector: "Personal Care" },
  { id: "appliance-repair", value: "appliance-repair", label: "Appliance Repair", sector: "Home Services" },
  { id: "garage-doors", value: "garage-door-repair", label: "Garage Door Repair", sector: "Home Services" },
  { id: "locksmiths", value: "locksmiths", label: "Locksmiths", sector: "Home Services" },
  { id: "tree-services", value: "tree-services", label: "Tree Services", sector: "Home Services" },
  { id: "painters", value: "painting-contractors", label: "Painting Contractors", sector: "Home Services" },
  { id: "pool-services", value: "pool-service", label: "Pool Service", sector: "Home Services" },
  { id: "remodeling", value: "bathroom-remodeling", label: "Bathroom Remodeling", sector: "Home Services" },
  { id: "air-duct", value: "air-duct-cleaning", label: "Air Duct Cleaning", sector: "Home Services" },
];

export const CATEGORIES = CATEGORIES_DATA.map((cat) => cat.label);

export const US_STATES_DATA: USState[] = [
  { code: "ALL", value: "all-states", label: "All States", region: "United States" },
  { code: "AL", value: "alabama", label: "Alabama", region: "South" },
  { code: "AK", value: "alaska", label: "Alaska", region: "West" },
  { code: "AZ", value: "arizona", label: "Arizona", region: "West" },
  { code: "AR", value: "arkansas", label: "Arkansas", region: "South" },
  { code: "CA", value: "california", label: "California", region: "West" },
  { code: "CO", value: "colorado", label: "Colorado", region: "West" },
  { code: "CT", value: "connecticut", label: "Connecticut", region: "Northeast" },
  { code: "DE", value: "delaware", label: "Delaware", region: "South" },
  { code: "FL", value: "florida", label: "Florida", region: "South" },
  { code: "GA", value: "georgia", label: "Georgia", region: "South" },
  { code: "HI", value: "hawaii", label: "Hawaii", region: "West" },
  { code: "ID", value: "idaho", label: "Idaho", region: "West" },
  { code: "IL", value: "illinois", label: "Illinois", region: "Midwest" },
  { code: "IN", value: "indiana", label: "Indiana", region: "Midwest" },
  { code: "IA", value: "iowa", label: "Iowa", region: "Midwest" },
  { code: "KS", value: "kansas", label: "Kansas", region: "Midwest" },
  { code: "KY", value: "kentucky", label: "Kentucky", region: "South" },
  { code: "LA", value: "louisiana", label: "Louisiana", region: "South" },
  { code: "ME", value: "maine", label: "Maine", region: "Northeast" },
  { code: "MD", value: "maryland", label: "Maryland", region: "South" },
  { code: "MA", value: "massachusetts", label: "Massachusetts", region: "Northeast" },
  { code: "MI", value: "michigan", label: "Michigan", region: "Midwest" },
  { code: "MN", value: "minnesota", label: "Minnesota", region: "Midwest" },
  { code: "MS", value: "mississippi", label: "Mississippi", region: "South" },
  { code: "MO", value: "missouri", label: "Missouri", region: "Midwest" },
  { code: "MT", value: "montana", label: "Montana", region: "West" },
  { code: "NE", value: "nebraska", label: "Nebraska", region: "Midwest" },
  { code: "NV", value: "nevada", label: "Nevada", region: "West" },
  { code: "NH", value: "new-hampshire", label: "New Hampshire", region: "Northeast" },
  { code: "NJ", value: "new-jersey", label: "New Jersey", region: "Northeast" },
  { code: "NM", value: "new-mexico", label: "New Mexico", region: "West" },
  { code: "NY", value: "new-york", label: "New York", region: "Northeast" },
  { code: "NC", value: "north-carolina", label: "North Carolina", region: "South" },
  { code: "ND", value: "north-dakota", label: "North Dakota", region: "Midwest" },
  { code: "OH", value: "ohio", label: "Ohio", region: "Midwest" },
  { code: "OK", value: "oklahoma", label: "Oklahoma", region: "South" },
  { code: "OR", value: "oregon", label: "Oregon", region: "West" },
  { code: "PA", value: "pennsylvania", label: "Pennsylvania", region: "Northeast" },
  { code: "RI", value: "rhode-island", label: "Rhode Island", region: "Northeast" },
  { code: "SC", value: "south-carolina", label: "South Carolina", region: "South" },
  { code: "SD", value: "south-dakota", label: "South Dakota", region: "Midwest" },
  { code: "TN", value: "tennessee", label: "Tennessee", region: "South" },
  { code: "TX", value: "texas", label: "Texas", region: "South" },
  { code: "UT", value: "utah", label: "Utah", region: "West" },
  { code: "VT", value: "vermont", label: "Vermont", region: "Northeast" },
  { code: "VA", value: "virginia", label: "Virginia", region: "South" },
  { code: "WA", value: "washington", label: "Washington", region: "West" },
  { code: "WV", value: "west-virginia", label: "West Virginia", region: "South" },
  { code: "WI", value: "wisconsin", label: "Wisconsin", region: "Midwest" },
  { code: "WY", value: "wyoming", label: "Wyoming", region: "West" },
];

export const US_STATES = US_STATES_DATA.map((state) => state.label);

export const MOCK_LEADS: Lead[] = [];
