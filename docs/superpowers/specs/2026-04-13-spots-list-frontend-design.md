# Spots List Frontend Design

## Goal

Build a responsive React + Vite frontend for the Spots List app — a public anonymous platform where anyone can create quirky, specific categories (e.g., "適合一個人哭的地方") and add real-world spots to them.

## Architecture

```
Browser
    ↓ HTTPS
Cloudflare (free tier)
  - DDoS protection, bot filtering, edge rate limiting
    ↓
EC2 Nginx
  - Serves static React build files
  - Reverse proxies /api/* → localhost:3001
  - SSL termination (Certbot)
  - EC2 Security Group: only Cloudflare IP ranges on 80/443
    ↓
NestJS on 127.0.0.1:3001 (not externally accessible)
    ↓
Supabase PostgreSQL
```

API calls from the frontend always use `/api/...` as the base path. Nginx handles routing to NestJS. NestJS port is never exposed publicly.

## Tech Stack

| Purpose | Package |
|---------|---------|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| HTTP client | axios (baseURL: `/api`) |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v3 |
| UI components | shadcn/ui |

## Pages & Routing

```
/                    Homepage — category list + search + add category
/categories/:id      Category detail — spot list + add spot
```

No auth pages, no settings pages.

## Page Designs

### Homepage (`/`)

- **Header**: App name, "+ 新增分類" button (top right)
- **Search bar**: Searches category names via API (`GET /api/categories?q=...`), debounced 300ms
- **Category list**:
  - Desktop (≥768px): 2–3 column grid of cards
  - Mobile (<768px): Single-column list
  - Each item shows: category name, spot count
  - Click → navigate to `/categories/:id`

### Category Detail (`/categories/:id`)

- **Back button** → homepage
- **Category name** as page heading
- **"+ 新增景點" button**
- **Spot list**: Each spot shows name, address, maps_url (as link), notes
- Click spot → opens spot detail modal

## Modals

All forms open as overlays without page navigation.

### Add Category Modal
- Field: `name` (required, max 100 chars)
- Submit → POST `/api/categories` → close modal → refetch category list

### Add Spot Modal
- Fields: `name` (required, max 100), `address` (max 200), `maps_url` (max 500, valid URL), `notes` (max 500)
- Submit → POST `/api/categories/:id/spots` → close modal → refetch spot list

### Spot Detail Modal
- Read-only display of all spot fields
- Maps URL rendered as clickable link (`target="_blank" rel="noopener noreferrer"`)

## Responsive Behavior

| Breakpoint | Category list | Spot list |
|------------|--------------|-----------|
| ≥ 768px (desktop) | 2–3 col grid cards | Card grid |
| < 768px (mobile) | Single-col list rows | Single-col list rows |

## Data Fetching

- TanStack Query manages all server state (cache, loading, error)
- `queryKey: ['categories']` for homepage
- `queryKey: ['spots', categoryId]` for category detail
- Mutations (add category/spot) invalidate relevant query keys on success

## Error Handling

- Network errors → show inline error message, do not crash
- 404 on `/categories/:id` → redirect to homepage
- Form validation errors → shown inline below each field (Zod + React Hook Form)

## Security Notes (Frontend)

- All user content rendered as plain text nodes — never injected as raw HTML
- `maps_url` rendered as `<a href>` with `target="_blank" rel="noopener noreferrer"`
- No API keys or secrets in frontend code
- All API calls relative (`/api/...`), never hardcoded backend URLs
