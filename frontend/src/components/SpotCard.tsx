// frontend/src/components/SpotCard.tsx
import { Trash2 } from 'lucide-react'
import type { Spot } from '@/types'
import { getSpotGradient } from '@/lib/emoji'

interface Props {
  spot: Spot
  index: number
  onClick: () => void
  onDelete?: () => void
}

export function SpotCard({ spot, index, onClick, onDelete }: Props) {
  const gradient = getSpotGradient(index)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className="group w-full text-left rounded-xl border border-border bg-card p-4 hover:border-gray-200 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div
          className="h-10 w-10 shrink-0 rounded-xl"
          style={{ background: gradient }}
        />
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="刪除地點"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
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
      {spot.mapsUrl && (
        <div className="mt-2 flex justify-end">
          <a
            href={spot.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-primary hover:underline"
          >
            地圖 ↗
          </a>
        </div>
      )}
    </div>
  )
}
