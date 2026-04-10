# Spots List Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a NestJS REST API for the Spots List app with full CRUD for categories and spots, using Drizzle ORM and PostgreSQL (Supabase).

**Architecture:** Two NestJS modules (categories, spots) share a global DB module that provides a Drizzle client. All endpoints are public — no authentication. CORS enabled for frontend access.

**Tech Stack:** NestJS, Drizzle ORM, postgres (postgres-js), class-validator, @nestjs/mapped-types, dotenv

---

## File Map

```
backend/
  src/
    db/
      db.module.ts               → Global Drizzle client provider
      schema.ts                  → Table definitions (categories, spots)
    categories/
      categories.module.ts
      categories.controller.ts   → HTTP handlers for /categories
      categories.controller.spec.ts
      categories.service.ts      → DB queries for categories
      categories.service.spec.ts
      dto/
        create-category.dto.ts
        update-category.dto.ts
    spots/
      spots.module.ts
      spots.controller.ts        → HTTP handlers for /categories/:id/spots and /spots/:id
      spots.controller.spec.ts
      spots.service.ts           → DB queries for spots
      spots.service.spec.ts
      dto/
        create-spot.dto.ts
        update-spot.dto.ts
    app.module.ts
    main.ts
  drizzle.config.ts
  .env                           → (gitignored)
  .env.example
  Dockerfile
```

---

## Task 1: Project Setup

**Files:**
- Create: `backend/` (via nest CLI)
- Modify: `backend/src/app.module.ts`
- Create: `backend/.env`, `backend/.env.example`

- [ ] **Step 1: Scaffold NestJS project**

```bash
cd /Users/linwgpeter/dev/side-projects/spots-list
npx @nestjs/cli new backend --package-manager npm --skip-git
cd backend
```

Expected: project created with `src/app.module.ts`, `src/main.ts`, etc.

- [ ] **Step 2: Install dependencies**

```bash
npm install drizzle-orm postgres dotenv class-validator class-transformer @nestjs/mapped-types
npm install -D drizzle-kit
```

- [ ] **Step 3: Create .env**

```bash
# backend/.env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
PORT=3001
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 4: Create .env.example**

```
DATABASE_URL=postgresql://postgres:password@db.yourproject.supabase.co:5432/postgres
PORT=3001
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 5: Add .env to .gitignore**

Open `backend/.gitignore` and verify `.env` is listed. If not, add it:

```
.env
```

- [ ] **Step 6: Delete boilerplate files**

```bash
rm src/app.controller.ts src/app.controller.spec.ts src/app.service.ts
```

- [ ] **Step 7: Update app.module.ts**

```ts
// src/app.module.ts
import { Module } from '@nestjs/common'

@Module({
  imports: [],
})
export class AppModule {}
```

- [ ] **Step 8: Verify app starts**

```bash
npm run start:dev
```

Expected: `Application is running on: http://[::1]:3000` (no errors)

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: scaffold NestJS backend"
```

---

## Task 2: DB Schema + Drizzle Setup

**Files:**
- Create: `backend/src/db/schema.ts`
- Create: `backend/src/db/db.module.ts`
- Create: `backend/drizzle.config.ts`

- [ ] **Step 1: Create schema**

```ts
// src/db/schema.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const spots = pgTable('spots', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  address: text('address'),
  mapsUrl: text('maps_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})
```

- [ ] **Step 2: Create DB module**

```ts
// src/db/db.module.ts
import { Global, Module } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import 'dotenv/config'

export const DATABASE = 'DATABASE'
export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => {
        const client = postgres(process.env.DATABASE_URL!)
        return drizzle(client, { schema })
      },
    },
  ],
  exports: [DATABASE],
})
export class DbModule {}
```

- [ ] **Step 3: Register DbModule in AppModule**

```ts
// src/app.module.ts
import { Module } from '@nestjs/common'
import { DbModule } from './db/db.module'

@Module({
  imports: [DbModule],
})
export class AppModule {}
```

- [ ] **Step 4: Create drizzle.config.ts**

```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'
import 'dotenv/config'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

- [ ] **Step 5: Push schema to Supabase**

```bash
npx drizzle-kit push
```

Expected output includes:
```
[✓] Changes applied
```

Go to Supabase dashboard → Table Editor to verify `categories` and `spots` tables exist.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add drizzle schema and db module"
```

---

## Task 3: Categories — Read Endpoints

**Files:**
- Create: `backend/src/categories/dto/create-category.dto.ts`
- Create: `backend/src/categories/dto/update-category.dto.ts`
- Create: `backend/src/categories/categories.service.ts`
- Create: `backend/src/categories/categories.service.spec.ts`
- Create: `backend/src/categories/categories.controller.ts`
- Create: `backend/src/categories/categories.controller.spec.ts`
- Create: `backend/src/categories/categories.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

```ts
// src/categories/dto/create-category.dto.ts
import { IsString, IsNotEmpty } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string
}
```

```ts
// src/categories/dto/update-category.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateCategoryDto } from './create-category.dto'

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
```

- [ ] **Step 2: Write failing service test**

```ts
// src/categories/categories.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from './categories.service'
import { DATABASE } from '../db/db.module'
import { NotFoundException } from '@nestjs/common'

describe('CategoriesService', () => {
  let service: CategoriesService
  let mockDb: any

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockResolvedValue([]),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: DATABASE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<CategoriesService>(CategoriesService)
  })

  it('findAll returns empty array when no categories', async () => {
    mockDb.orderBy.mockResolvedValue([])
    const result = await service.findAll()
    expect(result).toEqual([])
  })

  it('findOne throws NotFoundException when not found', async () => {
    mockDb.where.mockResolvedValue([])
    await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- --testPathPattern=categories.service
```

Expected: FAIL — `CategoriesService` not found.

- [ ] **Step 4: Implement service**

```ts
// src/categories/categories.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { eq, ilike } from 'drizzle-orm'
import { DATABASE, DrizzleDB } from '../db/db.module'
import { categories } from '../db/schema'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoriesService {
  constructor(@Inject(DATABASE) private db: DrizzleDB) {}

  async findAll(q?: string) {
    if (q) {
      return this.db
        .select()
        .from(categories)
        .where(ilike(categories.name, `%${q}%`))
        .orderBy(categories.createdAt)
    }
    return this.db.select().from(categories).orderBy(categories.createdAt)
  }

  async findOne(id: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
    if (!category) throw new NotFoundException(`Category ${id} not found`)
    return category
  }

  async create(dto: CreateCategoryDto) {
    const [category] = await this.db
      .insert(categories)
      .values(dto)
      .returning()
    return category
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const [category] = await this.db
      .update(categories)
      .set(dto)
      .where(eq(categories.id, id))
      .returning()
    if (!category) throw new NotFoundException(`Category ${id} not found`)
    return category
  }

  async remove(id: string) {
    const [category] = await this.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning()
    if (!category) throw new NotFoundException(`Category ${id} not found`)
    return category
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- --testPathPattern=categories.service
```

Expected: PASS (2 tests)

- [ ] **Step 6: Write failing controller test**

```ts
// src/categories/categories.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'

describe('CategoriesController', () => {
  let controller: CategoriesController

  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'uuid-1', name: 'Test', createdAt: new Date() }),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile()

    controller = module.get<CategoriesController>(CategoriesController)
  })

  it('findAll calls service.findAll without query', async () => {
    await controller.findAll(undefined)
    expect(mockService.findAll).toHaveBeenCalledWith(undefined)
  })

  it('findOne calls service.findOne with id', async () => {
    await controller.findOne('uuid-1')
    expect(mockService.findOne).toHaveBeenCalledWith('uuid-1')
  })
})
```

- [ ] **Step 7: Run test to verify it fails**

```bash
npm test -- --testPathPattern=categories.controller
```

Expected: FAIL — `CategoriesController` not found.

- [ ] **Step 8: Implement controller**

```ts
// src/categories/categories.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.categoriesService.findAll(q)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id)
  }
}
```

- [ ] **Step 9: Create module**

```ts
// src/categories/categories.module.ts
import { Module } from '@nestjs/common'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
```

- [ ] **Step 10: Register in AppModule**

```ts
// src/app.module.ts
import { Module } from '@nestjs/common'
import { DbModule } from './db/db.module'
import { CategoriesModule } from './categories/categories.module'

@Module({
  imports: [DbModule, CategoriesModule],
})
export class AppModule {}
```

- [ ] **Step 11: Run all tests**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: add categories module with CRUD"
```

---

## Task 4: Spots Module

**Files:**
- Create: `backend/src/spots/dto/create-spot.dto.ts`
- Create: `backend/src/spots/dto/update-spot.dto.ts`
- Create: `backend/src/spots/spots.service.ts`
- Create: `backend/src/spots/spots.service.spec.ts`
- Create: `backend/src/spots/spots.controller.ts`
- Create: `backend/src/spots/spots.controller.spec.ts`
- Create: `backend/src/spots/spots.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

```ts
// src/spots/dto/create-spot.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator'

export class CreateSpotDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  address?: string

  @IsUrl()
  @IsOptional()
  mapsUrl?: string

  @IsString()
  @IsOptional()
  notes?: string
}
```

```ts
// src/spots/dto/update-spot.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateSpotDto } from './create-spot.dto'

export class UpdateSpotDto extends PartialType(CreateSpotDto) {}
```

- [ ] **Step 2: Write failing service test**

```ts
// src/spots/spots.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { SpotsService } from './spots.service'
import { DATABASE } from '../db/db.module'
import { NotFoundException } from '@nestjs/common'

describe('SpotsService', () => {
  let service: SpotsService
  let mockDb: any

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]),
      orderBy: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotsService,
        { provide: DATABASE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<SpotsService>(SpotsService)
  })

  it('findByCategory returns empty array when no spots', async () => {
    mockDb.where.mockResolvedValue([])
    const result = await service.findByCategory('category-id')
    expect(result).toEqual([])
  })

  it('remove throws NotFoundException when spot not found', async () => {
    mockDb.returning.mockResolvedValue([])
    await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- --testPathPattern=spots.service
```

Expected: FAIL — `SpotsService` not found.

- [ ] **Step 4: Implement service**

```ts
// src/spots/spots.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE, DrizzleDB } from '../db/db.module'
import { spots } from '../db/schema'
import { CreateSpotDto } from './dto/create-spot.dto'
import { UpdateSpotDto } from './dto/update-spot.dto'

@Injectable()
export class SpotsService {
  constructor(@Inject(DATABASE) private db: DrizzleDB) {}

  async findByCategory(categoryId: string) {
    return this.db
      .select()
      .from(spots)
      .where(eq(spots.categoryId, categoryId))
      .orderBy(spots.createdAt)
  }

  async create(categoryId: string, dto: CreateSpotDto) {
    const [spot] = await this.db
      .insert(spots)
      .values({ ...dto, categoryId })
      .returning()
    return spot
  }

  async update(id: string, dto: UpdateSpotDto) {
    const [spot] = await this.db
      .update(spots)
      .set(dto)
      .where(eq(spots.id, id))
      .returning()
    if (!spot) throw new NotFoundException(`Spot ${id} not found`)
    return spot
  }

  async remove(id: string) {
    const [spot] = await this.db
      .delete(spots)
      .where(eq(spots.id, id))
      .returning()
    if (!spot) throw new NotFoundException(`Spot ${id} not found`)
    return spot
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- --testPathPattern=spots.service
```

Expected: PASS (2 tests)

- [ ] **Step 6: Write failing controller test**

```ts
// src/spots/spots.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { SpotsController } from './spots.controller'
import { SpotsService } from './spots.service'

describe('SpotsController', () => {
  let controller: SpotsController

  const mockService = {
    findByCategory: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'spot-1', name: 'Spot', categoryId: 'cat-1' }),
    update: jest.fn().mockResolvedValue({ id: 'spot-1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: 'spot-1' }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpotsController],
      providers: [{ provide: SpotsService, useValue: mockService }],
    }).compile()

    controller = module.get<SpotsController>(SpotsController)
  })

  it('findByCategory calls service with categoryId', async () => {
    await controller.findByCategory('cat-1')
    expect(mockService.findByCategory).toHaveBeenCalledWith('cat-1')
  })

  it('create calls service with categoryId and dto', async () => {
    const dto = { name: 'New Spot' }
    await controller.create('cat-1', dto as any)
    expect(mockService.create).toHaveBeenCalledWith('cat-1', dto)
  })
})
```

- [ ] **Step 7: Run test to verify it fails**

```bash
npm test -- --testPathPattern=spots.controller
```

Expected: FAIL — `SpotsController` not found.

- [ ] **Step 8: Implement controller**

```ts
// src/spots/spots.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common'
import { SpotsService } from './spots.service'
import { CreateSpotDto } from './dto/create-spot.dto'
import { UpdateSpotDto } from './dto/update-spot.dto'

@Controller()
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get('categories/:categoryId/spots')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.spotsService.findByCategory(categoryId)
  }

  @Post('categories/:categoryId/spots')
  create(
    @Param('categoryId') categoryId: string,
    @Body() dto: CreateSpotDto,
  ) {
    return this.spotsService.create(categoryId, dto)
  }

  @Patch('spots/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSpotDto) {
    return this.spotsService.update(id, dto)
  }

  @Delete('spots/:id')
  remove(@Param('id') id: string) {
    return this.spotsService.remove(id)
  }
}
```

- [ ] **Step 9: Create module**

```ts
// src/spots/spots.module.ts
import { Module } from '@nestjs/common'
import { SpotsController } from './spots.controller'
import { SpotsService } from './spots.service'

@Module({
  controllers: [SpotsController],
  providers: [SpotsService],
})
export class SpotsModule {}
```

- [ ] **Step 10: Register in AppModule**

```ts
// src/app.module.ts
import { Module } from '@nestjs/common'
import { DbModule } from './db/db.module'
import { CategoriesModule } from './categories/categories.module'
import { SpotsModule } from './spots/spots.module'

@Module({
  imports: [DbModule, CategoriesModule, SpotsModule],
})
export class AppModule {}
```

- [ ] **Step 11: Run all tests**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: add spots module with CRUD"
```

---

## Task 5: main.ts — CORS + Validation + Port

**Files:**
- Modify: `backend/src/main.ts`

- [ ] **Step 1: Update main.ts**

```ts
// src/main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import 'dotenv/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.listen(process.env.PORT ?? 3001)
  console.log(`Backend running on port ${process.env.PORT ?? 3001}`)
}
bootstrap()
```

- [ ] **Step 2: Smoke test all endpoints**

```bash
npm run start:dev
```

In another terminal:

```bash
# Create a category
curl -X POST http://localhost:3001/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "適合一個人哭的地方"}'

# List categories
curl http://localhost:3001/categories

# Search categories
curl "http://localhost:3001/categories?q=哭"

# Create a spot (replace CATEGORY_ID with the id from the create response)
curl -X POST http://localhost:3001/categories/CATEGORY_ID/spots \
  -H "Content-Type: application/json" \
  -d '{"name": "信義公園", "address": "台北市信義區", "mapsUrl": "https://maps.google.com/?q=信義公園"}'

# List spots
curl http://localhost:3001/categories/CATEGORY_ID/spots
```

Expected: all return valid JSON.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add CORS, validation pipe, and port config"
```

---

## Task 6: Dockerfile

**Files:**
- Create: `backend/Dockerfile`
- Create: `backend/.dockerignore`

- [ ] **Step 1: Create .dockerignore**

```
node_modules
dist
.env
drizzle
```

- [ ] **Step 2: Create Dockerfile**

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

- [ ] **Step 3: Build and verify**

```bash
docker build -t spots-backend .
docker run -p 3001:3001 \
  -e DATABASE_URL="your_supabase_url" \
  -e FRONTEND_URL="http://localhost:5173" \
  spots-backend
```

Expected: `Backend running on port 3001`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add Dockerfile for backend"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] GET /categories — Task 3
- [x] GET /categories?q= — Task 3 (ilike search)
- [x] GET /categories/:id — Task 3
- [x] POST /categories — Task 3
- [x] PATCH /categories/:id — Task 3
- [x] DELETE /categories/:id — Task 3
- [x] GET /categories/:id/spots — Task 4
- [x] POST /categories/:id/spots — Task 4
- [x] PATCH /spots/:id — Task 4
- [x] DELETE /spots/:id — Task 4
- [x] CORS — Task 5
- [x] Validation — Task 5
- [x] Dockerfile — Task 6
- [x] DB schema matches spec — Task 2

**No placeholders:** confirmed — all steps have actual code.

**Type consistency:**
- `DrizzleDB` defined in `db.module.ts`, used in both services ✓
- `CreateCategoryDto` / `UpdateCategoryDto` consistent between service and controller ✓
- `CreateSpotDto` / `UpdateSpotDto` consistent between service and controller ✓
- `categoryId` field name consistent across schema, service, controller ✓
