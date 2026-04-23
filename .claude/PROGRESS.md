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
- [ ] **TODO: Delete UI (categories + spots)** — must use soft delete (`deletedAt` column); do not build until soft delete schema migration is done

## UI Redesign Plan (Phase 2.1) — spec: docs/superpowers/specs/2026-04-23-ui-redesign-design.md
## Implementation plan: docs/superpowers/plans/2026-04-23-ui-redesign.md

- [x] Task 1: Design tokens + fonts (index.css + tailwind.config.ts) ← DONE, committed 5f882f5
- [ ] **NEXT: Task 2** — Create `frontend/src/lib/emoji.ts` + `emoji.test.ts` (getAutoEmoji, getCategoryColor, getSpotGradient)
- [ ] Task 3: CategoryCard rewrite
- [ ] Task 4: CategoryListItem rewrite (sidebar item)
- [ ] Task 5: SpotCard rewrite
- [ ] Task 6: SpotListItem rewrite
- [ ] Task 7: HomePage rewrite
- [ ] Task 8: CategoryDetailPage rewrite
- [ ] Task 9: Modal cleanup (AddCategoryModal, AddSpotModal, SpotDetailModal)
- Full redesign: light/bright Instagram-inspired. App renamed to **地點找找看**
- Font: Plus Jakarta Sans + Noto Sans TC. Accent: #ff6b35 orange
- Desktop: sticky header + sidebar (categories) + 3-col spot grid
- Mobile: stories-style category row + 2-col grid
- Spot thumbnails: color gradient mock (no real image)
- Emoji: auto-assign by index (mock) until Phase 2.2 schema migration lands

## Emoji Schema Migration (Phase 2.2)

- [ ] Backend: add `emoji` nullable text field to `categories` Drizzle schema
- [ ] Backend: update `CreateCategoryDto` + `UpdateCategoryDto` to accept optional `emoji`
- [ ] Backend: `drizzle-kit push` to Supabase
- [ ] Backend: update unit tests
- [ ] Frontend: wire up real `emoji` field (replace auto-assign mock)

## Integration Testing Plan (Phase 2.3)

- [ ] Not started — local frontend + backend testing together

## Soft Delete Plan (Phase 2.4)

- [ ] Not started
- Backend: add `deletedAt` timestamp to `categories` + `spots` schema; filter out in all queries; migration via `drizzle-kit push`
- Frontend: delete UI for categories + spots (trigger soft delete, not hard delete)
- Tests: unit tests for filtered queries + delete endpoints

## Backend Security Plan (Phase 3)

- [ ] Not started
- Items: @nestjs/throttler rate limiting, Helmet headers, body size limit (10kb)
- Items: Pagination on all list endpoints (default 20, max 100)
- Items: Field length validation (name ≤ 100, notes ≤ 500, address ≤ 200, search ≤ 100)
- Items: Tests for all above

## Deployment Plan (Phase 4)

- [ ] Not started — EC2 + Docker + Supabase production setup

## Production Security Plan (Phase 5)

- [ ] Not started
- Items: Cloudflare DNS + DDoS protection (free tier)
- Items: EC2 Security Group — only allow 80/443 from Cloudflare IP ranges
- Items: Nginx config — reverse proxy + SSL (Certbot) + static file serving
- Items: NestJS bind 127.0.0.1 only (不對外)
