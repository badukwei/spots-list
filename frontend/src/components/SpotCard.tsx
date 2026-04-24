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
