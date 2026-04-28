// frontend/src/pages/HomePage.tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories, useDeleteCategory } from '@/hooks/useCategories'
import { CategoryCard } from '@/components/CategoryCard'
import { AddCategoryModal } from '@/components/AddCategoryModal'
import { EditCategoryModal } from '@/components/EditCategoryModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { getAutoEmoji, getCategoryColor } from '@/lib/emoji'
import type { Category } from '@/types'

export function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const debouncedSearch = useDebounce(search, 300)
  const deleteCategory = useDeleteCategory()
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
        {categories && categories.data.length > 0 && (
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
              {categories.data.map((cat, i) => {
                const color = getCategoryColor(i)
                const emoji = cat.emoji ?? getAutoEmoji(i)
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
        {categories && categories.data.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {search ? '找不到符合的分類' : '還沒有分類，來新增第一個吧！'}
          </p>
        )}

        {/* Category grid */}
        {categories && categories.data.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {categories.data.map((cat, i) => (
              <div key={cat.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <CategoryCard
                  category={cat}
                  index={i}
                  onClick={() => handleCategoryClick(cat.id)}
                  onEdit={() => setEditingCategory(cat)}
                  onDelete={() => setDeletingCategory(cat)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <AddCategoryModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditCategoryModal category={editingCategory} onClose={() => setEditingCategory(null)} />
      <ConfirmDialog
        open={deletingCategory !== null}
        title="刪除分類"
        description={`確定要刪除「${deletingCategory?.name}」嗎？底下的地點也會一起刪除。`}
        onConfirm={async () => {
          if (deletingCategory) {
            await deleteCategory.mutateAsync(deletingCategory.id)
            setDeletingCategory(null)
          }
        }}
        onClose={() => setDeletingCategory(null)}
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}
