# MapScout - Google Maps Lead Finder & Enrichment

A modern, high-performance web application designed to discover, extract, and enrich B2B business leads directly from Google Maps across any US state and industry. Every search is automatically persisted into a serverless **Neon PostgreSQL** database with one-click CSV/JSON export and historical search tracking.

---

## Key Features

- **Multi-Provider Search Engine**:
  - **OpenStreetMap / Overpass (Default & 100% Free Forever)**: Unlimited lead extraction with zero credit card required, zero API keys needed, and global coverage.
  - **SerpApi (Google Maps)**: Direct Google Maps scraping via SerpApi for users wanting official Google Maps POI data.
- **Automated Email & Social Enrichment**: An internal background crawler visits each business website (home, `/contact`, `/about`) to extract direct emails, verified domains, and social media handles (LinkedIn, Facebook, Instagram).
- **100% Real Leads**: Completely free of dummy or mock fallback data. All results are fetched live from the selected provider.
- **Neon Serverless PostgreSQL Database**: Searches and scraped leads are automatically stored with relational search session history.
- **Search History Dashboard (`/history`)**: Revisit past searches, inspect leads, re-export datasets, or manage historical records.
- **One-Click Export**: Download datasets directly as formatted **CSV** (for Excel, Google Sheets, CRM import) or **JSON**.
- **Minimalist & Modern UI**: Built with shadcn UI components, Tailwind CSS v4, responsive tables, cards view, and slide-over lead detail sheets.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI & Styling**: React 19, [Tailwind CSS v4](https://tailwindcss.com/), [shadcn UI](https://ui.shadcn.com/)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/) via `@neondatabase/serverless`
- **Data Providers**: OpenStreetMap (Overpass & Nominatim) + SerpApi (Google Maps)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

---

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your machine.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create or update your `.env.local` file in the project root:

```env
# Neon Serverless PostgreSQL Connection String (Required for saving searches & leads)
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT.neon.tech/neondb?sslmode=require&channel_binding=require"

# Option 1: OpenStreetMap / Overpass (Default)
# NO API KEY OR CREDIT CARD REQUIRED! Works out of the box with 100% free unlimited access.

# Option 2: SerpApi for Google Maps (Optional)
SERPAPI_KEY="your_serpapi_key_here"
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied) in your browser.

---

## How to Get Your Free SerpApi Key (No Credit Card Required)

1. Go to [serpapi.com](https://serpapi.com) and click **Sign Up** (use Google, GitHub, or any email).
2. Go to your SerpApi Dashboard.
3. Copy your **Private API Key**.
4. Paste it into `.env.local` as `SERPAPI_KEY="your_key_here"`.
5. You get **100 free searches every month** to extract real Google Maps businesses with phones, addresses, and websites!

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── history/route.ts   # Neon search history CRUD endpoints
│   │   │   └── leads/route.ts     # Google Maps & lead search endpoint
│   │   ├── history/page.tsx       # Search history dashboard
│   │   ├── globals.css            # Tailwind CSS v4 design tokens
│   │   ├── layout.tsx             # Root layout with font and toaster
│   │   └── page.tsx               # Main lead search & discovery page
│   ├── components/
│   │   ├── ui/                    # Official shadcn UI components
│   │   ├── export-dialog.tsx      # CSV/JSON file download modal
│   │   ├── lead-cards.tsx         # Responsive grid card view
│   │   ├── lead-detail-sheet.tsx  # Slide-over business detail drawer
│   │   ├── lead-metrics.tsx       # Statistics overview bar
│   │   ├── lead-table.tsx         # Data-rich lead table with checkboxes
│   │   ├── navbar.tsx             # Header with route navigation
│   │   └── search-filters.tsx     # Keyword, state & category filter controls
│   ├── data/
│   │   └── mockLeads.ts           # Categories list & regional datasets
│   ├── lib/
│   │   ├── db.ts                  # Neon PostgreSQL schema and query methods
│   │   ├── scraper.ts             # Website email crawler & Google Places client
│   │   └── utils.ts               # Class merging utility
│   └── types/
│       └── lead.ts                # TypeScript interfaces for leads and filters
├── .env.local                     # Environment variables
├── components.json                # shadcn configuration
├── neon.ts                        # Neon configuration
└── package.json
```

---

## Production Build

To build the optimized production bundle:
```bash
npm run build
npm run start
```
