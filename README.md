# MapScout - Google Maps Lead Finder & Enrichment

A modern, high-performance web application designed to discover, extract, and enrich B2B business leads directly from Google Maps across any US state and industry. Every search is automatically persisted into a serverless **Neon PostgreSQL** database with one-click CSV/JSON export and historical search tracking.

---

## Key Features

- **Google Maps Places Search**: Extract business names, physical addresses, ratings, review counts, direct phone numbers, and official websites.
- **Automated Email & Social Enrichment**: An internal background crawler visits each business website (home, `/contact`, `/about`) to extract direct emails, verified domains, and social media handles (LinkedIn, Facebook, Instagram).
- **Neon Serverless PostgreSQL Database**: Searches and scraped leads are automatically stored with relational search session history.
- **Search History Dashboard (`/history`)**: Revisit past searches, inspect leads, re-export datasets, or manage historical records.
- **One-Click Export**: Download datasets directly as formatted **CSV** (for Excel, Google Sheets, CRM import) or **JSON**.
- **Minimalist & Modern UI**: Built with shadcn UI components, Tailwind CSS v4, responsive tables, cards view, and slide-over lead detail sheets.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI & Styling**: React 19, [Tailwind CSS v4](https://tailwindcss.com/), [shadcn UI](https://ui.shadcn.com/)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/) via `@neondatabase/serverless`
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
# Neon Serverless PostgreSQL Connection String
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT.neon.tech/neondb?sslmode=require&channel_binding=require"

# Google Places API Key (from Google Cloud Console)
GOOGLE_PLACES_API_KEY="AIzaSyYourGoogleApiKeyHere"
```

> **Note**: Even before adding your Google API key, the application includes a realistic data provider and direct website crawler for local development.

### 4. Running Locally
Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied) in your browser.

---

## How to Get Your Google Places API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Navigate to **APIs & Services > Library**.
4. Search for **Places API (New)** and click **Enable**.
5. Go to **APIs & Services > Credentials**.
6. Click **+ CREATE CREDENTIALS > API key**.
7. Copy your key and paste it into `.env.local` under `GOOGLE_PLACES_API_KEY`.

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
