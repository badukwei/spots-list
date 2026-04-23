# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the frontend UI from a dark "深夜地下誌" theme to a light, bright, Instagram-inspired design with the app renamed to 地點找找看.

**Architecture:** Replace CSS variables and fonts in `index.css` + `tailwind.config.ts`, rewrite all page and component files in-place (no new routes), add a small `src/lib/emoji.ts` utility for auto-assigned emoji/colors. No backend changes in this phase — emoji auto-assigned from index until Phase 2.2 schema migration.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, shadcn/ui (Dialog/Button/Input via CSS vars), TanStack Query, React Router v6, Google Fonts (Plus Jakarta Sans + Noto Sans TC)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/index.css` | Modify | Light CSS vars + new Google Fonts import |
| `frontend/tailwind.config.ts` | Modify | Update font families, remove darkMode |
| `frontend/src/lib/emoji.ts` | Create | `getAutoEmoji`, `getCategoryColor`, `getSpotGradient` |
| `frontend/src/components/CategoryCard.tsx` | Rewrite | Desktop grid card: emoji circle + name |
| `frontend/src/components/CategoryListItem.tsx` | Rewrite | Desktop sidebar item: emoji + name + active state |
| `frontend/src/components/SpotCard.tsx` | Rewrite | Gradient thumbnail + name + address + notes + maps link |
| `frontend/src/components/SpotListItem.tsx` | Rewrite | Mobile list row: thumbnail + name + address + chevron |
| `frontend/src/pages/HomePage.tsx` | Rewrite | Desktop: header+grid / Mobile: header+stories+search+grid |
| `frontend/src/pages/CategoryDetailPage.tsx` | Rewrite | Desktop: sidebar+3-col grid / Mobile: header+list |
| `frontend/src/components/AddCategoryModal.tsx` | Modify | Remove `font-display italic`, update text classes |
| `frontend/src/components/AddSpotModal.tsx` | Modify | Remove `font-display italic`, update text classes |
| `frontend/src/components/SpotDetailModal.tsx` | Modify | Remove `font-display italic`, update text classes |

shadcn/ui primitives (`button.tsx`, `input.tsx`, `dialog.tsx`) use CSS vars exclusively — they update automatically when `index.css` changes. No edits needed.

---

### Task 1: Design tokens + fonts

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/tailwind.config.ts`

- [ ] **Step 1: Replace index.css**

```css
/* frontend/src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+TC:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --primary: 16 100% 60%;
    --primary-foreground: 0 0% 100%;
    --muted: 240 5% 96%;
    --muted-foreground: 240 4% 53%;
    --border: 0 0% 94%;
    --input: 240 5% 96%;
    --ring: 16 100% 60%;
    --radius: 0.75rem;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 100%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --secondary: 240 5% 96%;
    --secondary-foreground: 0 0% 10%;
    --accent: 16 100% 97%;
    --accent-foreground: 16 100% 45%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 10%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', sans-serif;
  }
}

@layer utilities {
  .animate-fade-up {
    animation: fade-up 0.3s ease forwards;
  }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Replace tailwind.config.ts**

```ts
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
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
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans TC', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/index.css frontend/tailwind.config.ts
git commit -m "feat: replace dark theme with light design tokens and new fonts"
```

---

### Task 2: Emoji/color utility

**Files:**
- Create: `frontend/src/lib/emoji.ts`
- Create: `frontend/src/lib/emoji.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// frontend/src/lib/emoji.test.ts
import { describe, it, expect } from 'vitest'
import { getAutoEmoji, getCategoryColor, getSpotGradient } from './emoji'

describe('getAutoEmoji', () => {
  it('returns emoji string for index 0', () => {
    expect(typeof getAutoEmoji(0)).toBe('string')
    expect(getAutoEmoji(0).length).toBeGreaterThan(0)
  })
  it('wraps around after palette length', () => {
    expect(getAutoEmoji(0)).toBe(getAutoEmoji(10))
  })
})

describe('getCategoryColor', () => {
  it('returns bg and text strings', () => {
    const c = getCategoryColor(0)
    expect(c).toHaveProperty('bg')
    expect(c).toHaveProperty('text')
  })
  it('wraps around after palette length', () => {
    const a = getCategoryColor(0)
    const b = getCategoryColor(6)
    expect(a).toEqual(b)
  })
})

describe('getSpotGradient', () => {
  it('returns a CSS gradient string', () => {
    expect(getSpotGradient(0)).toMatch(/gradient/)
  })
  it('wraps around after palette length', () => {
    expect(getSpotGradient(0)).toBe(getSpotGradient(6))
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd frontend && npm test -- --testPathPatterns=emoji
```

Expected: FAIL — cannot find module `./emoji`

- [ ] **Step 3: Implement emoji.ts**

```ts
// frontend/src/lib/emoji.ts

const EMOJIS = ['📍', '☕', '🍜', '🛍️', '🎵', '📚', '🍸', '🏙️', '🌿', '✨']

const CATEGORY_COLORS: { bg: string; text: string }[] = [
  { bg: '#fff0e8', text: '#ff6b35' },
  { bg: '#e8f0ff', text: '#4f7cff' },
  { bg: '#e8fff0', text: '#2db87c' },
  { bg: '#f4e8ff', text: '#9b59d4' },
  { bg: '#fff8e8', text: '#e08c35' },
  { bg: '#e8fffd', text: '#35b8c7' },
]

const SPOT_GRADIENTS: string[] = [
  'linear-gradient(135deg, #ffe4d4, #ffd0b8)',
  'linear-gradient(135deg, #d4eeff, #b8daff)',
  'linear-gradient(135deg, #d4ffda, #b8f0bf)',
  'linear-gradient(135deg, #ffecd4, #ffd4b8)',
  'linear-gradient(135deg, #f4d4ff, #e8b8ff)',
  'linear-gradient(135deg, #fffbd4, #fff0b8)',
]

export function getAutoEmoji(index: number): string {
  return EMOJIS[index % EMOJIS.length]
}

export function getCategoryColor(index: number): { bg: string; text: string } {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

export function getSpotGradient(index: number): string {
  return SPOT_GRADIENTS[index % SPOT_GRADIENTS.length]
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd frontend && npm test -- --testPathPatterns=emoji
```

Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/emoji.ts frontend/src/lib/emoji.test.ts
git commit -m "feat: add emoji/color auto-assign utility for categories and spots"
```

---

### Task 3: CategoryCard

**Files:**
- Modify: `frontend/src/components/CategoryCard.tsx`

Used in: desktop grid on `HomePage` and mobile 2-col grid.

- [ ] **Step 1: Rewrite CategoryCard.tsx**

```tsx
// frontend/src/components/CategoryCard.tsx
import type { Category } from '@/types'
import { getAutoEmoji, getCategoryColor } from '@/lib/emoji'

interface Props {
  category: Category
  index: number
  onClick: () => void
}

export function CategoryCard({ category, index, onClick }: Props) {
  const color = getCategoryColor(index)
  const emoji = getAutoEmoji(index)

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-border bg-card p-4 hover:border-gray-200 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl"
        style={{ background: color.bg }}
      >
        {emoji}
      </div>
      <p className="font-semibold text-sm text-foreground leading-snug group-hover:text-primary transition-colors duration-200">
        {category.name}
      </p>
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/CategoryCard.tsx
git commit -m "feat: rewrite CategoryCard for light theme with emoji avatar"
```

---

### Task 4: CategoryListItem (sidebar item)

**Files:**
- Modify: `frontend/src/components/CategoryListItem.tsx`

Used in: desktop sidebar on `CategoryDetailPage`.

- [ ] **Step 1: Rewrite CategoryListItem.tsx**

```tsx
// frontend/src/components/CategoryListItem.tsx
import type { Category } from '@/types'
import { getAutoEmoji, getCategoryColor } from '@/lib/emoji'

interface Props {
  category: Category
  index: number
  isActive: boolean
  onClick: () => void
}

export function CategoryListItem({ category, index, isActive, onClick }: Props) {
  const color = getCategoryColor(index)
  const emoji = getAutoEmoji(index)

  return (
    <button
      onClick={onClick}
      className={[
        'group relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive ? 'bg-accent' : 'hover:bg-muted',
      ].join(' ')}
    >
      {isActive && (
        <span className="absolute left-0 top-0 h-full w-0.5 rounded-r bg-primary" />
      )}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
        style={{ background: color.bg }}
      >
        {emoji}
      </div>
      <span
        className={[
          'truncate text-sm font-medium',
          isActive ? 'text-primary' : 'text-foreground group-hover:text-foreground',
        ].join(' ')}
      >
        {category.name}
      </span>
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/CategoryListItem.tsx
git commit -m "feat: rewrite CategoryListItem as sidebar item with active state"
```

---

### Task 5: SpotCard

**Files:**
- Modify: `frontend/src/components/SpotCard.tsx`

Used in: desktop 3-col grid on `CategoryDetailPage`.

- [ ] **Step 1: Rewrite SpotCard.tsx**

```tsx
// frontend/src/components/SpotCard.tsx
import type { Spot } from '@/types'
import { getSpotGradient } from '@/lib/emoji'

interface Props {
  spot: Spot
  index: number
  onClick: () => void
}

export function SpotCard({ spot, index, onClick }: Props) {
  const gradient = getSpotGradient(index)

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-border bg-card p-4 hover:border-gray-200 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div
          className="h-10 w-10 shrink-0 rounded-xl"
          style={{ background: gradient }}
        />
        {spot.mapsUrl && (
          <a
            href={spot.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            地圖 ↗
          </a>
        )}
      </div>
      <p className="font-semibold text-sm text-foreground leading-snug group-hover:text-primary transition-colors duration-200">
        {spot.name}
      </p>
      {spot.address && (
        <p className="mt-1 text-xs text-muted-foreground truncate">
          📍 {spot.address}
        </p>
      )}
      {spot.notes && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground border-t border-border pt-2 leading-relaxed">
          {spot.notes}
        </p>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/SpotCard.tsx
git commit -m "feat: rewrite SpotCard with gradient thumbnail and content density"
```

---

### Task 6: SpotListItem

**Files:**
- Modify: `frontend/src/components/SpotListItem.tsx`

Used in: mobile list on `CategoryDetailPage`.

- [ ] **Step 1: Rewrite SpotListItem.tsx**

```tsx
// frontend/src/components/SpotListItem.tsx
import { ChevronRight } from 'lucide-react'
import type { Spot } from '@/types'
import { getSpotGradient } from '@/lib/emoji'

interface Props {
  spot: Spot
  index: number
  onClick: () => void
}

export function SpotListItem({ spot, index, onClick }: Props) {
  const gradient = getSpotGradient(index)

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 border-b border-border bg-background px-4 py-3 text-left last:border-b-0 hover:bg-muted/50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className="h-11 w-11 shrink-0 rounded-xl"
        style={{ background: gradient }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
          {spot.name}
        </p>
        {spot.address && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            📍 {spot.address}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors duration-150" />
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/SpotListItem.tsx
git commit -m "feat: rewrite SpotListItem with gradient thumbnail for mobile list"
```

---

### Task 7: HomePage

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`

Desktop (md+): sticky header (wordmark + search pill + add button) + 3-col category grid.
Mobile: sticky header + horizontal stories row + search bar + 2-col category grid.

- [ ] **Step 1: Rewrite HomePage.tsx**

```tsx
// frontend/src/pages/HomePage.tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import { CategoryCard } from '@/components/CategoryCard'
import { AddCategoryModal } from '@/components/AddCategoryModal'
import { useDebounce } from '@/hooks/useDebounce'
import { getAutoEmoji, getCategoryColor } from '@/lib/emoji'
import type { Category } from '@/types'

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
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            地點<span className="text-primary">找找</span>看
          </h1>
          {/* Desktop: search pill */}
          <div className="hidden md:flex flex-1 max-w-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 搜尋分類…"
              className="w-full rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/80 transition-colors"
          >
            ＋ 新增分類
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">
        {/* Mobile: stories row */}
        {categories && categories.length > 0 && (
          <div className="mb-4 -mx-4 md:hidden">
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none">
              <button
                onClick={() => setAddOpen(true)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border text-2xl text-muted-foreground">
                  ＋
                </div>
                <span className="w-14 text-center text-[10px] text-muted-foreground leading-tight">新增分類</span>
              </button>
              {categories.map((cat, i) => {
                const color = getCategoryColor(i)
                const emoji = getAutoEmoji(i)
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0"
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl"
                      style={{ borderColor: color.text, background: color.bg }}
                    >
                      {emoji}
                    </div>
                    <span className="w-14 text-center text-[10px] text-foreground leading-tight line-clamp-2">
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Mobile: search bar */}
        <div className="mb-4 md:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋分類…"
            className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* States */}
        {isLoading && (
          <p className="py-12 text-center text-sm text-muted-foreground">載入中…</p>
        )}
        {error && (
          <p className="py-12 text-center text-sm text-destructive">載入失敗，請重新整理</p>
        )}
        {categories && categories.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {search ? '找不到符合的分類' : '還沒有分類，來新增第一個吧！'}
          </p>
        )}

        {/* Category grid */}
        {categories && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {categories.map((cat, i) => (
              <div key={cat.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <CategoryCard
                  category={cat}
                  index={i}
                  onClick={() => handleCategoryClick(cat.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <AddCategoryModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "feat: rewrite HomePage with stories row (mobile) and category grid"
```

---

### Task 8: CategoryDetailPage

**Files:**
- Modify: `frontend/src/pages/CategoryDetailPage.tsx`

Desktop (md+): sticky header + left sidebar (all categories) + 3-col spot card grid.
Mobile: sticky header + spot list (SpotListItem).

- [ ] **Step 1: Rewrite CategoryDetailPage.tsx**

```tsx
// frontend/src/pages/CategoryDetailPage.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCategories, useCategory } from '@/hooks/useCategories'
import { useSpots } from '@/hooks/useSpots'
import { CategoryListItem } from '@/components/CategoryListItem'
import { SpotCard } from '@/components/SpotCard'
import { SpotListItem } from '@/components/SpotListItem'
import { AddSpotModal } from '@/components/AddSpotModal'
import { SpotDetailModal } from '@/components/SpotDetailModal'
import type { Spot } from '@/types'

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)

  const { data: allCategories } = useCategories()
  const { data: category, isLoading: catLoading, error: catError } = useCategory(id)
  const { data: spots, isLoading: spotsLoading, error: spotsError } = useSpots(id)

  useEffect(() => {
    if (catError) navigate('/', { replace: true })
  }, [catError, navigate])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">地點找找看</span>
          </button>
          {catLoading ? (
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          ) : (
            <h1 className="text-sm font-bold text-foreground md:hidden">
              {category?.name}
            </h1>
          )}
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            ＋ 新增地點
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border py-4">
          <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            分類
          </p>
          {allCategories?.map((cat, i) => (
            <CategoryListItem
              key={cat.id}
              category={cat}
              index={i}
              isActive={cat.id === id}
              onClick={() => navigate(`/categories/${cat.id}`)}
            />
          ))}
          <div className="mt-2 px-3">
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              管理分類
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-5 md:px-6">
          {/* Desktop title + add button */}
          <div className="mb-5 hidden items-start justify-between md:flex">
            {catLoading ? (
              <div className="h-7 w-48 animate-pulse rounded bg-muted" />
            ) : (
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {category?.name}
                </h1>
                {spots && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {spots.length} 個地點
                  </p>
                )}
              </div>
            )}
          </div>

          {spotsLoading && (
            <p className="py-12 text-center text-sm text-muted-foreground">載入中…</p>
          )}
          {spotsError && (
            <p className="py-12 text-center text-sm text-destructive">載入失敗，請重新整理</p>
          )}
          {spots && spots.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              這個分類還沒有地點，來新增第一個吧！
            </p>
          )}

          {spots && spots.length > 0 && (
            <>
              {/* Desktop: 3-col grid */}
              <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                {spots.map((spot, i) => (
                  <div key={spot.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <SpotCard spot={spot} index={i} onClick={() => setSelectedSpot(spot)} />
                  </div>
                ))}
              </div>
              {/* Mobile: list */}
              <div className="md:hidden -mx-4 border-t border-border">
                {spots.map((spot, i) => (
                  <div key={spot.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <SpotListItem spot={spot} index={i} onClick={() => setSelectedSpot(spot)} />
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {id && (
        <AddSpotModal open={addOpen} onClose={() => setAddOpen(false)} categoryId={id} />
      )}
      <SpotDetailModal spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/CategoryDetailPage.tsx
git commit -m "feat: rewrite CategoryDetailPage with desktop sidebar and spot grid"
```

---

### Task 9: Modal cleanup

**Files:**
- Modify: `frontend/src/components/AddCategoryModal.tsx`
- Modify: `frontend/src/components/AddSpotModal.tsx`
- Modify: `frontend/src/components/SpotDetailModal.tsx`

Remove `font-display italic` class and `font-display italic` from DialogTitle. The modals inherit light theme from CSS vars automatically — only class cleanup needed.

- [ ] **Step 1: Update AddCategoryModal.tsx**

Change line:
```tsx
<DialogTitle className="font-display italic text-lg">新增分類</DialogTitle>
```
To:
```tsx
<DialogTitle className="text-base font-bold">新增分類</DialogTitle>
```

- [ ] **Step 2: Update AddSpotModal.tsx**

Change line:
```tsx
<DialogTitle className="font-display italic text-lg">新增景點</DialogTitle>
```
To:
```tsx
<DialogTitle className="text-base font-bold">新增地點</DialogTitle>
```

Also update the submit button text label for consistency: `'新增中...'` → `'新增中…'` (optional, cosmetic).

- [ ] **Step 3: Update SpotDetailModal.tsx**

Change line:
```tsx
<DialogTitle className="font-display italic text-lg">{spot?.name}</DialogTitle>
```
To:
```tsx
<DialogTitle className="text-base font-bold">{spot?.name}</DialogTitle>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/AddCategoryModal.tsx frontend/src/components/AddSpotModal.tsx frontend/src/components/SpotDetailModal.tsx
git commit -m "feat: remove dark theme typography classes from modals"
```

---

## Self-Review

**Spec coverage:**
- ✓ Light/white background — covered in Task 1 CSS vars
- ✓ App renamed to 地點找找看 — covered in Tasks 7 & 8 page rewrites
- ✓ Plus Jakarta Sans + Noto Sans TC — covered in Task 1
- ✓ Orange `#ff6b35` accent — `--primary: 16 100% 60%` in Task 1
- ✓ Desktop: header + sidebar + 3-col grid — Task 8
- ✓ Mobile: stories row + 2-col grid — Task 7
- ✓ Spot gradient thumbnails — Tasks 5 & 6
- ✓ Emoji auto-assign by index — Task 2 + used in Tasks 3 & 4
- ✓ Maps link on SpotCard — Task 5
- ✓ Notes truncated 2 lines — Task 5 (`line-clamp-2`)
- ✓ Modals updated — Task 9

**Placeholder scan:** None found.

**Type consistency:**
- `CategoryCard` props: `{ category: Category, index: number, onClick: () => void }` — consistent across Tasks 3 & 7
- `CategoryListItem` props: `{ category: Category, index: number, isActive: boolean, onClick: () => void }` — consistent across Tasks 4 & 8
- `SpotCard` props: `{ spot: Spot, index: number, onClick: () => void }` — consistent across Tasks 5 & 8
- `SpotListItem` props: `{ spot: Spot, index: number, onClick: () => void }` — consistent across Tasks 6 & 8
- `getAutoEmoji`, `getCategoryColor`, `getSpotGradient` defined in Task 2, imported in Tasks 3, 4, 5, 6, 7

**One note:** `CategoryDetailPage` (Task 8) imports `useCategories` for the sidebar. This is already used in `HomePage` so TanStack Query will serve it from cache — no extra network request.
