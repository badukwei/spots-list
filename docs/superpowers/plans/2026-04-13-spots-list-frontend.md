# Spots List Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive React + Vite frontend with category listing, spot management, search, and modals.

**Architecture:** React SPA served by Nginx. All API calls use `/api/...` prefix — Vite proxies to `localhost:3001` in dev, Nginx proxies in production. NestJS routes are `/categories/...`, so proxy strips `/api` prefix.

**Tech Stack:** React 18, Vite, TypeScript, React Router v6, TanStack Query v5, axios, React Hook Form, Zod, Tailwind CSS v3, shadcn/ui, Vitest

---

## File Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.ts
├── postcss.config.js
├── components.json
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── lib/
    │   ├── api.ts
    │   └── utils.ts
    ├── types/
    │   └── index.ts
    ├── schemas/
    │   ├── category.ts
    │   └── spot.ts
    ├── hooks/
    │   ├── useCategories.ts
    │   └── useSpots.ts
    ├── components/
    │   ├── ui/              (shadcn auto-generated)
    │   ├── CategoryCard.tsx
    │   ├── CategoryListItem.tsx
    │   ├── SpotCard.tsx
    │   ├── SpotListItem.tsx
    │   ├── AddCategoryModal.tsx
    │   ├── AddSpotModal.tsx
    │   └── SpotDetailModal.tsx
    └── pages/
        ├── HomePage.tsx
        └── CategoryDetailPage.tsx
```

---

## Backend API Reference

All routes exist on the running NestJS backend. The frontend uses these:

```
GET    /categories          → { id, name, createdAt }[]
GET    /categories?q=text   → filtered list
GET    /categories/:id      → { id, name, createdAt }
POST   /categories          → body: { name }
GET    /categories/:id/spots → { id, categoryId, name, address, mapsUrl, notes, createdAt }[]
POST   /categories/:id/spots → body: { name, address?, mapsUrl?, notes? }
```

---

### Task 1: Scaffold Vite project

**Files:**
- Create: `frontend/` (entire directory)

- [ ] **Step 1: Run Vite scaffold from monorepo root**

```bash
cd /path/to/spots-list
npm create vite@latest frontend -- --template react-ts
cd frontend
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install react-router-dom @tanstack/react-query axios react-hook-form @hookform/resolvers zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 3: Replace `vite.config.ts` with proxy + test config**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 4: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Update `tsconfig.json` to add path alias**

Replace the `compilerOptions` section:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 6: Update `package.json` scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 7: Delete boilerplate files**

```bash
rm -rf src/assets src/App.css src/index.css public/vite.svg
```

- [ ] **Step 8: Run test to verify Vitest works**

```bash
npm test
```

Expected: 0 test files found, exits 0 (no failures).

- [ ] **Step 9: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold frontend with Vite, React, TypeScript, Vitest"
```

---

### Task 2: Tailwind CSS + shadcn/ui

**Files:**
- Modify: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.ts`, `frontend/postcss.config.js`, `frontend/components.json`, `frontend/src/index.css`

- [ ] **Step 1: Install Tailwind**

```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

- [ ] **Step 2: Replace `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 3: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

- [ ] **Step 4: Create `src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 5: Install clsx + tailwind-merge**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 6: Create `components.json` for shadcn/ui**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 7: Add shadcn/ui components**

```bash
npx shadcn@latest add button input dialog card badge
```

When prompted "Would you like to use React Server Components?" → No.

- [ ] **Step 8: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add frontend/
git commit -m "feat: add Tailwind CSS and shadcn/ui"
```

---

### Task 3: TypeScript types + API client

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/types/index.test.ts`

- [ ] **Step 1: Write the type test first**

Create `frontend/src/types/index.test.ts`:

```ts
import { describe, it, expectTypeOf } from 'vitest'
import type { Category, Spot } from './index'

describe('Category type', () => {
  it('has required fields', () => {
    expectTypeOf<Category>().toHaveProperty('id')
    expectTypeOf<Category>().toHaveProperty('name')
    expectTypeOf<Category>().toHaveProperty('createdAt')
  })
})

describe('Spot type', () => {
  it('has required and optional fields', () => {
    expectTypeOf<Spot>().toHaveProperty('id')
    expectTypeOf<Spot>().toHaveProperty('name')
    expectTypeOf<Spot>().toHaveProperty('categoryId')
    expectTypeOf<Spot['address']>().toEqualTypeOf<string | null>()
    expectTypeOf<Spot['mapsUrl']>().toEqualTypeOf<string | null>()
    expectTypeOf<Spot['notes']>().toEqualTypeOf<string | null>()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — cannot find module `./index`

- [ ] **Step 3: Create `src/types/index.ts`**

```ts
export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface Spot {
  id: string
  categoryId: string
  name: string
  address: string | null
  mapsUrl: string | null
  notes: string | null
  createdAt: string
}
```

- [ ] **Step 4: Create `src/lib/api.ts`**

```ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export default api
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types/ frontend/src/lib/api.ts
git commit -m "feat: add TypeScript types and axios API client"
```

---

### Task 4: Zod schemas

**Files:**
- Create: `frontend/src/schemas/category.ts`
- Create: `frontend/src/schemas/spot.ts`
- Create: `frontend/src/schemas/category.test.ts`
- Create: `frontend/src/schemas/spot.test.ts`

- [ ] **Step 1: Write category schema tests**

Create `frontend/src/schemas/category.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { categorySchema } from './category'

describe('categorySchema', () => {
  it('accepts valid name', () => {
    expect(categorySchema.safeParse({ name: '適合一個人哭的地方' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(categorySchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('rejects name over 100 chars', () => {
    expect(categorySchema.safeParse({ name: 'a'.repeat(101) }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Write spot schema tests**

Create `frontend/src/schemas/spot.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { spotSchema } from './spot'

describe('spotSchema', () => {
  it('accepts minimal valid spot', () => {
    expect(spotSchema.safeParse({ name: '台大圖書館廁所' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(spotSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('accepts valid mapsUrl with http', () => {
    expect(spotSchema.safeParse({ name: 'test', mapsUrl: 'https://maps.google.com/abc' }).success).toBe(true)
  })

  it('accepts mapsUrl without protocol', () => {
    expect(spotSchema.safeParse({ name: 'test', mapsUrl: 'maps.google.com/abc' }).success).toBe(true)
  })

  it('rejects notes over 500 chars', () => {
    expect(spotSchema.safeParse({ name: 'test', notes: 'a'.repeat(501) }).success).toBe(false)
  })

  it('accepts empty optional fields', () => {
    expect(spotSchema.safeParse({ name: 'test', address: '', notes: '', mapsUrl: '' }).success).toBe(true)
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — cannot find modules

- [ ] **Step 4: Create `src/schemas/category.ts`**

```ts
import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, '名稱不能為空').max(100, '名稱不能超過 100 字'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
```

- [ ] **Step 5: Create `src/schemas/spot.ts`**

```ts
import { z } from 'zod'

export const spotSchema = z.object({
  name: z.string().min(1, '名稱不能為空').max(100, '名稱不能超過 100 字'),
  address: z.string().max(200, '地址不能超過 200 字').optional().or(z.literal('')),
  mapsUrl: z
    .string()
    .max(500)
    .refine(
      (val) => val === '' || /^(https?:\/\/)?[\w\-.]+(\/.*)?$/.test(val),
      { message: '請輸入有效的網址' }
    )
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500, '備註不能超過 500 字').optional().or(z.literal('')),
})

export type SpotFormValues = z.infer<typeof spotSchema>
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test
```

Expected: All schema tests PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/schemas/
git commit -m "feat: add Zod validation schemas for category and spot forms"
```

---

### Task 5: TanStack Query setup + category hooks

**Files:**
- Create: `frontend/src/hooks/useCategories.ts`
- Modify: `frontend/src/main.tsx` (add QueryClientProvider — partial, full setup in Task 13)

- [ ] **Step 1: Create `src/hooks/useCategories.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Category } from '@/types'

export function useCategories(search?: string) {
  return useQuery({
    queryKey: ['categories', search ?? ''],
    queryFn: async () => {
      const params = search ? { q: search } : {}
      const { data } = await api.get<Category[]>('/categories', { params })
      return data
    },
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const { data } = await api.get<Category>(`/categories/${id}`)
      return data
    },
  })
}

export function useAddCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<Category>('/categories', { name })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -20
```

Expected: No TypeScript errors for the new files (build may fail on other missing files — that's OK at this stage, just check for type errors in useCategories.ts).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useCategories.ts
git commit -m "feat: add TanStack Query hooks for categories"
```

---

### Task 6: Spot hooks

**Files:**
- Create: `frontend/src/hooks/useSpots.ts`

- [ ] **Step 1: Create `src/hooks/useSpots.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Spot } from '@/types'
import type { SpotFormValues } from '@/schemas/spot'

export function useSpots(categoryId: string) {
  return useQuery({
    queryKey: ['spots', categoryId],
    queryFn: async () => {
      const { data } = await api.get<Spot[]>(`/categories/${categoryId}/spots`)
      return data
    },
  })
}

export function useAddSpot(categoryId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: SpotFormValues) => {
      const body = {
        name: values.name,
        ...(values.address ? { address: values.address } : {}),
        ...(values.mapsUrl ? { mapsUrl: values.mapsUrl } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
      }
      const { data } = await api.post<Spot>(`/categories/${categoryId}/spots`, body)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['spots', categoryId] })
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useSpots.ts
git commit -m "feat: add TanStack Query hooks for spots"
```

---

### Task 7: Category display components

**Files:**
- Create: `frontend/src/components/CategoryCard.tsx`
- Create: `frontend/src/components/CategoryListItem.tsx`

- [ ] **Step 1: Create `src/components/CategoryCard.tsx`**

Desktop card shown in grid layout.

```tsx
import type { Category } from '@/types'

interface Props {
  category: Category
  onClick: () => void
}

export function CategoryCard({ category, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="font-semibold text-sm leading-snug">{category.name}</p>
    </button>
  )
}
```

- [ ] **Step 2: Create `src/components/CategoryListItem.tsx`**

Mobile list row.

```tsx
import type { Category } from '@/types'
import { ChevronRight } from 'lucide-react'

interface Props {
  category: Category
  onClick: () => void
}

export function CategoryListItem({ category, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-sm font-medium">{category.name}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  )
}
```

- [ ] **Step 3: Install lucide-react**

```bash
npm install lucide-react
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/CategoryCard.tsx frontend/src/components/CategoryListItem.tsx
git commit -m "feat: add CategoryCard and CategoryListItem components"
```

---

### Task 8: Spot display components

**Files:**
- Create: `frontend/src/components/SpotCard.tsx`
- Create: `frontend/src/components/SpotListItem.tsx`

- [ ] **Step 1: Create `src/components/SpotCard.tsx`**

```tsx
import type { Spot } from '@/types'
import { MapPin, ExternalLink } from 'lucide-react'

interface Props {
  spot: Spot
  onClick: () => void
}

export function SpotCard({ spot, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="font-semibold text-sm">{spot.name}</p>
      {spot.address && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {spot.address}
        </p>
      )}
      {spot.mapsUrl && (
        <p className="mt-1 flex items-center gap-1 text-xs text-primary">
          <ExternalLink className="h-3 w-3 shrink-0" />
          地圖連結
        </p>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Create `src/components/SpotListItem.tsx`**

```tsx
import type { Spot } from '@/types'
import { MapPin, ChevronRight } from 'lucide-react'

interface Props {
  spot: Spot
  onClick: () => void
}

export function SpotListItem({ spot, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{spot.name}</p>
        {spot.address && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{spot.address}</span>
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
    </button>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/SpotCard.tsx frontend/src/components/SpotListItem.tsx
git commit -m "feat: add SpotCard and SpotListItem components"
```

---

### Task 9: AddCategoryModal

**Files:**
- Create: `frontend/src/components/AddCategoryModal.tsx`

- [ ] **Step 1: Create `src/components/AddCategoryModal.tsx`**

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryFormValues } from '@/schemas/category'
import { useAddCategory } from '@/hooks/useCategories'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onClose: () => void
}

export function AddCategoryModal({ open, onClose }: Props) {
  const addCategory = useAddCategory()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit = async (values: CategoryFormValues) => {
    await addCategory.mutateAsync(values.name)
    reset()
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) { reset(); onClose() }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新增分類</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="例如：適合一個人哭的地方"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          {addCategory.error && (
            <p className="text-xs text-destructive">新增失敗，請再試一次</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose() }} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '新增中...' : '新增'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/AddCategoryModal.tsx
git commit -m "feat: add AddCategoryModal component"
```

---

### Task 10: AddSpotModal + SpotDetailModal

**Files:**
- Create: `frontend/src/components/AddSpotModal.tsx`
- Create: `frontend/src/components/SpotDetailModal.tsx`

- [ ] **Step 1: Create `src/components/AddSpotModal.tsx`**

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { spotSchema, type SpotFormValues } from '@/schemas/spot'
import { useAddSpot } from '@/hooks/useSpots'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onClose: () => void
  categoryId: string
}

export function AddSpotModal({ open, onClose, categoryId }: Props) {
  const addSpot = useAddSpot(categoryId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
  })

  const onSubmit = async (values: SpotFormValues) => {
    await addSpot.mutateAsync(values)
    reset()
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) { reset(); onClose() }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新增景點</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Input placeholder="名稱*" {...register('name')} disabled={isSubmitting} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Input placeholder="地址（選填）" {...register('address')} disabled={isSubmitting} />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
          </div>
          <div>
            <Input placeholder="Google Maps 連結（選填）" {...register('mapsUrl')} disabled={isSubmitting} />
            {errors.mapsUrl && <p className="mt-1 text-xs text-destructive">{errors.mapsUrl.message}</p>}
          </div>
          <div>
            <Input placeholder="備註（選填）" {...register('notes')} disabled={isSubmitting} />
            {errors.notes && <p className="mt-1 text-xs text-destructive">{errors.notes.message}</p>}
          </div>
          {addSpot.error && <p className="text-xs text-destructive">新增失敗，請再試一次</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose() }} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '新增中...' : '新增'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create `src/components/SpotDetailModal.tsx`**

```tsx
import type { Spot } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  spot: Spot | null
  onClose: () => void
}

export function SpotDetailModal({ spot, onClose }: Props) {
  return (
    <Dialog open={spot !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{spot?.name}</DialogTitle>
        </DialogHeader>
        {spot && (
          <div className="space-y-3 text-sm">
            {spot.address && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">地址</p>
                <p className="mt-1">{spot.address}</p>
              </div>
            )}
            {spot.mapsUrl && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">地圖</p>
                <a
                  href={spot.mapsUrl.startsWith('http') ? spot.mapsUrl : `https://${spot.mapsUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-primary underline underline-offset-2 break-all"
                >
                  {spot.mapsUrl}
                </a>
              </div>
            )}
            {spot.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">備註</p>
                <p className="mt-1 whitespace-pre-wrap">{spot.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/AddSpotModal.tsx frontend/src/components/SpotDetailModal.tsx
git commit -m "feat: add AddSpotModal and SpotDetailModal components"
```

---

### Task 11: HomePage

**Files:**
- Create: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Create `src/pages/HomePage.tsx`**

```tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import { CategoryCard } from '@/components/CategoryCard'
import { CategoryListItem } from '@/components/CategoryListItem'
import { AddCategoryModal } from '@/components/AddCategoryModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'

export function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const { data: categories, isLoading, error } = useCategories(debouncedSearch || undefined)

  const handleCategoryClick = useCallback(
    (id: string) => navigate(`/categories/${id}`),
    [navigate]
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">Spots List</h1>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            + 新增分類
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Input
          placeholder="搜尋分類..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6"
        />

        {isLoading && (
          <p className="text-center text-sm text-muted-foreground">載入中...</p>
        )}

        {error && (
          <p className="text-center text-sm text-destructive">載入失敗，請重新整理</p>
        )}

        {categories && categories.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {search ? '找不到符合的分類' : '還沒有分類，來新增第一個吧！'}
          </p>
        )}

        {categories && categories.length > 0 && (
          <>
            {/* Desktop: grid */}
            <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onClick={() => handleCategoryClick(cat.id)}
                />
              ))}
            </div>
            {/* Mobile: list */}
            <div className="flex flex-col gap-2 md:hidden">
              {categories.map((cat) => (
                <CategoryListItem
                  key={cat.id}
                  category={cat}
                  onClick={() => handleCategoryClick(cat.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <AddCategoryModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
```

- [ ] **Step 2: Create `src/hooks/useDebounce.ts`**

```ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.tsx frontend/src/hooks/useDebounce.ts
git commit -m "feat: add HomePage with responsive category list and search"
```

---

### Task 12: CategoryDetailPage

**Files:**
- Create: `frontend/src/pages/CategoryDetailPage.tsx`

- [ ] **Step 1: Create `src/pages/CategoryDetailPage.tsx`**

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCategory } from '@/hooks/useCategories'
import { useSpots } from '@/hooks/useSpots'
import { SpotCard } from '@/components/SpotCard'
import { SpotListItem } from '@/components/SpotListItem'
import { AddSpotModal } from '@/components/AddSpotModal'
import { SpotDetailModal } from '@/components/SpotDetailModal'
import { Button } from '@/components/ui/button'
import type { Spot } from '@/types'
import { ArrowLeft } from 'lucide-react'

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)

  const { data: category, isLoading: catLoading, error: catError } = useCategory(id!)
  const { data: spots, isLoading: spotsLoading, error: spotsError } = useSpots(id!)

  useEffect(() => {
    if (catError) navigate('/', { replace: true })
  }, [catError, navigate])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            + 新增景點
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {catLoading ? (
          <div className="mb-6 h-7 w-48 animate-pulse rounded bg-muted" />
        ) : (
          <h2 className="mb-6 text-xl font-bold">{category?.name}</h2>
        )}

        {spotsLoading && (
          <p className="text-center text-sm text-muted-foreground">載入中...</p>
        )}

        {spotsError && (
          <p className="text-center text-sm text-destructive">載入失敗，請重新整理</p>
        )}

        {spots && spots.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            這個分類還沒有景點，來新增第一個吧！
          </p>
        )}

        {spots && spots.length > 0 && (
          <>
            {/* Desktop: grid */}
            <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
              {spots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} onClick={() => setSelectedSpot(spot)} />
              ))}
            </div>
            {/* Mobile: list */}
            <div className="flex flex-col gap-2 md:hidden">
              {spots.map((spot) => (
                <SpotListItem key={spot.id} spot={spot} onClick={() => setSelectedSpot(spot)} />
              ))}
            </div>
          </>
        )}
      </main>

      {id && (
        <AddSpotModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          categoryId={id}
        />
      )}

      <SpotDetailModal
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/CategoryDetailPage.tsx
git commit -m "feat: add CategoryDetailPage with spot list and modals"
```

---

### Task 13: App routing + providers + main.tsx

**Files:**
- Create: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/index.html`

- [ ] **Step 1: Create `src/App.tsx`**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { CategoryDetailPage } from '@/pages/CategoryDetailPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categories/:id" element={<CategoryDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 2: Create `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 3: Update `index.html` title**

```html
<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Spots List</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Run full build**

```bash
npm run build
```

Expected: Build succeeds, no TypeScript errors.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Start dev server and verify manually**

```bash
# Terminal 1 — backend
cd ../backend && npm run start:dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open http://localhost:5173. Verify:
- Homepage loads with category list (or empty state)
- Search bar filters categories
- "+ 新增分類" opens modal, form validates, submits, list refreshes
- Clicking a category navigates to detail page
- Detail page shows spots (or empty state)
- "+ 新增景點" opens modal, form validates, submits, list refreshes
- Clicking a spot opens detail modal

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.tsx frontend/src/main.tsx frontend/index.html
git commit -m "feat: wire up React Router, QueryClient, and app entry point"
```

- [ ] **Step 8: Update ARCHITECTURE.md and PROGRESS.md**

Add to `ARCHITECTURE.md` under Frontend section:

```
## Frontend (frontend/)

frontend/src/
├── App.tsx              # Route definitions
├── main.tsx             # Entry point, QueryClient + BrowserRouter providers
├── lib/
│   ├── api.ts           # axios instance (baseURL: /api)
│   └── utils.ts         # cn() for shadcn
├── types/index.ts       # Category, Spot interfaces
├── schemas/             # Zod validation schemas
├── hooks/               # TanStack Query hooks
├── components/          # UI components + shadcn/ui
└── pages/               # HomePage, CategoryDetailPage
```

Mark Phase 1 complete in `PROGRESS.md`.

```bash
git add .claude/
git commit -m "docs: update architecture and progress for frontend phase"
```
