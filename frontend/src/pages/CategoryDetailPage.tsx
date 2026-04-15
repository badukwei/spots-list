import { useState, useEffect } from 'react'
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

  const { data: category, isLoading: catLoading, error: catError } = useCategory(id)
  const { data: spots, isLoading: spotsLoading, error: spotsError } = useSpots(id)

  useEffect(() => {
    if (catError) navigate('/', { replace: true })
  }, [catError, navigate])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <div className="mb-6 h-8 w-56 animate-pulse rounded bg-muted" />
        ) : (
          <h2 className="mb-6 font-display italic text-2xl text-foreground">{category?.name}</h2>
        )}

        {spotsLoading && (
          <p className="text-center text-sm text-muted-foreground py-12">載入中...</p>
        )}

        {spotsError && (
          <p className="text-center text-sm text-destructive py-12">載入失敗，請重新整理</p>
        )}

        {spots && spots.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">
            這個分類還沒有景點，來新增第一個吧！
          </p>
        )}

        {spots && spots.length > 0 && (
          <>
            {/* Desktop: grid */}
            <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
              {spots.map((spot, i) => (
                <div key={spot.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <SpotCard spot={spot} onClick={() => setSelectedSpot(spot)} />
                </div>
              ))}
            </div>
            {/* Mobile: list */}
            <div className="flex flex-col gap-2 md:hidden">
              {spots.map((spot, i) => (
                <div key={spot.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <SpotListItem spot={spot} onClick={() => setSelectedSpot(spot)} />
                </div>
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
