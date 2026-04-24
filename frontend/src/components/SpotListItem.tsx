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
