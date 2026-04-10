# Decisions & Changes

## Key Architecture Decisions

| Decision | Reason |
|----------|--------|
| NestJS (not Next.js API) | Frontend/backend separation, backend reusability |
| Drizzle ORM | Type-safe, SQL-like, easy to migrate away from Supabase |
| Supabase Data API disabled | All DB access via NestJS only, no direct PostgREST |
| `DATABASE` token (not `PG_CLIENT`) | Inject Drizzle instance in services; raw client is internal |
| Session Pooler URL | Direct connection is IPv6-only on Supabase free tier |

## Commit Log (feature/backend)

| Commit | Description |
|--------|-------------|
| `cb0926d` | init: project structure with spec, plan, gitignore |
| `74df61d` | feat: scaffold NestJS backend |
| `ac7d6bb` | fix: flatten backend directory structure (double-nested backend/backend) |
| `1d22bf1` | feat: add drizzle schema and db module |
| `6ccaba0` | fix: close postgres connection pool on shutdown (OnApplicationShutdown) |
| `0fbb2a9` | feat: add categories module with CRUD |
| `6d70a2a` | test: improve categories module test coverage (expanded from 2 → 15 tests) |
| `7d9fd11` | fix: escape LIKE wildcards in category search (`%`, `_`, `\`) |

## Notable Fixes

**`ac7d6bb`** — Subagent ran `nest new backend` inside `.worktrees/backend/`, creating `backend/backend/` double nesting. Manually fixed with `mv backend/{.,}* .`

**`6ccaba0`** — Code review caught postgres-js connection pool not being closed. Added `PG_CLIENT` token and `OnApplicationShutdown` lifecycle hook.

**`6d70a2a`** — Code review found only 2/5 endpoints tested. Expanded to full coverage including search path and mutation tests.

**`7d9fd11`** — `%` and `_` in search input matched unintended rows via SQL LIKE. Fixed by escaping before passing to `ilike()`.

**`687b275`** — Fixed `import type { DrizzleDB }` in categories.service.ts; `tsc --noEmit` failed with TS1272 due to `isolatedModules` + `emitDecoratorMetadata`.

**`d8d5c7d`** — `findByCategory` and `create` in SpotsService now call `categoriesService.findOne(categoryId)` first, so non-existent category returns 404 instead of `[]` or 500. Required exporting CategoriesService from CategoriesModule and importing CategoriesModule in SpotsModule.

**`be03296`** — Full code review fixes: ParseUUIDPipe on all :id/:categoryId params (prevents 500 on invalid UUID); BadRequestException on empty PATCH body; `@IsUrl({ require_protocol: false })` for mapsUrl; PATCH/DELETE spots routes now include categoryId (`/categories/:categoryId/spots/:id`) for consistency; `createdAt` fields marked `.notNull()` in schema.
