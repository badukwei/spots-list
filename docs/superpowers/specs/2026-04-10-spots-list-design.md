# Spots List — Design Spec

Date: 2026-04-10

## Overview

A shared, anonymous spots-listing app. Users can create themed categories and add places under them. No login required — anyone can create, edit, and delete categories and spots (Wikipedia-style).

Core concept: the category is the main unit. A category has a creative or normal theme (e.g., "Places to cry alone"), and anyone can add spots under it.

Frontend and backend are separated. The frontend calls the backend REST API.

---

## Architecture

```
/frontend         → React + Vite + Tailwind CSS
/backend          → NestJS + Drizzle ORM + PostgreSQL
docker-compose.yml
```

- Frontend: pure SPA, calls backend REST API
- Backend: NestJS REST API, handles all DB operations
- Both services run via Docker Compose on AWS EC2

---

## Data Model

```sql
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE spots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  address      TEXT,
  maps_url     TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

- No user table — fully open, no auth
- `ON DELETE CASCADE` — deleting a category removes all its spots
- Duplicate categories are allowed for now (dedup not in scope)

---

## REST API Endpoints

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List all categories (supports `?q=` search) |
| GET | `/categories/:id` | Get single category |
| POST | `/categories` | Create category |
| PATCH | `/categories/:id` | Update category name |
| DELETE | `/categories/:id` | Delete category (cascades spots) |

### Spots

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories/:id/spots` | List spots under a category |
| POST | `/categories/:id/spots` | Create spot |
| PATCH | `/spots/:id` | Update spot |
| DELETE | `/spots/:id` | Delete spot |

---

## Frontend Pages & Routing

| Route | Description |
|-------|-------------|
| `/` | Redirect to `/categories` |
| `/categories` | List all categories + search box + add category button |
| `/categories/:id` | Category detail: list spots + add/edit/delete spots |

Search uses `?q=` query string, passed to the API.

---

## Project Structure

### Backend (NestJS)

```
backend/
  src/
    categories/
      categories.module.ts
      categories.controller.ts    → HTTP handlers
      categories.service.ts       → business logic
      categories.dto.ts           → CreateCategoryDto, UpdateCategoryDto
    spots/
      spots.module.ts
      spots.controller.ts
      spots.service.ts
      spots.dto.ts                → CreateSpotDto, UpdateSpotDto
    db/
      db.module.ts                → Drizzle client provider
      schema.ts                   → Drizzle table definitions
  main.ts                         → bootstrap, CORS config
  Dockerfile
```

### Frontend (React + Vite)

```
frontend/
  src/
    pages/
      CategoriesPage.tsx
      CategoryDetailPage.tsx
    components/
      CategoryCard.tsx            → inline edit + delete
      SpotCard.tsx                → inline edit + delete
      SearchInput.tsx
      AddCategoryForm.tsx
      AddSpotForm.tsx
    api/
      categories.ts               → API calls for categories
      spots.ts                    → API calls for spots
    App.tsx
    main.tsx
  Dockerfile
```

### Root

```
docker-compose.yml
```

---

## Tech Stack

| Item | Choice |
|------|--------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | NestJS |
| ORM | Drizzle ORM |
| Database | PostgreSQL via Supabase (migratable) |
| Deploy | AWS EC2 + Docker Compose |

### Migration Strategy

DB connection lives only in `backend/src/db/db.module.ts` via `DATABASE_URL`. To migrate away from Supabase, only the env var and this file need to change.

---

## Data Flow

**Read:**
```
CategoriesPage (React)
  → GET /categories (fetch)
    → CategoriesController (NestJS)
      → CategoriesService
        → Drizzle query → PostgreSQL
```

**Write:**
```
AddCategoryForm (React)
  → POST /categories (fetch)
    → CategoriesController
      → CategoriesService
        → Drizzle insert → PostgreSQL
```

---

## CRUD Summary

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Category | Form on `/categories` | List page | Inline edit on card | Button on card |
| Spot | Form on `/categories/:id` | Detail page | Inline edit on card | Button on card |

Edit is inline (click to edit on card), no separate edit page.

---

## Out of Scope

- Authentication / user accounts
- Category deduplication
- Image uploads
- Maps embed (only link)
- Real-time updates
