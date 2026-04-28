// frontend/src/components/SpotListItem.tsx
import { ChevronRight, Pencil, Trash2 } from 'lucide-react'
import type { Spot } from '@/types'
import { getSpotGradient } from '@/lib/emoji'

interface Props {
  spot: Spot
  index: number
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function SpotListItem({ spot, index, onClick, onEdit, onDelete }: Props) {
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
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {spot.address ? `📍 ${spot.address}` : '未提供地址'}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="編輯地點"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="刪除地點"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors duration-150" />
    </div>
  )
}
