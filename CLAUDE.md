# CLAUDE.md

## Required Reading

Before doing anything, read these files:

- `.claude/PROGRESS.md` — current task status
- `.claude/ARCHITECTURE.md` — folder structure and data model
- `.claude/DECISIONS.md` — key decisions, commit log, notable fixes


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Spots List — shared anonymous spots-listing app (no auth). Backend: NestJS + Drizzle ORM + Supabase. Frontend: React + Vite (not yet built).

Run all commands from `backend/`.

## Commands

```bash
npm run start:dev     # port 3001
npm test              # all unit tests
npm test -- --testPathPatterns=categories.service  # single file
npx drizzle-kit push  # push schema to Supabase (requires .env)
```

## Environment

Use **Session Pooler** URL from Supabase (not Direct connection) — Direct is IPv6-only on free tier.

## Key Decisions

- `DATABASE` token → inject Drizzle instance. `PG_CLIENT` is internal, do not inject in services.
- Supabase Data API disabled — all DB access via NestJS + Drizzle only.
- LIKE wildcards (`%`, `_`) escaped in search queries before passing to `ilike()`.
- `ValidationPipe` added in `main.ts` (Task 5) — DTO validation not active before that.
