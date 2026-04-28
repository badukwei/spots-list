// frontend/src/components/SpotListItem.tsx
import { ChevronRight, Trash2 } from 'lucide-react'
import type { Spot } from '@/types'
import { getSpotGradient } from '@/lib/emoji'

interface Props {
  spot: Spot
  index: number
  onClick: () => void
  onDelete?: () => void
}

export function SpotListItem({ spot, index, onClick, onDelete }: Props) {
  const gradient = getSpotGradient(index)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className="group flex w-full items-center gap-3 border-b border-border bg-background px-4 py-3 text-left last:border-b-0 hover:bg-muted/50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
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
      {onDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="刪除地點"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors duration-150" />
    </div>
  )
}
