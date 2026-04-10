# Architecture

## Monorepo Layout

```
spots-list/
├── .claude/            # Claude context (not committed)
├── .worktrees/
│   └── backend/        # feature/backend branch (merge pending)
├── docs/
│   └── superpowers/
│       ├── specs/      # Design docs
│       └── plans/      # Implementation plans
├── .gitignore
└── CLAUDE.md
```

## Backend (.worktrees/backend/)

```
src/
├── app.module.ts
├── main.ts             # (Task 5 - not yet written)
├── db/
│   ├── db.module.ts    # Global DbModule: PG_CLIENT + DATABASE tokens
│   └── schema.ts       # categories, spots tables
└── categories/
│   ├── categories.module.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   ├── categories.controller.spec.ts
│   ├── categories.service.spec.ts
│   └── dto/
│       ├── create-category.dto.ts
│       └── update-category.dto.ts
└── spots/              # (Task 4 - not yet written)
```

## Frontend (not yet started)

React + Vite, separate directory TBD.

## Data Model

```
categories
  id          uuid PK
  name        text NOT NULL
  created_at  timestamp

spots
  id          uuid PK
  category_id uuid FK → categories.id (CASCADE DELETE)
  name        text NOT NULL
  address     text
  maps_url    text
  notes       text
  created_at  timestamp
```

## Deployment (planned)

- Backend: AWS EC2 + Docker
- Database: Supabase PostgreSQL (Session Pooler URL, not Direct)
- Frontend: TBD
