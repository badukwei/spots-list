# Progress

## Backend Plan (2026-04-10-spots-list-backend.md)

- [x] Task 1: NestJS scaffold + tsconfig
- [x] Task 2: Drizzle schema + DbModule
- [x] Task 3: Categories module (CRUD + search + tests)
- [x] Task 4: Spots module (CRUD + search + tests)
- [x] Task 5: main.ts (CORS, ValidationPipe, port 3001)
- [x] Task 6: Dockerfile

## Frontend Plan (Phase 1)

- [ ] Not started (plan not yet written)

## Integration Testing Plan (Phase 2)

- [ ] Not started — local frontend + backend testing together

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
