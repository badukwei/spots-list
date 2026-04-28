# Progress

## Backend Plan (2026-04-10-spots-list-backend.md)

- [x] Task 1: NestJS scaffold + tsconfig
- [x] Task 2: Drizzle schema + DbModule
- [x] Task 3: Categories module (CRUD + search + tests)
- [x] Task 4: Spots module (CRUD + search + tests)
- [x] Task 5: main.ts (CORS, ValidationPipe, port 3001)
- [x] Task 6: Dockerfile

## Frontend Plan (Phase 1)

- [x] Task 1-2: Vite scaffold + Tailwind + shadcn/ui setup
- [x] Task 3: TypeScript types
- [x] Task 4: Zod schemas + tests
- [x] Task 5: TanStack Query setup + useCategories hooks
- [x] Task 6: useSpots hooks
- [x] Task 7: CategoryCard + CategoryListItem components
- [x] Task 8: SpotCard + SpotListItem components
- [x] Task 9: AddCategoryModal
- [x] Task 10: AddSpotModal
- [x] Task 11: SpotDetailModal
- [x] Task 12: HomePage
- [x] Task 13: CategoryDetailPage + routing
- [x] **Delete UI (categories + spots)** — implemented in Phase 2.4 (soft delete via `deletedAt`)

## UI Redesign Plan (Phase 2.1) — spec: docs/superpowers/specs/2026-04-23-ui-redesign-design.md
## Implementation plan: docs/superpowers/plans/2026-04-23-ui-redesign.md

- [x] Task 1: Design tokens + fonts (index.css + tailwind.config.ts) ← DONE, committed 5f882f5
- [x] Task 2: Create `frontend/src/lib/emoji.ts` + `emoji.test.ts` (getAutoEmoji, getCategoryColor, getSpotGradient)
- [x] Task 3: CategoryCard rewrite
- [x] Task 4: CategoryListItem rewrite (sidebar item)
- [x] Task 5: SpotCard rewrite
- [x] Task 6: SpotListItem rewrite
- [x] Task 7: HomePage rewrite
- [x] Task 8: CategoryDetailPage rewrite
- [x] Task 9: Modal cleanup (AddCategoryModal, AddSpotModal, SpotDetailModal)
- **UI Redesign Phase 2.1 COMPLETE**
- Full redesign: light/bright Instagram-inspired. App renamed to **地點找找看**
- Font: Plus Jakarta Sans + Noto Sans TC. Accent: #ff6b35 orange
- Desktop: sticky header + sidebar (categories) + 3-col spot grid
- Mobile: stories-style category row + 2-col grid
- Spot thumbnails: color gradient mock (no real image)
- Emoji: auto-assign by index (mock) until Phase 2.2 schema migration lands

## Emoji Schema Migration (Phase 2.2) — COMPLETE

- [x] Backend: add `emoji` nullable text field to `categories` Drizzle schema
- [x] Backend: update `CreateCategoryDto` + `UpdateCategoryDto` to accept optional `emoji`
- [x] Backend: `drizzle-kit push` to Supabase
- [x] Backend: update unit tests
- [x] Frontend: wire up real `emoji` field (replace auto-assign mock with `category.emoji ?? getAutoEmoji(index)`)
- [x] Frontend: EditCategoryModal — emoji picker (63 emoji) + name input, calls PATCH /categories/:id
- [x] Frontend: edit button (pencil, hover) on CategoryCard + CategoryListItem
- [x] Frontend: HomePage + CategoryDetailPage wired to EditCategoryModal

## Integration Testing Plan (Phase 2.3)

- [ ] Not started — local frontend + backend testing together

## Soft Delete + Duplicate Detection (Phase 2.4) — COMPLETE

- [x] Backend: add `deletedAt` to categories + spots schema
- [x] Backend: all queries filter `isNull(deletedAt)`; remove() soft-deletes (no hard delete)
- [x] Backend: category remove also soft-deletes all spots in category
- [x] Backend: unit tests updated (soft-delete assertions)
- [x] Backend: `drizzle-kit push` to Supabase
- [x] Frontend: `useDeleteCategory` + `useDeleteSpot` hooks
- [x] Frontend: `ConfirmDialog` component
- [x] Frontend: trash button (hover) on CategoryCard, CategoryListItem, SpotCard, SpotListItem
- [x] Frontend: ConfirmDialog wired in HomePage + CategoryDetailPage
- [x] Frontend: AddCategoryModal — emoji picker (replaces text input) + fuzzy duplicate name warning (fuse.js)
- [x] Frontend: AddSpotModal — fuzzy duplicate name + exact mapsUrl duplicate warning

## Backend Security Plan (Phase 3)

### Phase 3a: Security hardening — COMPLETE (branch: phase-3-backend-security)

- [x] Helmet security headers (main.ts)
- [x] Body size limit 10kb (main.ts)
- [x] Search query MaxLength(100) via SearchCategoryDto + PaginationDto
- [x] Rate limiting: `long` TTL 60s limit 20 + `short` TTL 3s limit 1 (burst)
- [x] E2e tests for rate limiting (test/throttler.e2e-spec.ts)
- [x] Fix stale app.e2e-spec.ts scaffold test

### Phase 3b: Pagination — COMPLETE (branch: phase-3-pagination)

- [x] Task 29: Backend categories pagination — `GET /categories` returns `{ data, total, page, limit, totalPages }`; PaginationDto created
- [x] Task 30: Backend spots pagination — `GET /categories/:id/spots` same format
- [x] Task 31: Frontend PaginatedResponse type + update useCategories/useSpots hooks
- [x] Task 32: Frontend pagination UI (HomePage + CategoryDetailPage) — Pagination component + prev/next controls

## Deployment Plan (Phase 4)

- [ ] Not started — EC2 + Docker + Supabase production setup

## Production Security Plan (Phase 5)

- [ ] Not started
- Items: Cloudflare DNS + DDoS protection (free tier)
- Items: EC2 Security Group — only allow 80/443 from Cloudflare IP ranges
- Items: Nginx config — reverse proxy + SSL (Certbot) + static file serving
- Items: NestJS bind 127.0.0.1 only (不對外)
