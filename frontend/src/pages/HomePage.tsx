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
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="font-display italic text-xl text-foreground tracking-tight">Spots List</h1>
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
          <p className="text-center text-sm text-muted-foreground py-12">載入中...</p>
        )}

        {error && (
          <p className="text-center text-sm text-destructive py-12">載入失敗，請重新整理</p>
        )}

        {categories && categories.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">
            {search ? '找不到符合的分類' : '還沒有分類，來新增第一個吧！'}
          </p>
        )}

        {categories && categories.length > 0 && (
          <>
            {/* Desktop: grid */}
            <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat, i) => (
                <div key={cat.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <CategoryCard
                    category={cat}
                    index={i + 1}
                    onClick={() => handleCategoryClick(cat.id)}
                  />
                </div>
              ))}
            </div>
            {/* Mobile: list */}
            <div className="flex flex-col gap-2 md:hidden">
              {categories.map((cat, i) => (
                <div key={cat.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <CategoryListItem
                    category={cat}
                    index={i + 1}
                    onClick={() => handleCategoryClick(cat.id)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <AddCategoryModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
