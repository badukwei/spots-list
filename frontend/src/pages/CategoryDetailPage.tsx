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
